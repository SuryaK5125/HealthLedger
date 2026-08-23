const Record = require("../models/Record");
const { pick } = require("../utils/controllerHelpers");
const { uploadBuffer, deleteAsset, isConfigured } = require("../utils/cloudinary");

// The file itself is never client-supplied metadata; Cloudinary decides the
// url, public id and resource type.
const CREATE_FIELDS = ["type", "notes"];
// The stored file is immutable; only the descriptive metadata can be edited.
const UPDATE_FIELDS = ["type", "notes"];

// Cloudinary and MongoDB cannot share a transaction, so the upload is done
// first and undone by hand if the database write then fails.
exports.createRecord = async (req, res, next) => {
  if (!isConfigured()) {
    return res.status(503).json({ message: "File storage is not configured" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "A file is required" });
  }

  let uploaded;
  try {
    uploaded = await uploadBuffer(req.file.buffer);
  } catch (err) {
    // Nothing was stored, so there is nothing to undo.
    return next(err);
  }

  try {
    const record = await Record.create({
      ...pick(req.body, CREATE_FIELDS),
      profileId: req.profile._id,
      cloudinaryUrl: uploaded.secure_url,
      cloudinaryPublicId: uploaded.public_id,
      resourceType: uploaded.resource_type,
    });
    return res.status(201).json(record);
  } catch (dbErr) {
    // Compensating action: the file exists in Cloudinary but has no database
    // row pointing at it, so remove it rather than leave it orphaned.
    try {
      await deleteAsset(uploaded.public_id, uploaded.resource_type);
    } catch (cleanupErr) {
      console.error(
        `Orphaned Cloudinary asset ${uploaded.public_id} (${uploaded.resource_type}): ` +
          `record creation failed and cleanup also failed.`,
        cleanupErr
      );
    }
    return next(dbErr);
  }
};

exports.listRecords = async (req, res, next) => {
  try {
    const records = await Record.find({ profileId: req.profile._id }).sort({
      uploadDate: -1,
    });
    return res.json(records);
  } catch (err) {
    return next(err);
  }
};

exports.getRecord = async (req, res) => {
  return res.json(req.resource);
};

exports.updateRecord = async (req, res, next) => {
  try {
    Object.assign(req.resource, pick(req.body, UPDATE_FIELDS));
    const updated = await req.resource.save();
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// The asset is removed before the row so that a failure part-way through can
// simply be retried: deleting an already-deleted asset succeeds, and the row
// is still present to drive the retry.
exports.deleteRecord = async (req, res, next) => {
  const { cloudinaryPublicId, resourceType } = req.resource;

  try {
    if (cloudinaryPublicId && isConfigured()) {
      await deleteAsset(cloudinaryPublicId, resourceType);
    }
  } catch (err) {
    return next(err);
  }

  try {
    await req.resource.deleteOne();
    return res.json({ message: "Record deleted" });
  } catch (err) {
    return next(err);
  }
};

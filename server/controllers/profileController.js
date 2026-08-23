const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const Medication = require("../models/Medication");
const Record = require("../models/Record");
const Appointment = require("../models/Appointment");
const { pick } = require("../utils/controllerHelpers");
const { deleteAsset, isConfigured } = require("../utils/cloudinary");

// userId is never accepted from the client; it always comes from the token.
const CREATE_FIELDS = ["name", "dob", "gender", "bloodGroup"];
const UPDATE_FIELDS = ["name", "dob", "gender", "bloodGroup"];

exports.createProfile = async (req, res, next) => {
  try {
    const profile = await Profile.create({
      ...pick(req.body, CREATE_FIELDS),
      userId: req.userId,
    });
    return res.status(201).json(profile);
  } catch (err) {
    return next(err);
  }
};

exports.listProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    return res.json(profiles);
  } catch (err) {
    return next(err);
  }
};

// Ownership middleware has already loaded and authorised req.profile.
exports.getProfile = async (req, res) => {
  return res.json(req.profile);
};

exports.updateProfile = async (req, res, next) => {
  try {
    Object.assign(req.profile, pick(req.body, UPDATE_FIELDS));
    const updated = await req.profile.save();
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// Removes the profile and everything hanging off it in a single transaction,
// so a mid-way failure cannot leave children without a parent.
exports.deleteProfile = async (req, res, next) => {
  const profileId = req.profile._id;
  const session = await mongoose.startSession();

  try {
    // Read the file references before the rows are removed, so the stored
    // files can still be found afterwards.
    const assets = await Record.find(
      { profileId },
      "cloudinaryPublicId resourceType"
    ).lean();

    let deleted;
    await session.withTransaction(async () => {
      const [medications, records, appointments] = await Promise.all([
        Medication.deleteMany({ profileId }, { session }),
        Record.deleteMany({ profileId }, { session }),
        Appointment.deleteMany({ profileId }, { session }),
      ]);
      await Profile.deleteOne({ _id: profileId }, { session });
      deleted = {
        medications: medications.deletedCount,
        records: records.deletedCount,
        appointments: appointments.deletedCount,
      };
    });

    // Only once the database changes have committed. Cloudinary calls cannot
    // join the transaction, so these are best-effort: a failure here leaves an
    // unreferenced file behind but does not affect the user's data.
    const orphaned = await cleanUpAssets(assets);

    return res.json({ message: "Profile deleted", deleted, orphanedAssets: orphaned });
  } catch (err) {
    return next(err);
  } finally {
    session.endSession();
  }
};

async function cleanUpAssets(assets) {
  if (!assets.length || !isConfigured()) {
    return 0;
  }

  const results = await Promise.allSettled(
    assets
      .filter((a) => a.cloudinaryPublicId)
      .map((a) => deleteAsset(a.cloudinaryPublicId, a.resourceType))
  );

  const failures = results.filter((r) => r.status === "rejected");
  for (const failure of failures) {
    console.error("Failed to delete Cloudinary asset after profile delete:", failure.reason);
  }
  return failures.length;
}

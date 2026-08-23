const Medication = require("../models/Medication");
const { pick } = require("../utils/controllerHelpers");

// profileId is taken from the authorised req.profile, never from the body.
const CREATE_FIELDS = ["name", "dosage", "frequency", "startDate", "endDate"];
// Reassigning a medication to another profile is not allowed, so profileId is
// deliberately absent here.
const UPDATE_FIELDS = ["name", "dosage", "frequency", "startDate", "endDate"];

exports.createMedication = async (req, res, next) => {
  try {
    const medication = await Medication.create({
      ...pick(req.body, CREATE_FIELDS),
      profileId: req.profile._id,
    });
    return res.status(201).json(medication);
  } catch (err) {
    return next(err);
  }
};

exports.listMedications = async (req, res, next) => {
  try {
    const medications = await Medication.find({
      profileId: req.profile._id,
    }).sort({ createdAt: -1 });
    return res.json(medications);
  } catch (err) {
    return next(err);
  }
};

exports.getMedication = async (req, res) => {
  return res.json(req.resource);
};

exports.updateMedication = async (req, res, next) => {
  try {
    Object.assign(req.resource, pick(req.body, UPDATE_FIELDS));
    const updated = await req.resource.save();
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

exports.deleteMedication = async (req, res, next) => {
  try {
    await req.resource.deleteOne();
    return res.json({ message: "Medication deleted" });
  } catch (err) {
    return next(err);
  }
};

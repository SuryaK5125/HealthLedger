const Appointment = require("../models/Appointment");
const { pick } = require("../utils/controllerHelpers");

const CREATE_FIELDS = ["doctor", "specialty", "location", "date", "notes"];
const UPDATE_FIELDS = ["doctor", "specialty", "location", "date", "notes"];

exports.createAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.create({
      ...pick(req.body, CREATE_FIELDS),
      profileId: req.profile._id,
    });
    return res.status(201).json(appointment);
  } catch (err) {
    return next(err);
  }
};

// Sorted chronologically; filtering to upcoming is left to the caller so the
// same endpoint can serve both the dashboard and a full history view.
exports.listAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      profileId: req.profile._id,
    }).sort({ date: 1 });
    return res.json(appointments);
  } catch (err) {
    return next(err);
  }
};

exports.getAppointment = async (req, res) => {
  return res.json(req.resource);
};

exports.updateAppointment = async (req, res, next) => {
  try {
    Object.assign(req.resource, pick(req.body, UPDATE_FIELDS));
    const updated = await req.resource.save();
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    await req.resource.deleteOne();
    return res.json({ message: "Appointment deleted" });
  } catch (err) {
    return next(err);
  }
};

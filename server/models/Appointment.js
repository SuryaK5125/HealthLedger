const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    doctor: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ profileId: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);

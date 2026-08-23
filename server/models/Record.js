const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "raw", "video"],
      default: "image",
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

recordSchema.index({ profileId: 1 });

module.exports = mongoose.model("Record", recordSchema);

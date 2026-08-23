const { body, check } = require("express-validator");

const profileId = check("profileId")
  .isMongoId()
  .withMessage("A valid profileId is required");

exports.listRules = [profileId];

// The file arrives as multipart data and its Cloudinary details are derived
// server-side, so only the descriptive fields are validated here.
exports.createRules = [
  profileId,
  body("type").trim().notEmpty().withMessage("Record type is required")
    .isLength({ max: 100 }),
  body("notes").optional().trim().isLength({ max: 2000 })
    .withMessage("Notes must be 2000 characters or fewer"),
];

// The stored file is immutable, so only descriptive metadata is editable.
exports.updateRules = [
  body("type").optional().trim().notEmpty().withMessage("Record type cannot be empty")
    .isLength({ max: 100 }),
  body("notes").optional().trim().isLength({ max: 2000 })
    .withMessage("Notes must be 2000 characters or fewer"),
];

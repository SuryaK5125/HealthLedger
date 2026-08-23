const { body, check } = require("express-validator");

const profileId = check("profileId")
  .isMongoId()
  .withMessage("A valid profileId is required");

exports.listRules = [profileId];

exports.createRules = [
  profileId,
  body("doctor").trim().notEmpty().withMessage("Doctor name is required")
    .isLength({ max: 200 }).withMessage("Doctor name must be 200 characters or fewer"),
  body("date").isISO8601().withMessage("Appointment date must be a valid date").toDate(),
  body("specialty").optional().trim().isLength({ max: 200 }),
  body("location").optional().trim().isLength({ max: 300 }),
  body("notes").optional().trim().isLength({ max: 2000 })
    .withMessage("Notes must be 2000 characters or fewer"),
];

exports.updateRules = [
  body("doctor").optional().trim().notEmpty().withMessage("Doctor name cannot be empty")
    .isLength({ max: 200 }),
  body("date").optional().isISO8601().withMessage("Appointment date must be a valid date").toDate(),
  body("specialty").optional().trim().isLength({ max: 200 }),
  body("location").optional().trim().isLength({ max: 300 }),
  body("notes").optional().trim().isLength({ max: 2000 })
    .withMessage("Notes must be 2000 characters or fewer"),
];

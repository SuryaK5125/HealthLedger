const { body, check } = require("express-validator");

// profileId may arrive in the body (create) or the query string (list).
const profileId = check("profileId")
  .isMongoId()
  .withMessage("A valid profileId is required");

exports.listRules = [profileId];

exports.createRules = [
  profileId,
  body("name").trim().notEmpty().withMessage("Medicine name is required")
    .isLength({ max: 200 }).withMessage("Name must be 200 characters or fewer"),
  body("dosage").trim().notEmpty().withMessage("Dosage is required"),
  body("frequency").trim().notEmpty().withMessage("Frequency is required"),
  body("startDate").isISO8601().withMessage("Start date must be a valid date").toDate(),
  body("endDate").optional({ nullable: true }).isISO8601()
    .withMessage("End date must be a valid date").toDate(),
];

exports.updateRules = [
  body("name").optional().trim().notEmpty().withMessage("Medicine name cannot be empty")
    .isLength({ max: 200 }).withMessage("Name must be 200 characters or fewer"),
  body("dosage").optional().trim().notEmpty().withMessage("Dosage cannot be empty"),
  body("frequency").optional().trim().notEmpty().withMessage("Frequency cannot be empty"),
  body("startDate").optional().isISO8601().withMessage("Start date must be a valid date").toDate(),
  body("endDate").optional({ nullable: true }).isISO8601()
    .withMessage("End date must be a valid date").toDate(),
];

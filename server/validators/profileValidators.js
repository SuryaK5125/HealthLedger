const { body } = require("express-validator");
const Profile = require("../models/Profile");

// Read the allowed values straight off the schema so the API contract and the
// storage contract cannot drift apart.
const GENDERS = Profile.schema.path("gender").enumValues;
const BLOOD_GROUPS = Profile.schema.path("bloodGroup").enumValues;

exports.createRules = [
  body("name").trim().notEmpty().withMessage("Name is required")
    .isLength({ max: 100 }).withMessage("Name must be 100 characters or fewer"),
  body("dob").isISO8601().withMessage("Date of birth must be a valid date").toDate(),
  body("gender").isIn(GENDERS).withMessage(`Gender must be one of: ${GENDERS.join(", ")}`),
  body("bloodGroup").isIn(BLOOD_GROUPS).withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(", ")}`),
];

// Updates are partial, so every rule only applies when the field is present.
exports.updateRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty")
    .isLength({ max: 100 }).withMessage("Name must be 100 characters or fewer"),
  body("dob").optional().isISO8601().withMessage("Date of birth must be a valid date").toDate(),
  body("gender").optional().isIn(GENDERS).withMessage(`Gender must be one of: ${GENDERS.join(", ")}`),
  body("bloodGroup").optional().isIn(BLOOD_GROUPS).withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(", ")}`),
];

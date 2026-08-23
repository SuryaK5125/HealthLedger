const { body } = require("express-validator");

const email = body("email")
  .trim()
  .isEmail()
  .withMessage("A valid email address is required")
  .toLowerCase();

exports.signupRules = [
  email,
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be 100 characters or fewer"),
];

exports.loginRules = [
  email,
  body("password").notEmpty().withMessage("Password is required"),
];

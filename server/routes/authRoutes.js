const express = require("express");
const authController = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const rules = require("../validators/authValidators");

const router = express.Router();

router.post("/signup", authLimiter, rules.signupRules, validate, authController.signup);
router.post("/login", authLimiter, rules.loginRules, validate, authController.login);
router.get("/me", requireAuth, authController.me);

module.exports = router;

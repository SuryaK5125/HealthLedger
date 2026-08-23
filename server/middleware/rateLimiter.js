const rateLimit = require("express-rate-limit");

// Limits repeated signup/login attempts from one IP, which is what makes
// online password guessing impractical.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

module.exports = { authLimiter };

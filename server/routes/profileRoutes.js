const express = require("express");
const controller = require("../controllers/profileController");
const requireAuth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { loadOwnedProfile } = require("../middleware/ownershipMiddleware");
const rules = require("../validators/profileValidators");

const router = express.Router();

// Every profile route requires a valid token.
router.use(requireAuth);

router.post("/", rules.createRules, validate, controller.createProfile);
router.get("/", controller.listProfiles);

// loadOwnedProfile 404s unless the profile belongs to the caller.
router.get("/:id", loadOwnedProfile, controller.getProfile);
router.put("/:id", rules.updateRules, validate, loadOwnedProfile, controller.updateProfile);
router.delete("/:id", loadOwnedProfile, controller.deleteProfile);

module.exports = router;

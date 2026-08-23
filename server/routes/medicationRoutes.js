const express = require("express");
const controller = require("../controllers/medicationController");
const Medication = require("../models/Medication");
const requireAuth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  requireProfileAccess,
  requireResourceOwnership,
} = require("../middleware/ownershipMiddleware");
const rules = require("../validators/medicationValidators");

const router = express.Router();

router.use(requireAuth);

// Create and list are scoped by the profile named in the body or query string.
router.post("/", rules.createRules, validate, requireProfileAccess, controller.createMedication);
router.get("/", rules.listRules, validate, requireProfileAccess, controller.listMedications);

// Routes for one existing medication resolve ownership through its own profile.
const owned = requireResourceOwnership(Medication);
router.get("/:id", owned, controller.getMedication);
router.put("/:id", rules.updateRules, validate, owned, controller.updateMedication);
router.delete("/:id", owned, controller.deleteMedication);

module.exports = router;

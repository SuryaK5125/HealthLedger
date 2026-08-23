const express = require("express");
const controller = require("../controllers/appointmentController");
const Appointment = require("../models/Appointment");
const requireAuth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  requireProfileAccess,
  requireResourceOwnership,
} = require("../middleware/ownershipMiddleware");
const rules = require("../validators/appointmentValidators");

const router = express.Router();

router.use(requireAuth);

router.post("/", rules.createRules, validate, requireProfileAccess, controller.createAppointment);
router.get("/", rules.listRules, validate, requireProfileAccess, controller.listAppointments);

const owned = requireResourceOwnership(Appointment);
router.get("/:id", owned, controller.getAppointment);
router.put("/:id", rules.updateRules, validate, owned, controller.updateAppointment);
router.delete("/:id", owned, controller.deleteAppointment);

module.exports = router;

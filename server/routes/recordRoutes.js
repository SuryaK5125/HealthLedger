const express = require("express");
const controller = require("../controllers/recordController");
const Record = require("../models/Record");
const requireAuth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { uploadSingleFile } = require("../middleware/upload");
const {
  requireProfileAccess,
  requireResourceOwnership,
} = require("../middleware/ownershipMiddleware");
const rules = require("../validators/recordValidators");

const router = express.Router();

router.use(requireAuth);

// multer has to run before the ownership check because the multipart body,
// including profileId, is not readable until it has been parsed. The file is
// only held in memory at that point; nothing reaches Cloudinary until the
// controller runs, after ownership has been confirmed.
router.post(
  "/",
  uploadSingleFile,
  rules.createRules,
  validate,
  requireProfileAccess,
  controller.createRecord
);
router.get("/", rules.listRules, validate, requireProfileAccess, controller.listRecords);

const owned = requireResourceOwnership(Record);
router.get("/:id", owned, controller.getRecord);
router.put("/:id", rules.updateRules, validate, owned, controller.updateRecord);
router.delete("/:id", owned, controller.deleteRecord);

module.exports = router;

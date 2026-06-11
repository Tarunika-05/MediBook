const express = require("express");
const { createSlot, deleteSlot, getMySlots } = require("../controllers/slotController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateSlot } = require("../utils/validators");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("DOCTOR"), validateSlot, createSlot)
  .get(protect, authorize("DOCTOR"), getMySlots);

router.route("/:id").delete(protect, authorize("DOCTOR"), deleteSlot);

module.exports = router;

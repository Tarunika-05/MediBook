const express = require("express");
const {
  getDoctors,
  getDoctorById,
  getDoctorSlots,
} = require("../controllers/doctorController");

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id/slots", getDoctorSlots);
router.get("/:id", getDoctorById);

module.exports = router;

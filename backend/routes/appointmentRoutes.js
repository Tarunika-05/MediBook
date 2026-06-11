const express = require("express");
const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDailySchedule,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateBooking } = require("../utils/validators");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("PATIENT"), validateBooking, bookAppointment)
  .get(protect, getMyAppointments);

router.get("/schedule/daily", protect, authorize("DOCTOR"), getDailySchedule);

router.route("/:id").delete(protect, authorize("PATIENT"), cancelAppointment);

module.exports = router;

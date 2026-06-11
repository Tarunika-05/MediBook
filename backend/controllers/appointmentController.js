const appointmentService = require("../services/appointmentService");

const bookAppointment = async (req, res, next) => {
  try {
    const { slotId } = req.body;
    const appointment = await appointmentService.bookAppointment(req.user.id, slotId);
    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    let result;

    if (req.user.role === "PATIENT") {
      result = await appointmentService.getAppointmentsForPatient(req.user.id, page, limit);
    } else {
      result = await appointmentService.getAppointmentsForDoctor(req.user.id, page, limit);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const result = await appointmentService.cancelAppointment(
      req.user.id,
      req.user.role,
      parseInt(req.params.id)
    );
    res.json(result);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const getDailySchedule = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const schedule = await appointmentService.getDailySchedule(req.user.id, date);
    res.json(schedule);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDailySchedule,
};

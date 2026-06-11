const doctorService = require("../services/doctorService");

const getDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const specialization = req.query.specialization || "";

    const result = await doctorService.getDoctors({ search, specialization, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(parseInt(req.params.id));
    res.json(doctor);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const getDoctorSlots = async (req, res, next) => {
  try {
    const status = req.query.status || undefined;
    const slots = await doctorService.getDoctorSlots(parseInt(req.params.id), status);
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getDoctorById, getDoctorSlots };

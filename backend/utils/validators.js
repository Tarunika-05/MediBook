const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    return next(new Error("Name, email, and password are required"));
  }

  if (password.length < 6) {
    res.status(400);
    return next(new Error("Password must be at least 6 characters"));
  }

  if (role && !["PATIENT", "DOCTOR"].includes(role)) {
    res.status(400);
    return next(new Error("Role must be PATIENT or DOCTOR"));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error("Email and password are required"));
  }

  next();
};

const validateSlot = (req, res, next) => {
  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    res.status(400);
    return next(new Error("startTime and endTime are required"));
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400);
    return next(new Error("Invalid date format"));
  }

  if (end <= start) {
    res.status(400);
    return next(new Error("endTime must be after startTime"));
  }

  if (start <= new Date()) {
    res.status(400);
    return next(new Error("Slot must be in the future"));
  }

  next();
};

const validateBooking = (req, res, next) => {
  const { slotId } = req.body;

  if (!slotId) {
    res.status(400);
    return next(new Error("slotId is required"));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateSlot,
  validateBooking,
};

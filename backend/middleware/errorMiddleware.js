const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err, "Express errorHandler caught an exception");

  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "An unexpected error occurred";
  let fields = err.fields || undefined;

  // Map database constraints to standard client errors
  if (err.code === "23P01") {
    statusCode = 409;
    code = "SLOT_OVERLAP";
    message = "Slot time overlaps with an existing slot";
  } else if (err.code === "23505" && err.constraint === "appointments_slot_id_key") {
    statusCode = 409;
    code = "SLOT_ALREADY_BOOKED";
    message = "Slot already booked";
  }

  // If it's not operational (unknown programmer error), sanitize message in production
  if (!err.isOperational && statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "Internal Server Error";
  }

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (fields) response.error.fields = fields;
  if (process.env.NODE_ENV !== "production") response.error.stack = err.stack;

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };

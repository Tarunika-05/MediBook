const jwt = require("jsonwebtoken");
const pool = require("../database/pool");
const { UnauthorizedError, ForbiddenError } = require("../utils/AppError");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { rows } = await pool.query(
        "SELECT id, role FROM users WHERE id = $1",
        [decoded.id]
      );

      if (rows.length === 0) {
        return next(new UnauthorizedError("Not authorized, user not found"));
      }

      req.user = rows[0];
      next();
    } catch (error) {
      next(new UnauthorizedError("Not authorized, token failed"));
    }
  } else {
    next(new UnauthorizedError("Not authorized, no token"));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Role ${req.user?.role || "unknown"} is not authorized`));
    }
    next();
  };
};

module.exports = { protect, authorize };

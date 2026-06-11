const express = require("express");
const { getDashboardData } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("DOCTOR"), getDashboardData);

module.exports = router;

const express = require("express");
const { getRecommendations } = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", getRecommendations);

module.exports = router;

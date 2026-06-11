const recommendationService = require("../services/recommendationService");

const getRecommendations = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || typeof symptoms !== "string") {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "symptoms field is required and must be a string",
        },
      });
    }

    const triage = await recommendationService.getRecommendations(symptoms.substring(0, 1000));
    res.json({
      success: true,
      data: triage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations };

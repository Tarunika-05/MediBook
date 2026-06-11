const analyticsService = require("../services/analyticsService");

const getDashboardData = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const [bookings, specs, utilization, peak, cancellation, summary] = await Promise.all([
      analyticsService.getBookingsOverTime(from, to),
      analyticsService.getSpecializationBreakdown(),
      analyticsService.getDoctorUtilization(),
      analyticsService.getPeakHours(),
      analyticsService.getCancellationRate(),
      analyticsService.getSummary()
    ]);

    res.json({
      success: true,
      data: {
        bookingsOverTime: bookings,
        specializationBreakdown: specs,
        doctorUtilization: utilization,
        peakHours: peak,
        cancellationSummary: cancellation,
        kpiSummary: summary
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardData };

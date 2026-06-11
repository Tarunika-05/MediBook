const slotService = require("../services/slotService");

const createSlot = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    const slot = await slotService.createSlot(req.user.id, new Date(startTime), new Date(endTime));
    res.status(201).json(slot);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const getMySlots = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const slots = await slotService.getMySlots(req.user.id, page, limit);
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    const result = await slotService.deleteSlot(req.user.id, parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

module.exports = { createSlot, getMySlots, deleteSlot };

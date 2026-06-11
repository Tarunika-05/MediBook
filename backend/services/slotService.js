const pool = require("../database/pool");
const { SLOT_STATUS } = require("../models/constants");
const { NotFoundError, ConflictError, ForbiddenError, ValidationError } = require("../utils/AppError");

const getDoctorByUserId = async (userId) => {
  const { rows } = await pool.query(
    "SELECT id, user_id FROM doctors WHERE user_id = $1",
    [userId]
  );
  return rows[0] || null;
};

const hasOverlappingSlot = async (client, doctorId, startTime, endTime, excludeSlotId = null) => {
  const params = [doctorId, startTime, endTime];
  let excludeClause = "";

  if (excludeSlotId) {
    excludeClause = "AND id != $4";
    params.push(excludeSlotId);
  }

  const { rows } = await client.query(
    `SELECT id FROM slots
     WHERE doctor_id = $1
       AND start_time < $3
       AND end_time > $2
       ${excludeClause}
     LIMIT 1`,
    params
  );

  return rows.length > 0;
};

const createSlot = async (userId, startTime, endTime) => {
  const doctor = await getDoctorByUserId(userId);

  if (!doctor) {
    throw new NotFoundError("Doctor profile");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const overlap = await hasOverlappingSlot(client, doctor.id, startTime, endTime);
    if (overlap) {
      throw new ConflictError("Slot time overlaps with an existing slot");
    }

    const { rows } = await client.query(
      `INSERT INTO slots (doctor_id, start_time, end_time, status)
       VALUES ($1, $2, $3, 'AVAILABLE')
       RETURNING id, doctor_id, start_time, end_time, status`,
      [doctor.id, startTime, endTime]
    );

    await client.query("COMMIT");

    const slot = rows[0];
    return {
      id: slot.id,
      doctorId: slot.doctor_id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      status: slot.status,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getMySlots = async (userId, page = 1, limit = 10) => {
  const doctor = await getDoctorByUserId(userId);

  if (!doctor) {
    throw new NotFoundError("Doctor profile");
  }

  const offset = (page - 1) * limit;
  const countResult = await pool.query(
    "SELECT COUNT(*)::int AS total FROM slots WHERE doctor_id = $1",
    [doctor.id]
  );
  const total = countResult.rows[0].total;

  const { rows } = await pool.query(
    `SELECT id, doctor_id, start_time, end_time, status
     FROM slots
     WHERE doctor_id = $1
     ORDER BY start_time DESC
     LIMIT $2 OFFSET $3`,
    [doctor.id, limit, offset]
  );

  return {
    data: rows.map((s) => ({
      id: s.id,
      doctorId: s.doctor_id,
      startTime: s.start_time,
      endTime: s.end_time,
      status: s.status,
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const deleteSlot = async (userId, slotId) => {
  const doctor = await getDoctorByUserId(userId);

  if (!doctor) {
    throw new NotFoundError("Doctor profile");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT * FROM slots WHERE id = $1 FOR UPDATE",
      [slotId]
    );

    if (rows.length === 0) {
      throw new NotFoundError("Slot");
    }

    const slot = rows[0];

    if (slot.doctor_id !== doctor.id) {
      throw new ForbiddenError("Not authorized to delete this slot");
    }

    if (slot.status === SLOT_STATUS.BOOKED) {
      throw new ValidationError("Cannot delete a booked slot");
    }

    await client.query("DELETE FROM slots WHERE id = $1", [slotId]);
    await client.query("COMMIT");
    return { message: "Slot deleted successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createSlot, getMySlots, deleteSlot, getDoctorByUserId };

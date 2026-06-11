const pool = require("../database/pool");
const { NotFoundError } = require("../utils/AppError");

const getDoctors = async ({ search, specialization, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`u.name ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (specialization) {
    conditions.push(`d.specialization ILIKE $${paramIndex}`);
    params.push(`%${specialization}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM doctors d
     JOIN users u ON d.user_id = u.id
     ${whereClause}`,
    params
  );

  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT d.id, d.user_id, d.specialization, d.experience_years,
            d.consultation_fee, d.bio,
            u.name, u.email
     FROM doctors d
     JOIN users u ON d.user_id = u.id
     ${whereClause}
     ORDER BY d.experience_years DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  const total = countResult.rows[0].total;

  return {
    data: rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      specialization: row.specialization,
      experienceYears: row.experience_years,
      consultationFee: parseFloat(row.consultation_fee),
      bio: row.bio,
      user: { name: row.name, email: row.email },
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getDoctorById = async (id) => {
  const { rows } = await pool.query(
    `SELECT d.id, d.user_id, d.specialization, d.experience_years,
            d.consultation_fee, d.bio,
            u.name, u.email
     FROM doctors d
     JOIN users u ON d.user_id = u.id
     WHERE d.id = $1`,
    [id]
  );

  if (rows.length === 0) {
    throw new NotFoundError("Doctor");
  }

  const row = rows[0];

  const slotsResult = await pool.query(
    `SELECT id, start_time, end_time, status
     FROM slots
     WHERE doctor_id = $1 AND status = 'AVAILABLE' AND start_time > NOW()
     ORDER BY start_time ASC`,
    [id]
  );

  return {
    id: row.id,
    userId: row.user_id,
    specialization: row.specialization,
    experienceYears: row.experience_years,
    consultationFee: parseFloat(row.consultation_fee),
    bio: row.bio,
    user: { name: row.name, email: row.email },
    slots: slotsResult.rows.map((s) => ({
      id: s.id,
      startTime: s.start_time,
      endTime: s.end_time,
      status: s.status,
    })),
  };
};

const getDoctorSlots = async (doctorId, status) => {
  const conditions = ["doctor_id = $1"];
  const params = [doctorId];

  if (status) {
    conditions.push("status = $2");
    params.push(status);
  }

  const { rows } = await pool.query(
    `SELECT id, doctor_id, start_time, end_time, status
     FROM slots
     WHERE ${conditions.join(" AND ")}
     ORDER BY start_time ASC`,
    params
  );

  return rows.map((s) => ({
    id: s.id,
    doctorId: s.doctor_id,
    startTime: s.start_time,
    endTime: s.end_time,
    status: s.status,
  }));
};

module.exports = { getDoctors, getDoctorById, getDoctorSlots };

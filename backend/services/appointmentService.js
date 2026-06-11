const pool = require("../database/pool");
const { getDoctorByUserId } = require("./slotService");
const { ROLES, SLOT_STATUS, APPOINTMENT_STATUS } = require("../models/constants");
const { NotFoundError, ConflictError, ForbiddenError, ValidationError } = require("../utils/AppError");
const { notifyUser } = require("../socket");

const bookAppointment = async (patientId, slotId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const slotResult = await client.query(
      `SELECT s.*, d.user_id as doctor_user_id 
       FROM slots s 
       JOIN doctors d ON s.doctor_id = d.id 
       WHERE s.id = $1 FOR UPDATE`,
      [slotId]
    );

    if (slotResult.rows.length === 0) {
      throw new NotFoundError("Slot");
    }

    const slot = slotResult.rows[0];

    if (slot.status !== SLOT_STATUS.AVAILABLE) {
      throw new ConflictError("Slot already booked");
    }

    const appointmentResult = await client.query(
      `INSERT INTO appointments (patient_id, slot_id, status)
       VALUES ($1, $2, 'BOOKED')
       RETURNING id, patient_id, slot_id, status, created_at`,
      [patientId, slotId]
    );

    await client.query(
      "UPDATE slots SET status = 'BOOKED' WHERE id = $1",
      [slotId]
    );

    await client.query("COMMIT");

    const appointment = appointmentResult.rows[0];
    
    // Notify users
    notifyUser(slot.doctor_user_id, "appointment_booked", { appointmentId: appointment.id, slotId });
    notifyUser(patientId, "appointment_booked", { appointmentId: appointment.id, slotId });

    return {
      id: appointment.id,
      patientId: appointment.patient_id,
      slotId: appointment.slot_id,
      status: appointment.status,
      createdAt: appointment.created_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const cancelAppointment = async (userId, role, appointmentId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const appointmentResult = await client.query(
      `SELECT a.*, s.doctor_id, d.user_id as doctor_user_id
       FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       JOIN doctors d ON s.doctor_id = d.id
       WHERE a.id = $1
       FOR UPDATE`,
      [appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      throw new NotFoundError("Appointment");
    }

    const appointment = appointmentResult.rows[0];

    if (role === ROLES.PATIENT && appointment.patient_id !== userId) {
      throw new ForbiddenError("Not authorized to cancel this appointment");
    }

    if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
      throw new ValidationError("Appointment already cancelled");
    }

    await client.query(
      "UPDATE appointments SET status = 'CANCELLED' WHERE id = $1",
      [appointmentId]
    );

    await client.query(
      "UPDATE slots SET status = 'AVAILABLE' WHERE id = $1",
      [appointment.slot_id]
    );

    await client.query("COMMIT");
    
    // Notify users
    notifyUser(appointment.doctor_user_id, "appointment_cancelled", { appointmentId: appointment.id, slotId: appointment.slot_id });
    notifyUser(appointment.patient_id, "appointment_cancelled", { appointmentId: appointment.id, slotId: appointment.slot_id });

    return { message: "Appointment cancelled successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getAppointmentsForPatient = async (patientId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const countResult = await pool.query(
    "SELECT COUNT(*)::int AS total FROM appointments WHERE patient_id = $1",
    [patientId]
  );
  const total = countResult.rows[0].total;

  const { rows } = await pool.query(
    `SELECT a.id, a.patient_id, a.slot_id, a.status, a.created_at,
            s.start_time, s.end_time,
            d.id AS doctor_id, d.specialization,
            u.name AS doctor_name
     FROM appointments a
     JOIN slots s ON a.slot_id = s.id
     JOIN doctors d ON s.doctor_id = d.id
     JOIN users u ON d.user_id = u.id
     WHERE a.patient_id = $1
     ORDER BY s.start_time DESC
     LIMIT $2 OFFSET $3`,
    [patientId, limit, offset]
  );

  return {
    data: rows.map(formatAppointment),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAppointmentsForDoctor = async (userId, page = 1, limit = 10) => {
  const doctor = await getDoctorByUserId(userId);

  if (!doctor) {
    throw new NotFoundError("Doctor profile");
  }

  const offset = (page - 1) * limit;
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total 
     FROM appointments a
     JOIN slots s ON a.slot_id = s.id
     WHERE s.doctor_id = $1`,
    [doctor.id]
  );
  const total = countResult.rows[0].total;

  const { rows } = await pool.query(
    `SELECT a.id, a.patient_id, a.slot_id, a.status, a.created_at,
            s.start_time, s.end_time,
            d.id AS doctor_id, d.specialization,
            u.name AS doctor_name,
            p.name AS patient_name, p.email AS patient_email
     FROM appointments a
     JOIN slots s ON a.slot_id = s.id
     JOIN doctors d ON s.doctor_id = d.id
     JOIN users u ON d.user_id = u.id
     JOIN users p ON a.patient_id = p.id
     WHERE s.doctor_id = $1
     ORDER BY s.start_time DESC
     LIMIT $2 OFFSET $3`,
    [doctor.id, limit, offset]
  );

  return {
    data: rows.map((row) => ({
      ...formatAppointment(row),
      patient: { name: row.patient_name, email: row.patient_email },
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getDailySchedule = async (userId, date) => {
  const doctor = await getDoctorByUserId(userId);

  if (!doctor) {
    throw new NotFoundError("Doctor profile");
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { rows } = await pool.query(
    `SELECT a.id, a.patient_id, a.slot_id, a.status, a.created_at,
            s.start_time, s.end_time,
            p.name AS patient_name, p.email AS patient_email
     FROM appointments a
     JOIN slots s ON a.slot_id = s.id
     JOIN users p ON a.patient_id = p.id
     WHERE s.doctor_id = $1
       AND s.start_time >= $2
       AND s.start_time <= $3
       AND a.status = 'BOOKED'
     ORDER BY s.start_time ASC`,
    [doctor.id, startOfDay, endOfDay]
  );

  return rows.map((row) => ({
    id: row.id,
    slotId: row.slot_id,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    patient: { name: row.patient_name, email: row.patient_email },
  }));
};

function formatAppointment(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    slotId: row.slot_id,
    status: row.status,
    createdAt: row.created_at,
    slot: {
      startTime: row.start_time,
      endTime: row.end_time,
      doctor: {
        id: row.doctor_id,
        specialization: row.specialization,
        user: { name: row.doctor_name },
      },
    },
  };
}

module.exports = {
  bookAppointment,
  cancelAppointment,
  getAppointmentsForPatient,
  getAppointmentsForDoctor,
  getDailySchedule,
};

const pool = require("../database/pool");

const getBookingsOverTime = async (from, to) => {
  const startDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const endDate = to || new Date().toISOString().split("T")[0];

  const query = `
    WITH date_range AS (
      SELECT generate_series($1::date, $2::date, '1 day')::date AS date
    ),
    daily_bookings AS (
      SELECT DATE(created_at) AS date, COUNT(*)::int AS count
      FROM appointments
      WHERE created_at BETWEEN $1::timestamp AND ($2::date + interval '1 day')::timestamp
      GROUP BY DATE(created_at)
    )
    SELECT dr.date::text AS date, COALESCE(db.count, 0) AS bookings
    FROM date_range dr
    LEFT JOIN daily_bookings db ON dr.date = db.date
    ORDER BY dr.date;
  `;

  const { rows } = await pool.query(query, [startDate, endDate]);
  return rows;
};

const getSpecializationBreakdown = async () => {
  const query = `
    SELECT d.specialization, COUNT(a.id)::int AS count
    FROM appointments a
    JOIN slots s ON a.slot_id = s.id
    JOIN doctors d ON s.doctor_id = d.id
    GROUP BY d.specialization
    ORDER BY count DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getDoctorUtilization = async () => {
  const query = `
    SELECT u.name AS doctor_name, d.specialization,
           COUNT(s.id)::int AS total_slots,
           COUNT(CASE WHEN s.status = 'BOOKED' THEN 1 END)::int AS booked_slots,
           CASE 
             WHEN COUNT(s.id) > 0 THEN 
               ROUND((COUNT(CASE WHEN s.status = 'BOOKED' THEN 1 END)::numeric / COUNT(s.id)::numeric) * 100, 2)::float
             ELSE 0.0
           END AS utilization_rate
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN slots s ON d.id = s.doctor_id
    GROUP BY d.id, u.name, d.specialization
    ORDER BY utilization_rate DESC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getPeakHours = async () => {
  const query = `
    SELECT EXTRACT(HOUR FROM start_time)::int AS hour, COUNT(*)::int AS count
    FROM slots
    GROUP BY hour
    ORDER BY hour ASC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getCancellationRate = async () => {
  const query = `
    SELECT 
      COUNT(*)::int AS "totalAppointments",
      COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END)::int AS "cancelledAppointments",
      CASE 
        WHEN COUNT(*) > 0 THEN 
          ROUND((COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)::float
        ELSE 0.0
      END AS "cancellationRate"
    FROM appointments;
  `;

  const { rows } = await pool.query(query);
  return rows[0];
};

const getSummary = async () => {
  const totalBookingsQuery = "SELECT COUNT(*)::int AS count FROM appointments";
  const activeDoctorsQuery = "SELECT COUNT(*)::int AS count FROM doctors";
  const totalSlotsQuery = "SELECT COUNT(*)::int AS count FROM slots";
  const bookedSlotsQuery = "SELECT COUNT(*)::int AS count FROM slots WHERE status = 'BOOKED'";

  const [bookings, doctors, slots, bookedSlots] = await Promise.all([
    pool.query(totalBookingsQuery),
    pool.query(activeDoctorsQuery),
    pool.query(totalSlotsQuery),
    pool.query(bookedSlotsQuery)
  ]);

  const total = slots.rows[0].count;
  const booked = bookedSlots.rows[0].count;
  const utilization = total > 0 ? parseFloat(((booked / total) * 100).toFixed(2)) : 0.0;

  return {
    totalBookings: bookings.rows[0].count,
    activeDoctors: doctors.rows[0].count,
    totalSlots: total,
    bookedSlots: booked,
    utilizationRate: utilization
  };
};

module.exports = {
  getBookingsOverTime,
  getSpecializationBreakdown,
  getDoctorUtilization,
  getPeakHours,
  getCancellationRate,
  getSummary
};

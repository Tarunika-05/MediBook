const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../database/pool");
const app = require("../index");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

describe("Appointment Booking", () => {
  let patientId;
  let slotId;
  let patientToken;
  const testPrefix = `booking-${Date.now()}`;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password123", 10);

    const doctorUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'DOCTOR') RETURNING id`,
      [`Dr ${testPrefix}`, `${testPrefix}-doctor@example.com`, passwordHash]
    );

    const doctor = await pool.query(
      `INSERT INTO doctors (user_id, specialization, experience_years, consultation_fee)
       VALUES ($1, 'General', 5, 100) RETURNING id`,
      [doctorUser.rows[0].id]
    );

    const patientUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'PATIENT') RETURNING id`,
      [`Patient ${testPrefix}`, `${testPrefix}-patient@example.com`, passwordHash]
    );

    patientId = patientUser.rows[0].id;
    patientToken = generateToken(patientId);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(10, 0, 0, 0);
    const endTime = new Date(tomorrow);
    endTime.setMinutes(30);

    const slot = await pool.query(
      `INSERT INTO slots (doctor_id, start_time, end_time, status)
       VALUES ($1, $2, $3, 'AVAILABLE') RETURNING id`,
      [doctor.rows[0].id, tomorrow, endTime]
    );

    slotId = slot.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM appointments WHERE patient_id IN (SELECT id FROM users WHERE email LIKE $1)",
      [`${testPrefix}%`]
    );
    await pool.query(
      "DELETE FROM slots WHERE doctor_id IN (SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email LIKE $1)",
      [`${testPrefix}%`]
    );
    await pool.query("DELETE FROM doctors WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)", [`${testPrefix}%`]);
    await pool.query("DELETE FROM users WHERE email LIKE $1", [`${testPrefix}%`]);
  });

  it("should book an available slot", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ slotId });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Appointment booked successfully");
  });

  it("should reject booking an already booked slot", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ slotId });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe("Slot already booked");
  });

  it("should list patient appointments", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should cancel an appointment", async () => {
    const appointments = await pool.query(
      "SELECT id FROM appointments WHERE patient_id = $1 AND status = 'BOOKED'",
      [patientId]
    );

    const res = await request(app)
      .delete(`/api/appointments/${appointments.rows[0].id}`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Appointment cancelled successfully");

    const slot = await pool.query("SELECT status FROM slots WHERE id = $1", [slotId]);
    expect(slot.rows[0].status).toBe("AVAILABLE");
  });
});

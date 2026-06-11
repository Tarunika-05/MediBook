const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../database/pool");
const app = require("../index");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

describe("Concurrency Handling - Appointment Booking", () => {
  let testSlotId;
  let patient1Id;
  let patient2Id;
  const testPrefix = `concurrency-${Date.now()}`;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password123", 10);

    const doctorUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'DOCTOR') RETURNING id`,
      [`Dr ${testPrefix}`, `${testPrefix}-doctor@example.com`, passwordHash]
    );

    const doctor = await pool.query(
      `INSERT INTO doctors (user_id, specialization, experience_years, consultation_fee)
       VALUES ($1, 'Test', 5, 100) RETURNING id`,
      [doctorUser.rows[0].id]
    );

    const p1 = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'PATIENT') RETURNING id`,
      [`Patient 1 ${testPrefix}`, `${testPrefix}-p1@example.com`, passwordHash]
    );
    patient1Id = p1.rows[0].id;

    const p2 = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'PATIENT') RETURNING id`,
      [`Patient 2 ${testPrefix}`, `${testPrefix}-p2@example.com`, passwordHash]
    );
    patient2Id = p2.rows[0].id;

    const slotStart = new Date();
    slotStart.setDate(slotStart.getDate() + 3);
    slotStart.setHours(10, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(30);

    const slot = await pool.query(
      `INSERT INTO slots (doctor_id, start_time, end_time, status)
       VALUES ($1, $2, $3, 'AVAILABLE') RETURNING id`,
      [doctor.rows[0].id, slotStart, slotEnd]
    );

    testSlotId = slot.rows[0].id;
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM appointments WHERE slot_id = $1",
      [testSlotId]
    );
    await pool.query(
      "DELETE FROM slots WHERE id = $1",
      [testSlotId]
    );
    await pool.query(
      "DELETE FROM doctors WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)",
      [`${testPrefix}%`]
    );
    await pool.query("DELETE FROM users WHERE email LIKE $1", [`${testPrefix}%`]);
  });

  it("should prevent double booking using row-level locking (FOR UPDATE)", async () => {
    const token1 = generateToken(patient1Id);
    const token2 = generateToken(patient2Id);

    const req1 = request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token1}`)
      .send({ slotId: testSlotId });

    const req2 = request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token2}`)
      .send({ slotId: testSlotId });

    const [res1, res2] = await Promise.all([req1, req2]);

    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);

    const successRes = res1.status === 201 ? res1 : res2;
    const failRes = res1.status === 409 ? res1 : res2;

    expect(successRes.body.message).toBe("Appointment booked successfully");
    expect(failRes.body.error.message).toBe("Slot already booked");

    const appointments = await pool.query(
      "SELECT * FROM appointments WHERE slot_id = $1 AND status = 'BOOKED'",
      [testSlotId]
    );
    expect(appointments.rows.length).toBe(1);

    const slot = await pool.query("SELECT status FROM slots WHERE id = $1", [testSlotId]);
    expect(slot.rows[0].status).toBe("BOOKED");
  });
});

const request = require("supertest");
const bcrypt = require("bcrypt");
const pool = require("../database/pool");
const app = require("../index");

describe("Authentication", () => {
  const testEmail = `auth-test-${Date.now()}@example.com`;

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [testEmail]);
  });

  it("should register a new patient", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Patient",
        email: testEmail,
        password: "password123",
        role: "PATIENT",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.role).toBe("PATIENT");
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it("should reject duplicate registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Patient",
        email: testEmail,
        password: "password123",
        role: "PATIENT",
      });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe("User already exists");
  });

  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it("should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Invalid email or password");
  });

  it("should reject protected route without auth header", async () => {
    const res = await request(app).get("/api/appointments");
    expect(res.status).toBe(401);
  });
});

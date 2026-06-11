require("dotenv").config({ path: ".env.test" });

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key";
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/doctor_appointment";

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database/pool");
const { ROLES } = require("../models/constants");
const { ConflictError, UnauthorizedError } = require("../utils/AppError");

const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return token;
};

const registerUser = async ({ name, email, password, role, specialization, experienceYears, consultationFee, bio }) => {
  const userRole = role === ROLES.DOCTOR ? ROLES.DOCTOR : ROLES.PATIENT;

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new ConflictError("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, userRole]
    );

    const user = userResult.rows[0];

    if (userRole === ROLES.DOCTOR) {
      await client.query(
        `INSERT INTO doctors (user_id, specialization, experience_years, consultation_fee, bio)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          specialization || "General",
          experienceYears || 0,
          consultationFee || 0,
          bio || "",
        ]
      );
    }

    await client.query("COMMIT");
    
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const loginUser = async ({ email, password }) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
    [email]
  );

  if (rows.length === 0) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const refreshTokens = async (refreshToken) => {
  if (!refreshToken) throw new UnauthorizedError("No refresh token provided");

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const { rows } = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token_hash = $1",
    [tokenHash]
  );

  if (rows.length === 0) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const tokenRecord = rows[0];

  if (tokenRecord.revoked) {
    // Reuse detection: invalidate ALL tokens for this user
    await pool.query("UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1", [tokenRecord.user_id]);
    throw new UnauthorizedError("Token reuse detected, please login again");
  }

  if (new Date() > new Date(tokenRecord.expires_at)) {
    throw new UnauthorizedError("Refresh token expired");
  }

  // Revoke the old token (rotate)
  await pool.query("UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1", [tokenRecord.id]);

  const userQuery = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [tokenRecord.user_id]);
  const user = userQuery.rows[0];

  const newAccessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = await generateRefreshToken(user.id);

  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) return;
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await pool.query("UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1", [tokenHash]);
};

module.exports = { registerUser, loginUser, refreshTokens, revokeRefreshToken, generateAccessToken };

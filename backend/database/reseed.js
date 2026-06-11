#!/usr/bin/env node
/**
 * reseed.js — Wipes all data and re-seeds with rich demo data
 * Run: node database/reseed.js
 */
require("dotenv").config();
const pool = require("./pool");
const migrate = require("./migrate");
const seed = require("./seed");

async function reseed() {
  const client = await pool.connect();
  try {
    console.log("🗑️  Clearing existing data...");
    await client.query("BEGIN");
    await client.query("DELETE FROM appointments");
    await client.query("DELETE FROM slots");
    await client.query("DELETE FROM doctors");
    await client.query("DELETE FROM users");
    // Reset sequences so IDs start from 1
    await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE doctors_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE slots_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE appointments_id_seq RESTART WITH 1");
    await client.query("COMMIT");
    console.log("✅ Cleared.\n");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  console.log("🌱 Running seed...");
  await seed();
  console.log("\n🎉 Done! Your database is loaded with rich demo data.");
  process.exit(0);
}

reseed().catch((err) => {
  console.error("Reseed failed:", err);
  process.exit(1);
});

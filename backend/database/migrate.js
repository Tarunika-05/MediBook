const fs = require("fs");
const path = require("path");

async function migrate() {
  const pool = require("./pool");
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log("Database schema applied successfully");
  } finally {
    client.release();
  }
}

module.exports = migrate;

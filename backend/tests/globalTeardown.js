const pool = require("../database/pool");

module.exports = async () => {
  await pool.end();
};

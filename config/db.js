require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  max: 10,
  connectionTimeoutMillis: 3000,
});

pool.on("error", (err) => {
  console.log(err, "Failed to connect with postgres database");
});

module.exports = pool;

require("dotenv").config();
const mysql = require("mysql2");

const conn = mysql
  .createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
    database: process.env.DB_NAME || "ikibina_db",
    port: process.env.DB_PORT || 3306,
  })
  .promise();
  

module.exports = conn;

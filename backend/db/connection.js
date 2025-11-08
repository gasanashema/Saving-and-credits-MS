require("dotenv").config();
const mysql = require("mysql2");

const conn = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, // Corrected the variable name here
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();
  

module.exports = conn;

require("dotenv").config();
const mysql = require("mysql2");

const conn = mysql
  .createPool({
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER, // Corrected the variable name here
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    // port: process.env.DB_PORT,
    host: "localhost",
    user: "root",
    password: "",
    // database: "ikibina_new",
    database: "ikibina_app",
    port: 3306,
  })
  .promise();
  

module.exports = conn;

require("dotenv").config();
const mysql = require("mysql2");

const conn = mysql
  .createPool({
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER, // Corrected the variable name here
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    // port: process.env.DB_PORT,
    host: "gateway01.ap-northeast-1.prod.aws.tidbcloud.com",
    user: "4T7Zfkh3ydAm1ya.root",
    password: "CAUoZW1xhInQvpjo",
    database: "my_app_db",
    // database: "ikibina_app",
    port: 4000,
  })
  .promise();
  

module.exports = conn;

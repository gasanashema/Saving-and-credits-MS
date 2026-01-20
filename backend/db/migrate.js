const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const runMigration = async () => {
  try {
    // Using credentials from backend/db/connection.js
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "phpmyadmin",
      password: "disaster",
      database: "ikibina_app",
      port: 3306,
      multipleStatements: true
    });

    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, 'restore_savings.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL...');
    await connection.query(sql);

    console.log('Migration completed successfully.');
    await connection.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();

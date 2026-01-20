const mysql = require('mysql2/promise');

const listTables = async () => {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "phpmyadmin",
      password: "disaster",
      database: "ikibina_app",
      port: 3306
    });

    console.log('Connected.');
    
    const [rows] = await connection.query("SHOW TABLES");
    console.log('Tables:', rows.map(r => Object.values(r)[0]));

    await connection.end();
  } catch (error) {
    console.error('Failed:', error);
  }
};

listTables();

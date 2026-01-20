const mysql = require('mysql2/promise');

const verify = async () => {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "phpmyadmin",
      password: "disaster",
      database: "ikibina_app",
      port: 3306
    });

    console.log('Connected.');
    
    // Check if table exists
    const [rows] = await connection.query("SHOW TABLES LIKE 'loan_packages'");
    if (rows.length > 0) {
        console.log("Table 'loan_packages' EXISTS.");
        
        // Check rows
        const [count] = await connection.query("SELECT count(*) as count FROM loan_packages");
        console.log(`Row count: ${count[0].count}`);
    } else {
        console.log("Table 'loan_packages' DOES NOT EXIST.");
    }
    
    // Check loan column
    const [cols] = await connection.query("SHOW COLUMNS FROM loan LIKE 'package_id'");
    if (cols.length > 0) {
        console.log("Column 'package_id' in 'loan' table EXISTS.");
    } else {
         console.log("Column 'package_id' in 'loan' table DOES NOT EXIST.");
    }

    await connection.end();
  } catch (error) {
    console.error('Verify failed:', error);
  }
};

verify();

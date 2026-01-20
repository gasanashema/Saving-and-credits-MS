const conn = require("./db/connection");

async function run() {
  try {
    const [columns] = await conn.query("SHOW COLUMNS FROM users");
    console.log("Users Columns:", columns.map(c => c.Field));
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();

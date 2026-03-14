const conn = require('./db/connection');

async function migrate() {
  try {
    console.log('Migrating loanpayment table...');
    
    // Add status column if it doesn't exist
    await conn.query(`
      ALTER TABLE loanpayment 
      ADD COLUMN IF NOT EXISTS status ENUM('pending', 'confirmed') NOT NULL DEFAULT 'confirmed'
    `).catch(err => {
      // Handle the case where IF NOT EXISTS isn't supported or fails for other reasons
      if (err.code !== 'ER_DUP_COLUMN_NAMES') throw err;
      console.log('Status column already exists.');
    });

    // Add phone column if it doesn't exist
    await conn.query(`
      ALTER TABLE loanpayment 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL
    `).catch(err => {
      if (err.code !== 'ER_DUP_COLUMN_NAMES') throw err;
      console.log('Phone column already exists.');
    });

    console.log('Migration successful: loanpayment table updated.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

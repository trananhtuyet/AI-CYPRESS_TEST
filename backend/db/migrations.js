const db = require('../config/database');

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Temporarily disable foreign keys during schema creation
      db.run('PRAGMA foreign_keys = OFF', (err) => {
        if (err) console.error('Error disabling foreign keys:', err);
      });

      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT,
          avatar_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          console.log('✓ Users table created');
        }
      });

      // Create sessions table
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `, (err) => {
        if (err) {
          console.error('Error creating sessions table:', err);
          reject(err);
        } else {
          console.log('✓ Sessions table created');
        }
      });

      // Create test_cases table
      db.run(`
        CREATE TABLE IF NOT EXISTS test_cases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          target_website_url TEXT,
          test_steps TEXT,
          expected_results TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `, (err) => {
        if (err) {
          console.error('Error creating test_cases table:', err);
          reject(err);
        } else {
          console.log('✓ Test cases table created');
          // Re-enable foreign keys after all tables are created
          db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) console.error('Error enabling foreign keys:', err);
          });
          console.log('\n✓ All tables initialized successfully!');
          resolve();
        }
      });
    });
  });
}

module.exports = initializeDatabase;


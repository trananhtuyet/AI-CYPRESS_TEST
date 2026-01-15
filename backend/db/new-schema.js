const db = require('../config/database');

// New schema: Separate test_cases and test_steps for better data management
const initializeNewSchema = () => {
  db.serialize(() => {
    // Temporarily disable foreign keys during schema creation
    db.run('PRAGMA foreign_keys = OFF', (err) => {
      if (err) console.error('Error disabling foreign keys:', err);
    });

    // Create test_cases table (simplified, no JSON blob)
    db.run(`
      CREATE TABLE IF NOT EXISTS test_cases_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        module TEXT DEFAULT 'General',
        type TEXT DEFAULT 'manual',
        priority TEXT DEFAULT 'Medium',
        tags TEXT,
        precondition TEXT,
        postcondition TEXT,
        automation_code TEXT,
        html_content TEXT,
        analyzed_elements TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating test_cases_new:', err);
      else console.log('✓ test_cases_new table created');
    });

    // Create test_steps table (normalized)
    db.run(`
      CREATE TABLE IF NOT EXISTS test_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_case_id INTEGER NOT NULL,
        step_num TEXT,
        action TEXT,
        expected TEXT,
        note TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_case_id) REFERENCES test_cases_new(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating test_steps:', err);
      else console.log('✓ test_steps table created');
    });

    // Re-enable foreign keys after schema creation
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) console.error('Error enabling foreign keys:', err);
    });

    console.log('✅ New schema initialized successfully!');
  });
};

module.exports = { initializeNewSchema };

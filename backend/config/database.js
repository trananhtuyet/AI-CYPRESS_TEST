const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.db');

// Create db folder if not exists
const fs = require('fs');
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('SQLite database connected at:', dbPath);
    // Disable foreign keys for compatibility with existing test case creation
    db.run('PRAGMA foreign_keys = OFF', (err) => {
      if (err) console.error('Error disabling foreign keys:', err);
    });
  }
});

module.exports = db;


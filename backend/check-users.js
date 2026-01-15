const db = require('./config/database');

db.all('SELECT id, email FROM users', [], (err, rows) => { 
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Users:');
    console.log(JSON.stringify(rows, null, 2));
  }
  process.exit(0); 
});

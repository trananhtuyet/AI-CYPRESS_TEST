const db = require('./config/database');

db.all('SELECT id, user_id, name, module FROM test_cases_new', [], (err, rows) => { 
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Test cases with user_id:');
    console.log(JSON.stringify(rows, null, 2));
  }
  process.exit(0); 
});

// Quick check of test data
const db = require('./config/database');

db.all('SELECT ts.id, ts.status, tc.name FROM test_steps ts JOIN test_cases_new tc ON ts.test_case_id = tc.id LIMIT 10', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Test steps with current status:');
    rows.forEach(row => {
      console.log(`  Step ${row.id}: "${row.status}" (TC: ${row.name})`);
    });
  }
  
  // Count by status
  db.all('SELECT status, COUNT(*) as count FROM test_steps GROUP BY status', (err, rows) => {
    if (err) console.error('Error:', err);
    else {
      console.log('\nStatus distribution:');
      rows.forEach(row => console.log(`  ${row.status}: ${row.count}`));
    }
    db.close();
  });
});

const db = require('./config/database');

db.all(`
  SELECT 
    tc.id, 
    tc.name, 
    tc.user_id,
    (SELECT COUNT(*) FROM test_steps WHERE test_case_id = tc.id) as step_count
  FROM test_cases_new tc
  WHERE tc.user_id = 4
  ORDER BY tc.id
`, [], (err, rows) => {
  console.log('All test cases for user_id 4:');
  rows.forEach(r => console.log('  ID:', r.id, 'Name:', r.name, 'Steps:', r.step_count));
  process.exit(0);
});

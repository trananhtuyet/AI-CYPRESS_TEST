const db = require('./config/database');

console.log('\n=== Checking test_cases_new table ===');
db.all('SELECT id, name, module FROM test_cases_new', [], (err, cases) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Test cases:', cases);
    
    if (cases && cases.length > 0) {
      console.log('\n=== Checking test_steps for each case ===');
      cases.forEach(tc => {
        db.all('SELECT * FROM test_steps WHERE test_case_id = ?', [tc.id], (err, steps) => {
          if (err) {
            console.error(`Error fetching steps for case ${tc.id}:`, err);
          } else {
            console.log(`\nSteps for TC ${tc.id} (${tc.name}):`, steps);
          }
        });
      });
    }
  }
  
  setTimeout(() => {
    db.close();
    process.exit(0);
  }, 1000);
});

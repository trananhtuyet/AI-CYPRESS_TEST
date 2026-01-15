const db = require('./config/database');

// Find the test case for "gggg111" which the user is trying to view
db.all(`
  SELECT tc.id, tc.name, tc.module, ts.step_num, ts.action, ts.expected, ts.note, ts.status
  FROM test_cases_new tc
  LEFT JOIN test_steps ts ON tc.id = ts.test_case_id
  WHERE tc.name LIKE '%gggg%' OR tc.name LIKE '%111%'
  ORDER BY tc.id, ts.id
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Test cases related to "gggg111":');
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          name: row.name,
          module: row.module,
          steps: []
        };
      }
      if (row.step_num) {
        grouped[row.id].steps.push({
          stepNum: row.step_num,
          action: row.action,
          expected: row.expected,
          note: row.note,
          status: row.status
        });
      }
    });
    
    Object.values(grouped).forEach(tc => {
      console.log(`\nTC ID ${tc.id}: ${tc.name} (${tc.module})`);
      console.log(`  ${tc.steps.length} steps:`);
      tc.steps.forEach(step => {
        console.log(`    Step ${step.stepNum}: ${step.action}`);
      });
    });
  }
  process.exit(0);
});

const db = require('./config/database');

console.log('🔄 Migrating test cases from old schema to new schema...\n');

// Get all test cases from old table
db.all('SELECT id, user_id, title, description, test_steps, created_at, updated_at FROM test_cases', [], (err, oldCases) => {
  if (err) {
    console.error('❌ Error reading old test cases:', err);
    process.exit(1);
  }

  console.log(`Found ${oldCases.length} test cases in old table\n`);

  if (oldCases.length === 0) {
    console.log('No test cases to migrate');
    process.exit(0);
  }

  let migratedCount = 0;
  let stepsCount = 0;

  oldCases.forEach((oldCase, index) => {
    const metadata = JSON.parse(oldCase.description || '{}');
    const steps = JSON.parse(oldCase.test_steps || '[]');
    
    console.log(`\n[${index + 1}/${oldCases.length}] Migrating: ${oldCase.title}`);
    console.log(`  Steps: ${steps.length}`);

    // Insert into test_cases_new
    const insertCaseSQL = `
      INSERT INTO test_cases_new (user_id, name, module, type, priority, tags, precondition, postcondition, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const tagsStr = Array.isArray(metadata.tags) ? metadata.tags.join(',') : (metadata.tags || '');
    
    db.run(insertCaseSQL, [
      oldCase.user_id,
      oldCase.title,
      metadata.module || 'General',
      metadata.type || 'manual',
      metadata.priority || 'Medium',
      tagsStr,
      metadata.precondition || '',
      metadata.postcondition || '',
      oldCase.created_at,
      oldCase.updated_at
    ], function(err) {
      if (err) {
        console.error(`  ❌ Error inserting test case: ${err.message}`);
        return;
      }

      const newCaseId = this.lastID;
      console.log(`  ✅ Test case inserted with ID ${newCaseId}`);

      // Insert steps
      let stepInserted = 0;
      steps.forEach((step, stepIdx) => {
        const insertStepSQL = `
          INSERT INTO test_steps (test_case_id, step_num, action, expected, note, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertStepSQL, [
          newCaseId,
          step.stepNum || String(stepIdx + 1).padStart(2, '0'),
          step.action || '',
          step.expected || '',
          step.note || '',
          step.status || 'pending',
          new Date().toISOString()
        ], function(err) {
          if (err) {
            console.error(`    ❌ Error inserting step: ${err.message}`);
          } else {
            stepInserted++;
            stepsCount++;
          }

          // After last step, increment counter
          if (stepIdx === steps.length - 1) {
            migratedCount++;
            console.log(`  ✅ ${stepInserted} steps migrated`);

            // If all cases migrated, exit
            if (migratedCount === oldCases.length) {
              console.log(`\n✅ Migration complete!`);
              console.log(`   - Test cases: ${migratedCount}`);
              console.log(`   - Steps: ${stepsCount}`);
              process.exit(0);
            }
          }
        });
      });
    });
  });
});

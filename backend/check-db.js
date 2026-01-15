const db = require('./config/database');

db.serialize(() => {
    console.log('\n=== TEST CASES IN DATABASE ===\n');
    
    db.all('SELECT id, title, description, test_steps FROM test_cases LIMIT 5', (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        if (!rows || rows.length === 0) {
            console.log('No test cases found');
            return;
        }
        
        rows.forEach((row, idx) => {
            console.log(`\n--- Test Case ${idx + 1} ---`);
            console.log('ID:', row.id);
            console.log('Title:', row.title);
            console.log('Description:', row.description);
            console.log('Test Steps:', row.test_steps);
            
            if (row.test_steps) {
                try {
                    const steps = JSON.parse(row.test_steps);
                    console.log('Parsed Steps:', JSON.stringify(steps, null, 2));
                } catch (e) {
                    console.log('Failed to parse steps:', e.message);
                }
            }
        });
        
        process.exit(0);
    });
});

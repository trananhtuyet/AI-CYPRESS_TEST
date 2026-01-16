// Debug script to check analytics data
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.db');
console.log('📊 Connecting to database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
  
  // Check test_cases_new
  console.log('\n📋 === TEST CASES ===');
  db.all('SELECT COUNT(*) as count FROM test_cases_new', (err, rows) => {
    if (err) console.error('❌ Error:', err);
    else console.log('Total test cases:', rows[0].count);
    
    db.all('SELECT id, user_id, name, priority, type FROM test_cases_new LIMIT 5', (err, rows) => {
      if (err) console.error('❌ Error:', err);
      else {
        console.log('Sample test cases:');
        rows.forEach(row => console.log(`  - ${row.name} (user_id: ${row.user_id}, priority: ${row.priority})`));
      }
      
      // Check test_steps
      console.log('\n📊 === TEST STEPS ===');
      db.all('SELECT COUNT(*) as count FROM test_steps', (err, rows) => {
        if (err) console.error('❌ Error:', err);
        else console.log('Total test steps:', rows[0].count);
        
        db.all('SELECT status, COUNT(*) as count FROM test_steps GROUP BY status', (err, rows) => {
          if (err) console.error('❌ Error:', err);
          else {
            console.log('Test steps by status:');
            rows.forEach(row => console.log(`  - ${row.status}: ${row.count}`));
          }
          
          // Check users
          console.log('\n👥 === USERS ===');
          db.all('SELECT COUNT(*) as count FROM users', (err, rows) => {
            if (err) {
              console.log('  (users table may not exist)');
            } else {
              console.log('Total users:', rows[0].count);
            }
            
            db.all('SELECT id, username FROM users LIMIT 5', (err, rows) => {
              if (err) {
                console.log('  (could not fetch users)');
              } else {
                console.log('Sample users:');
                rows.forEach(row => console.log(`  - ${row.username} (id: ${row.id})`));
              }
              
              console.log('\n✅ Debug complete\n');
              db.close();
            });
          });
        });
      });
    });
  });
});

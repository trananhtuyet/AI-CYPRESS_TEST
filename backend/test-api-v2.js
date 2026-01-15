const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Create a test token
const testToken = jwt.sign(
  { id: 1, email: 'test@example.com' },
  'your-secret-key',
  { expiresIn: '1h' }
);

console.log('Testing API endpoint...');
console.log('Token:', testToken);

fetch('http://localhost:3000/api/v2/testcases', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('\n=== API Response ===');
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

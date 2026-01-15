const http = require('http');

// Get JWT token for user_id 4
const { generateToken } = require('./utils/auth');
const token = generateToken(4);

console.log('Test token for user_id 4:', token);
console.log('\nCalling /api/v2/testcases endpoint...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v2/testcases',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response status:', res.statusCode);
      console.log('Total test cases:', json.total);
      if (json.testCases.length > 0) {
        console.log('\nFirst test case:');
        const tc = json.testCases[0];
        console.log('  ID:', tc.id);
        console.log('  Name:', tc.title);
        console.log('  Steps:', tc.steps.length);
        if (tc.steps.length > 0) {
          console.log('  First step:', JSON.stringify(tc.steps[0], null, 2));
        }
      }
    } catch (err) {
      console.error('Parse error:', err);
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

req.end();

const http = require('http');
const { generateToken } = require('./utils/auth');

const token = generateToken(4);

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
    const json = JSON.parse(data);
    
    // Find test case with ID 1
    const tc1 = json.testCases.find(tc => tc.id === 1);
    
    console.log('Test case ID 1 (gggg111):');
    console.log(JSON.stringify(tc1, null, 2));
    
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

req.end();

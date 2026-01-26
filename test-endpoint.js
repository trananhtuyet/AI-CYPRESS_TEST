const http = require('http');

const data = JSON.stringify({
  url: 'https://www.google.com'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/analyze-website-features',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('BODY:', body.substring(0, 500));
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  process.exit(1);
});

console.log('📤 Sending request to http://localhost:3000/api/analyze-website-features');
req.write(data);
req.end();

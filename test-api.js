// Test API
const API_URL = 'http://localhost:3000/api/auth/register';

const data = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User'
};

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));

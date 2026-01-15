const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { authMiddleware } = require('../middleware/auth');

// Utility function to run queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', { username: req.body.username, email: req.body.email });
    
    const { username, email, password, fullName } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await getQuery(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed');

    // Insert user
    console.log('Inserting user...');
    const result = await runQuery(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, fullName || null]
    );
    console.log('User inserted, ID:', result.id);

    const user = await getQuery(
      'SELECT id, username, email, full_name FROM users WHERE id = ?',
      [result.id]
    );

    const token = generateToken(user.id);

    console.log('Sending response...');
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err.message, err.stack);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await getQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await getQuery(
      'SELECT id, username, email, full_name, avatar_url, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: user
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, avatarUrl } = req.body;

    const user = await getQuery(
      'SELECT * FROM users WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await runQuery(
      'UPDATE users SET full_name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [fullName || user.full_name, avatarUrl || user.avatar_url, req.userId]
    );

    const updatedUser = await getQuery(
      'SELECT id, username, email, full_name, avatar_url FROM users WHERE id = ?',
      [req.userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

// Logout endpoint
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed', details: err.message });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      // Don't reveal if email exists (security)
      return res.json({ message: 'If email exists, password reset link has been sent' });
    }

    // In production, send email with reset link
    // For now, just return success message
    console.log(`Password reset requested for: ${email}`);

    res.json({ message: 'If email exists, password reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request', details: err.message });
  }
});

// Social Login endpoint (Google, Facebook)
router.post('/social-login', async (req, res) => {
  try {
    const { id, name, email, picture, provider } = req.body;

    if (!id || !name || !email || !provider) {
      return res.status(400).json({ error: 'Missing required social login data' });
    }

    // Check if user exists
    let user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);

    if (user) {
      // User exists, just login
      const token = generateToken(user.id);
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          provider: provider
        }
      });
    }

    // Create new user from social login
    const username = name.replace(/\s+/g, '_').toLowerCase() || email.split('@')[0];
    const hashedPassword = await hashPassword(id + email); // Use social ID + email as password

    try {
      const result = await runQuery(
        'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, datetime("now"))',
        [username, email, hashedPassword]
      );

      const token = generateToken(result.id);

      res.json({
        success: true,
        token,
        user: {
          id: result.id,
          username: username,
          email: email,
          provider: provider
        }
      });
    } catch (dbError) {
      console.error('Database error on social login:', dbError);
      // If username already exists, append random number
      const randomUsername = username + '_' + Math.floor(Math.random() * 10000);
      const result = await runQuery(
        'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, datetime("now"))',
        [randomUsername, email, hashedPassword]
      );

      const token = generateToken(result.id);
      res.json({
        success: true,
        token,
        user: {
          id: result.id,
          username: randomUsername,
          email: email,
          provider: provider
        }
      });
    }
  } catch (err) {
    console.error('Social login error:', err);
    res.status(500).json({ error: 'Social login failed', details: err.message });
  }
});

module.exports = router;


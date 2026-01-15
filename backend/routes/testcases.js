const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Create a new test case
router.post('/', authMiddleware, (req, res) => {
  const { name, type, module, priority, tags, precondition, postcondition, steps, summary } = req.body;
  const userId = req.user.id;

  console.log('📥 Creating test case:', { name, stepsCount: steps?.length });
  console.log('Steps received:', JSON.stringify(steps, null, 2));

  if (!name) {
    return res.status(400).json({ error: 'Test case name is required' });
  }

  if (!steps || steps.length === 0) {
    return res.status(400).json({ error: 'Test case must have at least one step' });
  }

  const stepsJson = JSON.stringify(steps);
  console.log('Steps JSON:', stepsJson);
  
  const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []);

  const metadata = {
    name,
    type: type || 'manual',
    module: module || 'General',
    priority: priority || 'Medium',
    tags: tagsArray,
    precondition: precondition || '',
    postcondition: postcondition || '',
    summary: summary || {
      total: steps.length,
      passed: 0,
      failed: 0,
      pending: steps.length
    }
  };

  const sql = `
    INSERT INTO test_cases (user_id, title, description, test_steps, expected_results, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  db.run(sql, [userId, name, JSON.stringify(metadata), stepsJson, JSON.stringify({ metadata })], function(err) {
    if (err) {
      console.error('Error creating test case:', err);
      return res.status(500).json({ error: 'Failed to create test case', details: err.message });
    }

    const testCaseId = this.lastID;
    console.log(`✅ Test case created: ID=${testCaseId}, Name="${name}", Steps=${steps.length}`);

    res.status(201).json({
      success: true,
      message: `Test case "${name}" created successfully`,
      testCaseId: testCaseId,
      testCase: {
        id: testCaseId,
        name: name,
        type: type || 'manual',
        stepsCount: steps.length,
        summary: metadata.summary,
        createdAt: new Date().toISOString()
      }
    });
  });
});

// Get all test cases for the current user
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT id, title, description, test_steps, expected_results, created_at, updated_at
    FROM test_cases
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching test cases:', err);
      return res.status(500).json({ error: 'Failed to fetch test cases' });
    }

    const testCases = rows.map(row => ({
      id: row.id,
      title: row.title,
      metadata: JSON.parse(row.description || '{}'),
      steps: JSON.parse(row.test_steps || '[]'),
      expected: JSON.parse(row.expected_results || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      testCases,
      total: testCases.length
    });
  });
});

// Get a specific test case by ID
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const sql = `
    SELECT id, title, description, test_steps, expected_results, created_at, updated_at
    FROM test_cases
    WHERE id = ? AND user_id = ?
  `;

  db.get(sql, [id, userId], (err, row) => {
    if (err) {
      console.error('Error fetching test case:', err);
      return res.status(500).json({ error: 'Failed to fetch test case' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    const testCase = {
      id: row.id,
      title: row.title,
      metadata: JSON.parse(row.description || '{}'),
      steps: JSON.parse(row.test_steps || '[]'),
      expected: JSON.parse(row.expected_results || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json({ success: true, testCase });
  });
});

// Update a test case
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, type, module, priority, tags, precondition, postcondition, steps } = req.body;
  const userId = req.user.id;

  const metadata = {
    name,
    type: type || 'manual',
    module: module || '',
    priority: priority || 'Medium',
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    precondition: precondition || '',
    postcondition: postcondition || ''
  };

  const stepsJson = JSON.stringify(steps || []);

  const sql = `
    UPDATE test_cases
    SET title = ?, description = ?, test_steps = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `;

  db.run(sql, [name, JSON.stringify(metadata), stepsJson, id, userId], function(err) {
    if (err) {
      console.error('Error updating test case:', err);
      return res.status(500).json({ error: 'Failed to update test case' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Test case not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Test case updated successfully'
    });
  });
});

// Delete a test case
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const sql = `DELETE FROM test_cases WHERE id = ? AND user_id = ?`;

  db.run(sql, [id, userId], function(err) {
    if (err) {
      console.error('Error deleting test case:', err);
      return res.status(500).json({ error: 'Failed to delete test case' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Test case not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Test case deleted successfully'
    });
  });
});

// Get test case statistics
router.get('/stats/summary', authMiddleware, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN description LIKE '%manual%' THEN 1 ELSE 0 END) as manual_count,
      SUM(CASE WHEN description LIKE '%automation%' THEN 1 ELSE 0 END) as automation_count
    FROM test_cases
    WHERE user_id = ?
  `;

  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    res.json({
      success: true,
      stats: {
        total: row.total || 0,
        manual: row.manual_count || 0,
        automation: row.automation_count || 0
      }
    });
  });
});

module.exports = router;

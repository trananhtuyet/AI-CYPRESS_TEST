const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Helper functions
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

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// POST: Create test case with steps
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, module, type, priority, tags, precondition, postcondition, steps } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ error: 'Test case name is required' });
    if (!steps || steps.length === 0) return res.status(400).json({ error: 'At least one step is required' });

    // Insert test case
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    const testCaseResult = await runQuery(
      'INSERT INTO test_cases_new (user_id, name, module, type, priority, tags, precondition, postcondition) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, module || 'General', type || 'manual', priority || 'Medium', tagsStr, precondition || '', postcondition || '']
    );

    const testCaseId = testCaseResult.id;

    // Insert steps
    for (const step of steps) {
      await runQuery(
        'INSERT INTO test_steps (test_case_id, step_num, action, expected, note, status) VALUES (?, ?, ?, ?, ?, ?)',
        [testCaseId, step.stepNum, step.action || '', step.expected || '', step.note || '', step.status || 'pending']
      );
    }

    console.log(`✅ Test case created: ID=${testCaseId}, Name="${name}", Steps=${steps.length}`);

    res.status(201).json({
      success: true,
      testCaseId,
      testCase: {
        id: testCaseId,
        name,
        module: module || 'General',
        type: type || 'manual',
        stepsCount: steps.length
      }
    });
  } catch (err) {
    console.error('Error creating test case:', err);
    res.status(500).json({ error: 'Failed to create test case', details: err.message });
  }
});

// GET: Get all test cases for user (with steps)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📡 GET /api/v2/testcases - User ID:', userId);

    const testCases = await allQuery(
      'SELECT * FROM test_cases_new WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    console.log('Found test cases:', testCases.length);

    // Get steps for each test case
    const result = await Promise.all(
      testCases.map(async (tc) => {
        const steps = await allQuery(
          'SELECT id, step_num, action, expected, note, status FROM test_steps WHERE test_case_id = ? ORDER BY id',
          [tc.id]
        );
        console.log(`  TC ID ${tc.id} (${tc.name}): ${steps.length} steps`);
        
        return {
          id: tc.id,
          title: tc.name,
          metadata: {
            name: tc.name,
            module: tc.module,
            type: tc.type,
            priority: tc.priority,
            tags: tc.tags ? tc.tags.split(',') : [],
            precondition: tc.precondition,
            postcondition: tc.postcondition
          },
          automationCode: tc.automation_code || '',
          htmlContent: tc.html_content || '',
          analyzedElements: tc.analyzed_elements ? JSON.parse(tc.analyzed_elements) : [],
          steps: steps,
          createdAt: tc.created_at,
          updatedAt: tc.updated_at
        };
      })
    );

    console.log('✅ Returning', result.length, 'test cases');
    res.json({
      success: true,
      testCases: result,
      total: result.length
    });
    console.log('✅ Sent response with', result.length, 'test cases');
  } catch (err) {
    console.error('Error fetching test cases:', err);
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
});

// GET: Get single test case with steps
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const testCase = await getQuery(
      'SELECT * FROM test_cases_new WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!testCase) return res.status(404).json({ error: 'Test case not found' });

    const steps = await allQuery(
      'SELECT id, step_num, action, expected, note, status FROM test_steps WHERE test_case_id = ? ORDER BY id',
      [id]
    );

    res.json({
      success: true,
      testCase: {
        id: testCase.id,
        title: testCase.name,
        metadata: {
          name: testCase.name,
          module: testCase.module,
          type: testCase.type,
          priority: testCase.priority,
          tags: testCase.tags ? testCase.tags.split(',') : []
        },
        automationCode: testCase.automation_code || '',
        steps: steps
      }
    });
  } catch (err) {
    console.error('Error fetching test case:', err);
    res.status(500).json({ error: 'Failed to fetch test case' });
  }
});

// PUT: Update test case
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, module, type, priority, tags, steps, automationCode, htmlContent, analyzedElements } = req.body;

    // Check ownership
    const testCase = await getQuery(
      'SELECT id FROM test_cases_new WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!testCase) return res.status(404).json({ error: 'Test case not found' });

    // Update test case
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    const updateFields = [];
    const updateValues = [];

    // Dynamic update query builder
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (module !== undefined) {
      updateFields.push('module = ?');
      updateValues.push(module);
    }
    if (type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(type);
    }
    if (priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(priority);
    }
    if (tags !== undefined) {
      updateFields.push('tags = ?');
      updateValues.push(tagsStr);
    }
    if (automationCode !== undefined) {
      updateFields.push('automation_code = ?');
      updateValues.push(automationCode);
    }
    if (htmlContent !== undefined) {
      updateFields.push('html_content = ?');
      updateValues.push(htmlContent);
    }
    if (analyzedElements !== undefined) {
      updateFields.push('analyzed_elements = ?');
      updateValues.push(JSON.stringify(analyzedElements));
    }

    // Always update timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE test_cases_new SET ${updateFields.join(', ')} WHERE id = ?`;
      await runQuery(updateQuery, updateValues);
    }

    // Update steps (delete old, insert new) - only if steps provided
    if (steps && Array.isArray(steps) && steps.length > 0) {
      await runQuery('DELETE FROM test_steps WHERE test_case_id = ?', [id]);
      
      for (const step of steps) {
        await runQuery(
          'INSERT INTO test_steps (test_case_id, step_num, action, expected, note, status) VALUES (?, ?, ?, ?, ?, ?)',
          [id, step.stepNum, step.action || '', step.expected || '', step.note || '', step.status || 'pending']
        );
      }
    }

    res.json({ success: true, message: 'Test case updated' });
  } catch (err) {
    console.error('Error updating test case:', err);
    res.status(500).json({ error: 'Failed to update test case', details: err.message });
  }
});

// DELETE: Delete test case (and its steps via CASCADE)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const testCase = await getQuery(
      'SELECT id FROM test_cases_new WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!testCase) return res.status(404).json({ error: 'Test case not found' });

    await runQuery('DELETE FROM test_cases_new WHERE id = ?', [id]);

    res.json({ success: true, message: 'Test case deleted' });
  } catch (err) {
    console.error('Error deleting test case:', err);
    res.status(500).json({ error: 'Failed to delete test case' });
  }
});

module.exports = router;

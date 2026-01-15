const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Helper functions
const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
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

/**
 * GET /api/analytics/summary
 * Get overall test statistics
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    console.log('📊 Analytics - Summary endpoint');

    // Total test cases
    const totalResult = await getQuery('SELECT COUNT(*) as count FROM test_cases_new');
    const totalTests = totalResult?.count || 0;

    // Test results breakdown
    const statusResult = await allQuery(`
      SELECT status, COUNT(*) as count FROM test_steps 
      GROUP BY status
    `);

    const statusMap = {
      'PASS': 0,
      'FAIL': 0,
      'PENDING': 0
    };

    statusResult.forEach(row => {
      statusMap[row.status] = row.count;
    });

    // Tests by priority
    const priorityResult = await allQuery(`
      SELECT testcasePriority as priority, COUNT(*) as count 
      FROM test_cases_new 
      GROUP BY testcasePriority
    `);

    // Tests by module
    const moduleResult = await allQuery(`
      SELECT testcaseModule as module, COUNT(*) as count 
      FROM test_cases_new 
      GROUP BY testcaseModule
    `);

    // Tests by type
    const typeResult = await allQuery(`
      SELECT testcaseType as type, COUNT(*) as count 
      FROM test_cases_new 
      GROUP BY testcaseType
    `);

    // Calculate pass rate
    const totalSteps = statusMap.PASS + statusMap.FAIL + statusMap.PENDING;
    const passRate = totalSteps > 0 ? Math.round((statusMap.PASS / totalSteps) * 100) : 0;

    res.json({
      success: true,
      summary: {
        totalTests,
        totalSteps,
        passedSteps: statusMap.PASS,
        failedSteps: statusMap.FAIL,
        pendingSteps: statusMap.PENDING,
        passRate: passRate,
        failRate: totalSteps > 0 ? Math.round((statusMap.FAIL / totalSteps) * 100) : 0
      },
      byPriority: priorityResult.reduce((acc, row) => {
        acc[row.priority || 'Unknown'] = row.count;
        return acc;
      }, {}),
      byModule: moduleResult.reduce((acc, row) => {
        acc[row.module || 'Uncategorized'] = row.count;
        return acc;
      }, {}),
      byType: typeResult.reduce((acc, row) => {
        acc[row.type || 'Manual'] = row.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/analytics/test-cases
 * Get all test cases with their details
 */
router.get('/test-cases', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await getQuery('SELECT COUNT(*) as count FROM test_cases_new');
    const total = countResult?.count || 0;

    // Get paginated test cases
    const testCases = await allQuery(`
      SELECT * FROM test_cases_new 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      success: true,
      data: testCases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching test cases:', error);
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
});

/**
 * GET /api/analytics/by-module
 * Get detailed breakdown by module
 */
router.get('/by-module', authMiddleware, async (req, res) => {
  try {
    const modules = await allQuery(`
      SELECT 
        testcaseModule as module,
        COUNT(*) as totalTests,
        SUM(CASE WHEN testcaseType = 'automation' THEN 1 ELSE 0 END) as automationTests,
        SUM(CASE WHEN testcaseType = 'manual' THEN 1 ELSE 0 END) as manualTests
      FROM test_cases_new 
      GROUP BY testcaseModule
      ORDER BY totalTests DESC
    `);

    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('❌ Error in by-module:', error);
    res.status(500).json({ error: 'Failed to fetch module analytics' });
  }
});

/**
 * GET /api/analytics/by-priority
 * Get breakdown by priority
 */
router.get('/by-priority', authMiddleware, async (req, res) => {
  try {
    const priorities = await allQuery(`
      SELECT 
        testcasePriority as priority,
        COUNT(*) as count
      FROM test_cases_new 
      GROUP BY testcasePriority
      ORDER BY 
        CASE WHEN testcasePriority = 'Critical' THEN 0
             WHEN testcasePriority = 'High' THEN 1
             WHEN testcasePriority = 'Medium' THEN 2
             WHEN testcasePriority = 'Low' THEN 3
             ELSE 4 END
    `);

    res.json({
      success: true,
      data: priorities
    });
  } catch (error) {
    console.error('❌ Error in by-priority:', error);
    res.status(500).json({ error: 'Failed to fetch priority analytics' });
  }
});

/**
 * GET /api/analytics/by-type
 * Get breakdown by test type
 */
router.get('/by-type', authMiddleware, async (req, res) => {
  try {
    const types = await allQuery(`
      SELECT 
        testcaseType as type,
        COUNT(*) as count
      FROM test_cases_new 
      GROUP BY testcaseType
    `);

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('❌ Error in by-type:', error);
    res.status(500).json({ error: 'Failed to fetch type analytics' });
  }
});

/**
 * GET /api/analytics/step-status
 * Get detailed step execution status
 */
router.get('/step-status', authMiddleware, async (req, res) => {
  try {
    const statuses = await allQuery(`
      SELECT 
        status,
        COUNT(*) as count
      FROM test_steps 
      GROUP BY status
    `);

    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    console.error('❌ Error in step-status:', error);
    res.status(500).json({ error: 'Failed to fetch step status' });
  }
});

module.exports = router;

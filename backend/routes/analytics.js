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
    const userId = req.user?.id;

    // Total test cases for user
    const totalResult = await getQuery(
      'SELECT COUNT(*) as count FROM test_cases_new WHERE user_id = ?',
      [userId]
    );
    const totalTests = totalResult?.count || 0;

    // Test results breakdown - handle both PASS/FAIL/PENDING and passed/failed/pending
    const statusResult = await allQuery(`
      SELECT LOWER(ts.status) as status, COUNT(*) as count 
      FROM test_steps ts
      JOIN test_cases_new tc ON ts.test_case_id = tc.id
      WHERE tc.user_id = ?
      GROUP BY LOWER(ts.status)
    `, [userId]);

    console.log('📊 Status result:', statusResult);

    const statusMap = {};
    statusResult.forEach(row => {
      const normalizedStatus = row.status.toLowerCase();
      statusMap[normalizedStatus] = row.count;
    });

    const passedSteps = statusMap['passed'] || statusMap['pass'] || 0;
    const failedSteps = statusMap['failed'] || statusMap['fail'] || 0;
    const pendingSteps = statusMap['pending'] || 0;

    // Tests by priority
    const priorityResult = await allQuery(`
      SELECT priority, COUNT(*) as count 
      FROM test_cases_new 
      WHERE user_id = ?
      GROUP BY LOWER(priority)
      ORDER BY 
        CASE WHEN LOWER(priority) = 'critical' THEN 0
             WHEN LOWER(priority) = 'high' THEN 1
             WHEN LOWER(priority) = 'medium' THEN 2
             WHEN LOWER(priority) = 'low' THEN 3
             ELSE 4 END
    `, [userId]);

    // Tests by module
    const moduleResult = await allQuery(`
      SELECT module, COUNT(*) as count 
      FROM test_cases_new 
      WHERE user_id = ?
      GROUP BY LOWER(module)
      ORDER BY count DESC
    `, [userId]);

    // Tests by type - normalize case
    const typeResult = await allQuery(`
      SELECT LOWER(type) as type, COUNT(*) as count 
      FROM test_cases_new 
      WHERE user_id = ?
      GROUP BY LOWER(type)
    `, [userId]);

    // Calculate pass rate
    const totalSteps = passedSteps + failedSteps + pendingSteps;
    const passRate = totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 0;

    res.json({
      success: true,
      summary: {
        totalTests,
        totalSteps,
        passedSteps,
        failedSteps,
        pendingSteps,
        passRate: passRate,
        failRate: totalSteps > 0 ? Math.round((failedSteps / totalSteps) * 100) : 0
      },
      byPriority: priorityResult.reduce((acc, row) => {
        const normalized = (row.priority || 'Unknown').charAt(0).toUpperCase() + (row.priority || 'Unknown').slice(1).toLowerCase();
        acc[normalized] = row.count;
        return acc;
      }, {}),
      byModule: moduleResult.reduce((acc, row) => {
        acc[row.module || 'Uncategorized'] = row.count;
        return acc;
      }, {}),
      byType: typeResult.reduce((acc, row) => {
        const typeKey = (row.type || 'manual').charAt(0).toUpperCase() + (row.type || 'manual').slice(1).toLowerCase();
        acc[typeKey] = row.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

/**
 * GET /api/analytics/test-cases
 * Get all test cases with their details
 */
router.get('/test-cases', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status; // filter by status
    const priority = req.query.priority; // filter by priority

    let query = 'SELECT * FROM test_cases_new WHERE user_id = ?';
    const params = [userId];

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Get total count
    const countResult = await getQuery(query.replace('*', 'COUNT(*) as count'), params);
    const total = countResult?.count || 0;

    // Get paginated test cases
    const testCases = await allQuery(
      query + ' ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [...params, limit, offset]
    );

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
 * GET /api/analytics/by-module/:module
 * Get detailed breakdown by specific module
 */
router.get('/by-module/:module', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const moduleName = req.params.module;

    const testCases = await allQuery(`
      SELECT 
        tc.id,
        tc.name,
        tc.priority,
        tc.type,
        COUNT(ts.id) as stepCount,
        SUM(CASE WHEN ts.status = 'PASS' OR ts.status = 'pass' THEN 1 ELSE 0 END) as passedSteps
      FROM test_cases_new tc
      LEFT JOIN test_steps ts ON tc.id = ts.test_case_id
      WHERE tc.user_id = ? AND tc.module = ?
      GROUP BY tc.id
      ORDER BY tc.created_at DESC
    `, [userId, moduleName]);

    res.json({
      success: true,
      module: moduleName,
      testCases: testCases,
      summary: {
        total: testCases.length,
        totalSteps: testCases.reduce((sum, tc) => sum + (tc.stepCount || 0), 0),
        passedSteps: testCases.reduce((sum, tc) => sum + (tc.passedSteps || 0), 0)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching module analytics:', error);
    res.status(500).json({ error: 'Failed to fetch module analytics' });
  }
});

/**
 * GET /api/analytics/by-module
 * Get detailed breakdown by all modules
 */
router.get('/by-module', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const modules = await allQuery(`
      SELECT 
        module,
        COUNT(*) as totalTests,
        SUM(CASE WHEN type = 'automation' THEN 1 ELSE 0 END) as automationTests,
        SUM(CASE WHEN type = 'manual' THEN 1 ELSE 0 END) as manualTests
      FROM test_cases_new 
      WHERE user_id = ?
      GROUP BY module
      ORDER BY totalTests DESC
    `, [userId]);

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
    const userId = req.user?.id;

    const priorities = await allQuery(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM test_cases_new 
      WHERE user_id = ?
      GROUP BY priority
      ORDER BY 
        CASE WHEN priority = 'Critical' THEN 0
             WHEN priority = 'High' THEN 1
             WHEN priority = 'Medium' THEN 2
             WHEN priority = 'Low' THEN 3
             ELSE 4 END
    `, [userId]);

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
    const userId = req.user?.id;

    const types = await allQuery(`
      SELECT 
        type,
        COUNT(*) as count
      FROM test_cases_new 
      WHERE user_id = ?
      GROUP BY type
    `, [userId]);

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
    const userId = req.user?.id;

    const statuses = await allQuery(`
      SELECT 
        ts.status,
        COUNT(*) as count
      FROM test_steps ts
      JOIN test_cases_new tc ON ts.test_case_id = tc.id
      WHERE tc.user_id = ?
      GROUP BY ts.status
    `, [userId]);

    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    console.error('❌ Error in step-status:', error);
    res.status(500).json({ error: 'Failed to fetch step status' });
  }
});

/**
 * GET /api/analytics/export/csv
 * Export analytics as CSV
 */
router.get('/export/csv', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const testCases = await allQuery(`
      SELECT 
        tc.id,
        tc.name,
        tc.module,
        tc.priority,
        tc.type,
        COUNT(ts.id) as totalSteps,
        SUM(CASE WHEN ts.status IN ('PASS', 'pass') THEN 1 ELSE 0 END) as passedSteps
      FROM test_cases_new tc
      LEFT JOIN test_steps ts ON tc.id = ts.test_case_id
      WHERE tc.user_id = ?
      GROUP BY tc.id
      ORDER BY tc.created_at DESC
    `, [userId]);

    // Build CSV
    const headers = ['ID', 'Test Case Name', 'Module', 'Priority', 'Type', 'Total Steps', 'Passed Steps'];
    const rows = testCases.map(tc => [
      tc.id,
      `"${tc.name.replace(/"/g, '""')}"`,
      tc.module,
      tc.priority,
      tc.type,
      tc.totalSteps || 0,
      tc.passedSteps || 0
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"');
    res.send(csv);
  } catch (error) {
    console.error('❌ Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

/**
 * GET /api/analytics/debug
 * Debug endpoint - check database status
 */
router.get('/debug', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Analytics service is running',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/analytics/summary - Overall statistics',
        'GET /api/analytics/test-cases - List test cases with pagination',
        'GET /api/analytics/by-module - Breakdown by module',
        'GET /api/analytics/by-priority - Breakdown by priority',
        'GET /api/analytics/by-type - Breakdown by type',
        'GET /api/analytics/step-status - Step execution status',
        'GET /api/analytics/export/csv - Export as CSV'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

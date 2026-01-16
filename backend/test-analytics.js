#!/usr/bin/env node

/**
 * Analytics API Test Suite
 * Tests all analytics endpoints
 * 
 * Usage: node test-analytics.js [token]
 */

const http = require('http');
const BASE_URL = 'http://localhost:3000/api/analytics';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function to make HTTP requests
const makeRequest = (path, method = 'GET', token) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Test functions
const tests = {
  summary: async (token) => {
    console.log(`\n${colors.blue}Testing: GET /api/analytics/summary${colors.reset}`);
    const result = await makeRequest('/summary', 'GET', token);
    console.log(`Status: ${result.status === 200 ? colors.green + '200 OK' : colors.red + result.status + ' ERROR'}${colors.reset}`);
    if (result.data.success) {
      console.log(`✓ Total Tests: ${result.data.summary.totalTests}`);
      console.log(`✓ Pass Rate: ${result.data.summary.passRate}%`);
      console.log(`✓ By Priority:`, result.data.byPriority);
      console.log(`✓ By Module:`, result.data.byModule);
      console.log(`✓ By Type:`, result.data.byType);
      return true;
    }
    return false;
  },

  testCases: async (token) => {
    console.log(`\n${colors.blue}Testing: GET /api/analytics/test-cases${colors.reset}`);
    const result = await makeRequest('/test-cases?page=1&limit=5', 'GET', token);
    console.log(`Status: ${result.status === 200 ? colors.green + '200 OK' : colors.red + result.status + ' ERROR'}${colors.reset}`);
    if (result.data.success) {
      console.log(`✓ Total test cases: ${result.data.pagination.total}`);
      console.log(`✓ Page: ${result.data.pagination.page} of ${result.data.pagination.pages}`);
      console.log(`✓ Items returned: ${result.data.data.length}`);
      return true;
    }
    return false;
  },

  byModule: async (token) => {
    console.log(`\n${colors.blue}Testing: GET /api/analytics/by-module${colors.reset}`);
    const result = await makeRequest('/by-module', 'GET', token);
    console.log(`Status: ${result.status === 200 ? colors.green + '200 OK' : colors.red + result.status + ' ERROR'}${colors.reset}`);
    if (result.data.success) {
      console.log(`✓ Modules found: ${result.data.data.length}`);
      result.data.data.forEach(m => {
        console.log(`  - ${m.module}: ${m.totalTests} tests (${m.automationTests || 0} automation, ${m.manualTests || 0} manual)`);
      });
      return true;
    }
    return false;
  },

  byPriority: async (token) => {
    console.log(`\n${colors.blue}Testing: GET /api/analytics/by-priority${colors.reset}`);
    const result = await makeRequest('/by-priority', 'GET', token);
    console.log(`Status: ${result.status === 200 ? colors.green + '200 OK' : colors.red + result.status + ' ERROR'}${colors.reset}`);
    if (result.data.success) {
      console.log(`✓ Priority breakdown:`);
      result.data.data.forEach(p => {
        console.log(`  - ${p.priority || 'Unknown'}: ${p.count} tests`);
      });
      return true;
    }
    return false;
  },

  byType: async (token) => {
    console.log(`\n${colors.blue}Testing: GET /api/analytics/by-type${colors.reset}`);
    const result = await makeRequest('/by-type', 'GET', token);
    console.log(`Status: ${result.status === 200 ? colors.green + '200 OK' : colors.red + result.status + ' ERROR'}${colors.reset}`);
    if (result.data.success) {
      console.log(`✓ Type breakdown:`);
      result.data.data.forEach(t => {
        console.log(`  - ${t.type || 'Unknown'}: ${t.count} tests`);
      });
      return true;
    }
    return false;
  },

  stepStatus: async (token) => {
    console.log(`\n${colors.blue}Testing: GET /api/analytics/step-status${colors.reset}`);
    const result = await makeRequest('/step-status', 'GET', token);
    console.log(`Status: ${result.status === 200 ? colors.green + '200 OK' : colors.red + result.status + ' ERROR'}${colors.reset}`);
    if (result.data.success) {
      console.log(`✓ Step status breakdown:`);
      result.data.data.forEach(s => {
        console.log(`  - ${s.status || 'Unknown'}: ${s.count} steps`);
      });
      return true;
    }
    return false;
  },

  debug: async (token) => {
    console.log(`\n${colors.blue}Testing: GET /api/analytics/debug${colors.reset}`);
    const result = await makeRequest('/debug', 'GET', token);
    console.log(`Status: ${result.status === 200 ? colors.green + '200 OK' : colors.red + result.status + ' ERROR'}${colors.reset}`);
    if (result.data.success) {
      console.log(`✓ Service Status: ${result.data.message}`);
      console.log(`✓ Available Endpoints: ${result.data.endpoints.length}`);
      return true;
    }
    return false;
  }
};

// Main execution
const main = async () => {
  const token = process.argv[2];

  if (!token) {
    console.log(`${colors.red}Error: Please provide a valid JWT token${colors.reset}`);
    console.log(`Usage: node test-analytics.js <token>`);
    console.log(`\nExample: node test-analytics.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`);
    process.exit(1);
  }

  console.log(`${colors.yellow}🧪 Analytics API Test Suite${colors.reset}`);
  console.log(`Starting tests... (using provided token)`);

  const results = {};

  try {
    results.summary = await tests.summary(token);
    results.testCases = await tests.testCases(token);
    results.byModule = await tests.byModule(token);
    results.byPriority = await tests.byPriority(token);
    results.byType = await tests.byType(token);
    results.stepStatus = await tests.stepStatus(token);
    results.debug = await tests.debug(token);
  } catch (error) {
    console.error(`${colors.red}❌ Connection Error: ${error.message}${colors.reset}`);
    console.log(`Make sure the backend server is running at ${BASE_URL}`);
    process.exit(1);
  }

  // Summary
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;

  console.log(`\n${colors.yellow}📊 Test Summary${colors.reset}`);
  console.log(`Passed: ${colors.green}${passed}/${total}${colors.reset}`);

  if (passed === total) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some tests failed${colors.reset}`);
    process.exit(1);
  }
};

main().catch(err => {
  console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});

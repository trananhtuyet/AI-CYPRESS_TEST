const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Chuyển AI test case thành Cypress spec file
 */
function generateCypressSpec(testCase, fileName) {
  const testName = testCase.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  let cypressCode = `
describe('${fileName} - AI Generated Tests', () => {
  beforeEach(() => {
    // Load the HTML file or navigate to the test environment
    cy.visit('/');
  });

  it('${testCase.name}', () => {
    // Test generated from AI analysis
`;

  // Parse test case and generate Cypress commands
  if (testCase.steps && Array.isArray(testCase.steps)) {
    testCase.steps.forEach((step, idx) => {
      cypressCode += generateCypressCommand(step);
    });
  } else {
    // Default test steps based on test type
    cypressCode += generateDefaultSteps(testCase);
  }

  cypressCode += `
  });
});
`;

  return cypressCode;
}

/**
 * Generate Cypress command từ test step
 */
function generateCypressCommand(step) {
  let command = '';

  if (!step.action && !step.expected) return '';

  const action = (step.action || '').toLowerCase();
  const expected = (step.expected || '').toLowerCase();

  // Parse action keywords
  if (action.includes('click') || action.includes('submit')) {
    command += `    cy.get('button').click();\n`;
  } else if (action.includes('fill') || action.includes('enter') || action.includes('type')) {
    command += `    cy.get('input').type('test value');\n`;
  } else if (action.includes('load') || action.includes('navigate')) {
    command += `    cy.visit('/');\n`;
  } else if (action.includes('select') || action.includes('choose')) {
    command += `    cy.get('select').select(0);\n`;
  } else if (action.includes('check') || action.includes('verify')) {
    command += `    cy.get('body').should('be.visible');\n`;
  }

  // Parse expected keywords
  if (expected.includes('visible') || expected.includes('exist')) {
    command += `    cy.get('body').should('be.visible');\n`;
  } else if (expected.includes('error')) {
    command += `    cy.get('[class*="error"]').should('be.visible');\n`;
  } else if (expected.includes('success') || expected.includes('redirect')) {
    command += `    cy.url().should('not.include', '/login');\n`;
  }

  return command;
}

/**
 * Generate default Cypress steps based on test case name
 */
function generateDefaultSteps(testCase) {
  const testName = testCase.name.toLowerCase();
  let steps = '';

  if (testName.includes('login')) {
    steps = `
    // Test: Login functionality
    cy.get('input[type="email"]').should('exist').type('test@example.com');
    cy.get('input[type="password"]').should('exist').type('password123');
    cy.get('button[type="submit"]').should('exist').click();
    cy.url().should('not.include', '/login');
    cy.get('[class*="dashboard"], [class*="welcome"]').should('be.visible');
`;
  } else if (testName.includes('register') || testName.includes('signup')) {
    steps = `
    // Test: Registration functionality
    cy.get('input[placeholder*="email" i]').type('newuser@example.com');
    cy.get('input[placeholder*="password" i]').type('password123');
    cy.get('input[placeholder*="confirm" i]').type('password123');
    cy.get('button').contains(/register|sign up/i).click();
    cy.url().should('not.include', '/register');
`;
  } else if (testName.includes('form') || testName.includes('submit')) {
    steps = `
    // Test: Form submission
    cy.get('form').should('exist');
    cy.get('input, textarea').each(($input) => {
      cy.wrap($input).type('test value');
    });
    cy.get('button[type="submit"]').click();
    cy.get('[class*="success"], [class*="confirm"]').should('be.visible');
`;
  } else if (testName.includes('button') || testName.includes('click')) {
    steps = `
    // Test: Button interactions
    cy.get('button').should('exist').click();
    cy.get('body').should('be.visible');
`;
  } else if (testName.includes('link') || testName.includes('navigation')) {
    steps = `
    // Test: Link navigation
    cy.get('a').first().should('exist').click();
    cy.url().should('not.equal', '/');
`;
  } else if (testName.includes('validation') || testName.includes('error')) {
    steps = `
    // Test: Validation and error handling
    cy.get('form').should('exist');
    cy.get('button[type="submit"]').click();
    cy.get('[class*="error"], [class*="invalid"]').should('be.visible');
`;
  } else if (testName.includes('responsive') || testName.includes('mobile')) {
    steps = `
    // Test: Responsive design
    cy.viewport('iphone-x');
    cy.get('body').should('be.visible');
    cy.viewport('ipad-2');
    cy.get('body').should('be.visible');
    cy.viewport(1280, 720);
    cy.get('body').should('be.visible');
`;
  } else if (testName.includes('security') || testName.includes('xss')) {
    steps = `
    // Test: Security checks
    cy.get('body').should('not.contain', '<script>');
    cy.get('[onclick], [onload], [onerror]').should('not.exist');
`;
  } else {
    steps = `
    // Test: Page loads successfully
    cy.visit('/');
    cy.get('body').should('be.visible');
    cy.get('button, a, input, form').should('have.length.greaterThan', 0);
`;
  }

  return steps;
}

/**
 * Save Cypress spec file
 */
function saveCypressSpec(specCode, fileName) {
  const specFileName = `ai_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.cy.js`;
  const specPath = path.join(
    __dirname,
    '../../cypress-runner/cypress/e2e',
    specFileName
  );

  // Ensure directory exists
  const dir = path.dirname(specPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(specPath, specCode);
  console.log(`✅ Cypress spec saved: ${specFileName}`);

  return { specFileName, specPath };
}

/**
 * Run Cypress tests headless mode
 */
async function runCypressTests(specFileName) {
  try {
    console.log(`🧪 Running Cypress tests for: ${specFileName}`);

    const cypressProjectPath = path.join(__dirname, '../../cypress-runner');
    const specPath = path.join(cypressProjectPath, 'cypress/e2e', specFileName);

    if (!fs.existsSync(specPath)) {
      throw new Error(`Spec file not found: ${specPath}`);
    }

    // Run Cypress in headless mode with proper error handling
    const command = `cd "${cypressProjectPath}" && npx cypress run --spec "cypress/e2e/${specFileName}" --headless --no-exit`;

    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10
    });

    console.log('✅ Cypress execution completed');
    return {
      success: true,
      output: output,
      specFileName: specFileName
    };
  } catch (error) {
    console.error('❌ Cypress execution error:', error.message);
    return {
      success: false,
      error: error.message,
      specFileName: specFileName
    };
  }
}

/**
 * Parse Cypress test results
 */
function parseCypressResults(output) {
  // Extract pass/fail counts from Cypress output
  const passMatch = output.match(/(\d+) passing/);
  const failMatch = output.match(/(\d+) failing/);
  const pendingMatch = output.match(/(\d+) pending/);

  return {
    passed: passMatch ? parseInt(passMatch[1]) : 0,
    failed: failMatch ? parseInt(failMatch[1]) : 0,
    pending: pendingMatch ? parseInt(pendingMatch[1]) : 0,
    output: output
  };
}

module.exports = {
  generateCypressSpec,
  generateCypressCommand,
  generateDefaultSteps,
  saveCypressSpec,
  runCypressTests,
  parseCypressResults
};

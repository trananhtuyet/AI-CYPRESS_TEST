require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const initializeDatabase = require('./db/migrations');
const { initializeNewSchema } = require('./db/new-schema');
const authRoutes = require('./routes/auth');
const testCasesRoutes = require('./routes/testcases');
const testCasesV2Routes = require('./routes/testcases-v2');
const autoTestRoutes = require('./routes/autotest');
const scriptReviewRoutes = require('./routes/script-review');
const analyticsRoutes = require('./routes/analytics');
const websiteAnalyzerRoutes = require('./routes/website-analyzer');
const cypressRunnerRoutes = require('./routes/cypress-runner');

const app = express();
const PORT = process.env.PORT || 3000;
const USE_MOCK = process.env.USE_MOCK === 'true';

// Initialize Google AI client
let genAI = null;

if (!USE_MOCK && process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://localhost:3001'],
  credentials: true
}));

// Initialize database and new schema
initializeDatabase();
initializeNewSchema();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/testcases', testCasesRoutes);
app.use('/api/v2/testcases', testCasesV2Routes);
app.use('/api/autotest', autoTestRoutes);
app.use('/api', scriptReviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', websiteAnalyzerRoutes);
app.use('/api', cypressRunnerRoutes);

// Pass genAI to website analyzer routes
if (websiteAnalyzerRoutes.setGenAI) {
  websiteAnalyzerRoutes.setGenAI(genAI);
}

console.log('📍 Script Review Routes Registered: /api/review-test-script, /api/validate-syntax, /api/ask-about-review');
console.log('📊 Analytics Routes Registered: /api/analytics/*');
console.log('🌐 Website Analyzer Routes Registered: /api/website-analyzer, /api/cypress-cheatsheet, /api/analyze-website-features, /api/generate-tests-for-feature');
console.log('🧪 Cypress Runner Routes Registered: /api/run-cypress-tests, /api/test-history');


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Check API connection endpoint
app.get('/api/check', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        error: 'GEMINI_API_KEY is not set in .env file' 
      });
    }

    res.json({ 
      status: 'success',
      message: 'API key is configured',
      apiKeyExists: true
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Test Google AI connection endpoint
app.get('/api/test-ai', async (req, res) => {
  try {
    const prompt = req.query.prompt || 'Hello, please respond with a simple greeting.';
    let text;

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } else {
      throw new Error('Google AI (Gemini) is not configured');
    }

    res.json({ 
      status: 'success',
      message: 'Successfully connected to Google AI (Gemini)',
      prompt: prompt,
      response: text
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to connect to Google AI',
      error: error.message 
    });
  }
});

app.post('/api/test-ai', async (req, res) => {
  try {
    const prompt = req.body.prompt || 'Hello, please respond with a simple greeting.';
    let text;

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } else {
      throw new Error('Google AI (Gemini) is not configured');
    }

    res.json({ 
      status: 'success',
      message: 'Successfully connected to Google AI (Gemini)',
      prompt: prompt,
      response: text
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to connect to Google AI',
      error: error.message 
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    console.log('💬 Chat request received:', message.substring(0, 50));
    
    if (!genAI) {
      return res.status(500).json({ 
        status: 'error',
        error: 'AI not configured'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Chat response generated successfully');

    res.json({ 
      status: 'success',
      message: message,
      response: text
    });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// Analyze URL endpoint - Crawl and extract page structure
app.post('/api/analyze-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        status: 'failed'
      });
    }

    // Validate URL
    new URL(url);

    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });

      // Extract page structure
      const pageAnalysis = await page.evaluate(() => {
        const elements = {
          title: document.title,
          url: window.location.href,
          forms: [],
          inputs: [],
          buttons: [],
          links: [],
          headings: []
        };

        // Get all forms
        document.querySelectorAll('form').forEach((form, idx) => {
          elements.forms.push({
            id: form.id || `form_${idx}`,
            action: form.action,
            method: form.method,
            fields: Array.from(form.querySelectorAll('input, textarea, select')).map(field => ({
              type: field.type,
              name: field.name,
              placeholder: field.placeholder,
              required: field.required
            }))
          });
        });

        // Get all inputs
        document.querySelectorAll('input').forEach((input, idx) => {
          elements.inputs.push({
            id: input.id || `input_${idx}`,
            type: input.type,
            name: input.name,
            placeholder: input.placeholder
          });
        });

        // Get all buttons
        document.querySelectorAll('button').forEach((btn, idx) => {
          elements.buttons.push({
            id: btn.id || `btn_${idx}`,
            text: btn.textContent.trim(),
            type: btn.type
          });
        });

        // Get all links
        document.querySelectorAll('a').forEach((link, idx) => {
          elements.links.push({
            id: link.id || `link_${idx}`,
            text: link.textContent.trim(),
            href: link.href
          });
        });

        // Get headings
        document.querySelectorAll('h1, h2, h3').forEach((heading) => {
          elements.headings.push({
            level: heading.tagName,
            text: heading.textContent.trim()
          });
        });

        return elements;
      });

      await browser.close();

      res.json({
        status: 'success',
        url: url,
        analysis: pageAnalysis
      });
    } catch (error) {
      if (browser) await browser.close();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Generate test cases using AI
app.post('/api/generate-tests', async (req, res) => {
  try {
    const { pageAnalysis, testType = 'basic' } = req.body;

    if (!pageAnalysis) {
      return res.status(400).json({ 
        error: 'pageAnalysis is required',
        status: 'failed'
      });
    }

    let testCode;

    if (USE_MOCK) {
      // Mock test code generation
      testCode = generateMockTestCode(pageAnalysis, testType);
    } else if (genAI) {
      // Gemini generation
      const prompt = `Based on the following website structure, generate Cypress test cases. 
    
Website Structure:
${JSON.stringify(pageAnalysis, null, 2)}

Test Type: ${testType}

Please generate:
1. Basic smoke tests (visit page, check title)
2. Form interaction tests (if forms exist)
3. Button click tests
4. Link navigation tests

Format the response as valid Cypress test code that can be directly used in a spec file.
Use describe blocks and it() statements.
Include proper assertions and waits.`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      testCode = response.text();
    } else {
      throw new Error('Google AI (Gemini) is not configured. Provide GEMINI_API_KEY in .env');
    }

    res.json({
      status: 'success',
      testCode: testCode,
      pageTitle: pageAnalysis.title,
      mockMode: USE_MOCK,
      aiProvider: genAI ? 'Gemini' : 'Mock'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Mock test code generator function
function generateMockTestCode(pageAnalysis, testType) {
  const { title, url, forms, buttons, inputs } = pageAnalysis;
  
  let code = `describe('${title}', () => {
  const baseUrl = '${url}';

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  it('should load the page successfully', () => {
    cy.title().should('contain', '${title}');
    cy.url().should('include', '${new URL(url).hostname}');
  });

  it('should have the correct page title', () => {
    cy.get('title').should('be.visible');
  });
`;

  // Add form tests
  if (forms && forms.length > 0) {
    forms.forEach((form, idx) => {
      code += `
  it('should interact with form ${idx + 1}', () => {
    cy.get('form').eq(${idx}).should('be.visible');
    // Add form field interactions
    ${form.fields.map((field, fIdx) => 
      field.type === 'text' || field.type === 'email' 
        ? `cy.get('input[name="${field.name}"]').type('test value ${fIdx}');`
        : field.type === 'checkbox' || field.type === 'radio'
        ? `cy.get('input[name="${field.name}"]').check();`
        : ''
    ).filter(Boolean).join('\n    ')}
  });
`;
    });
  }

  // Add button tests
  if (buttons && buttons.length > 0) {
    buttons.slice(0, 3).forEach((btn, idx) => {
      code += `
  it('should click button: ${btn.text}', () => {
    cy.contains('button', '${btn.text}').should('be.visible').click({ force: true });
  });
`;
    });
  }

  // Add input tests
  if (inputs && inputs.length > 0) {
    inputs.slice(0, 2).forEach((input, idx) => {
      if (input.type === 'text' || input.type === 'email') {
        code += `
  it('should fill ${input.placeholder || input.name}', () => {
    cy.get('input[name="${input.name}"]').type('test data');
    cy.get('input[name="${input.name}"]').should('have.value', 'test data');
  });
`;
      }
    });
  }

  code += `
});`;

  return code;
}

// Save and run tests
app.post('/api/run-tests', async (req, res) => {
  try {
    const { testCode, testName = 'generated-test' } = req.body;

    if (!testCode) {
      return res.status(400).json({ 
        error: 'testCode is required',
        status: 'failed'
      });
    }

    // Create cypress test file
    const testDir = path.join(__dirname, 'cypress', 'e2e');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testFile = path.join(testDir, `${testName}.cy.js`);
    fs.writeFileSync(testFile, testCode);

    res.json({
      status: 'success',
      message: 'Test file created successfully',
      testFile: testFile,
      testCode: testCode,
      note: 'Run tests with: npx cypress open or npx cypress run'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Start server with database initialization
function startServer() {
  initializeDatabase().then(() => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`🤖 Test AI: POST http://localhost:${PORT}/api/test-ai`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

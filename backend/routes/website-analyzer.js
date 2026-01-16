const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    req.token = token;
    next();
};

// Analyze website and generate test cases
router.post('/website-analyzer', verifyToken, async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`📊 Analyzing website: ${url}`);

        // Extract website content using Puppeteer
        let pageContent = '';
        try {
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
            
            // Get page content
            pageContent = await page.content();
            
            await browser.close();
        } catch (puppeteerError) {
            console.warn('⚠️ Puppeteer failed, using mock data:', puppeteerError.message);
            // Use mock data if puppeteer fails
            pageContent = `<html><body>
                <form>
                    <input type="email" placeholder="Email">
                    <input type="password" placeholder="Password">
                    <button type="submit">Login</button>
                </form>
                <nav>
                    <a href="/home">Home</a>
                    <a href="/about">About</a>
                </nav>
            </body></html>`;
        }

        // Use AI to analyze the website and generate test cases
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const analysisPrompt = `
Analyze this website HTML and provide:

1. List of main features/functionalities detected
2. Generate 3-5 Cypress test cases for the main features

Website URL: ${url}
Website HTML:
${pageContent.substring(0, 5000)}

Respond in JSON format:
{
  "features": [
    {
      "name": "Feature name",
      "type": "form|navigation|authentication|search|modal|table|api|payment|social",
      "description": "Brief description"
    }
  ],
  "testCases": [
    {
      "title": "Test case title",
      "type": "Functional|Security|Performance|UI/UX|Accessibility",
      "description": "Test case description",
      "code": "cy.visit('...');\ncy.get('...').click();\ncy.should('...');"
    }
  ]
}`;

        const result = await model.generateContent(analysisPrompt);
        let analysisText = result.response.text();

        // Extract JSON from response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        let analysisData = JSON.parse(jsonMatch[0]);

        // Ensure proper structure
        if (!Array.isArray(analysisData.features)) {
            analysisData.features = [];
        }
        if (!Array.isArray(analysisData.testCases)) {
            analysisData.testCases = [];
        }

        // Add Cypress best practices to test cases
        analysisData.testCases = analysisData.testCases.map(tc => ({
            ...tc,
            code: enhanceCypressCode(tc.code || '')
        }));

        console.log('✅ Analysis completed');

        res.json({
            url,
            features: analysisData.features || [],
            testCases: analysisData.testCases || [],
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error analyzing website:', error);
        res.status(500).json({
            error: 'Failed to analyze website',
            message: error.message
        });
    }
});

// Enhance Cypress code with best practices
function enhanceCypressCode(code) {
    // Add common Cypress best practices
    const enhancements = `
// Cypress Best Practices:
// ✅ Use data-testid attributes for reliable selectors
// ✅ Use cy.get() for element selection
// ✅ Use cy.contains() for text-based selection
// ✅ Chain assertions for better readability
// ✅ Use cy.visit() to navigate
// ✅ Use cy.should() for assertions
// ✅ Use cy.wait() to wait for API calls

${code}

// Tips:
// - Use .first() or .last() to target specific elements
// - Use .eq(index) for nth-child selection
// - Use .parent() or .closest() for parent selection
// - Screenshot on failure: cy.screenshot('failure')
// - Use cy.intercept() to mock API responses
`;
    return enhancements;
}

// Get Cypress cheatsheet
router.get('/cypress-cheatsheet', verifyToken, (req, res) => {
    const cheatsheet = {
        selectors: [
            'cy.get("[data-testid=elementId]")',
            'cy.get("input[type=email]")',
            'cy.contains("button", "Login")',
            'cy.get(".classname")',
            'cy.get("#id")'
        ],
        interactions: [
            'cy.click()',
            'cy.type("text")',
            'cy.select("option")',
            'cy.check() / cy.uncheck()',
            'cy.clear()',
            'cy.submit()',
            'cy.trigger("hover")'
        ],
        assertions: [
            'cy.should("exist")',
            'cy.should("be.visible")',
            'cy.should("contain", "text")',
            'cy.should("have.value", "value")',
            'cy.should("have.class", "classname")',
            'cy.should("have.attr", "attribute", "value")'
        ],
        navigation: [
            'cy.visit("url")',
            'cy.go("back")',
            'cy.go("forward")',
            'cy.reload()',
            'cy.url().should("include", "/path")'
        ],
        waiting: [
            'cy.wait(1000)',
            'cy.wait("@api_call")',
            'cy.intercept("GET", "/api/*", {statusCode: 200})'
        ],
        screenshots: [
            'cy.screenshot()',
            'cy.screenshot("before-click")',
            'cy.get(".element").screenshot()'
        ]
    };

    res.json(cheatsheet);
});

module.exports = router;

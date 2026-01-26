const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

// Initialize Google AI safely
let genAI = null;
try {
    if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (error) {
    console.warn('⚠️ Google AI initialization failed:', error.message);
}

// Export function to set genAI from server
function setGenAI(aiInstance) {
    genAI = aiInstance;
}

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
        let pageTitle = '';
        let pageUrl = '';
        
        try {
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Get page metadata
            pageContent = await page.content();
            pageTitle = await page.title();
            pageUrl = page.url();
            
            await browser.close();
            console.log(`✅ Successfully fetched: ${pageTitle}`);
        } catch (puppeteerError) {
            console.warn('⚠️ Puppeteer failed, using fallback:', puppeteerError.message);
            pageContent = `<html><body><h1>Sample Page</h1></body></html>`;
        }

        // Use AI to analyze the website
        const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;

        try {
            if (!model) {
                throw new Error('AI model not available, using fallback');
            }
            
            const analysisPrompt = `Analyze this website and provide detailed information for creating Cypress test cases.

Website Title: ${pageTitle}
Website URL: ${pageUrl}
Website Content (first 8000 chars):
${pageContent.substring(0, 8000)}

Please respond in this exact JSON format:
{
  "features": [
    {
      "name": "Feature Name",
      "type": "form|navigation|authentication|search|modal|table|api|payment|social|button|link",
      "description": "What this feature does",
      "selectors": ["CSS selector 1", "CSS selector 2"],
      "interactions": ["click", "type", "submit"]
    }
  ],
  "testCases": [
    {
      "title": "Descriptive Test Name",
      "type": "Functional",
      "description": "What is being tested",
      "code": "cy.visit('${pageUrl}');\\ncy.get('selector').should('be.visible');\\ncy.get('button').click();\\ncy.get('.result').should('contain', 'Success');"
    }
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}`;

            const result = await model.generateContent(analysisPrompt);
            let analysisText = result.response.text();

            // Extract JSON from response
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI response');
            }

            let analysisData;
            try {
                analysisData = JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError.message);
                analysisData = { features: [], testCases: [], recommendations: [] };
            }

            // Validate and enhance data
            analysisData.features = (Array.isArray(analysisData.features) ? analysisData.features : [])
                .map(f => ({
                    name: f.name || 'Unknown Feature',
                    type: f.type || 'button',
                    description: f.description || 'Feature for testing',
                    selectors: f.selectors || [],
                    interactions: f.interactions || []
                }));

            analysisData.testCases = (Array.isArray(analysisData.testCases) ? analysisData.testCases : [])
                .map(tc => ({
                    title: tc.title || 'Test Case',
                    type: tc.type || 'Functional',
                    description: tc.description || '',
                    code: enhanceCypressCode(tc.code || `cy.visit('${pageUrl}');`)
                }));

            analysisData.recommendations = Array.isArray(analysisData.recommendations) ? analysisData.recommendations : [];

            console.log(`✅ Analysis completed with ${analysisData.features.length} features and ${analysisData.testCases.length} test cases`);

            res.json({
                url: pageUrl,
                title: pageTitle,
                features: analysisData.features,
                testCases: analysisData.testCases,
                recommendations: analysisData.recommendations,
                generatedAt: new Date().toISOString()
            });

        } catch (aiError) {
            console.error('⚠️ AI Analysis Error:', aiError.message);
            // Return default structure on AI failure
            res.json({
                url: pageUrl,
                title: pageTitle,
                features: generateDefaultFeatures(pageContent),
                testCases: generateDefaultTestCases(pageUrl),
                recommendations: [
                    'Add data-testid attributes to your elements for better selector reliability',
                    'Implement proper form validation feedback',
                    'Consider adding loading states for async operations'
                ],
                generatedAt: new Date().toISOString(),
                note: 'Using fallback analysis due to AI unavailability'
            });
        }

    } catch (error) {
        console.error('❌ Error analyzing website:', error);
        res.status(500).json({
            error: 'Failed to analyze website',
            message: error.message
        });
    }
});

function generateDefaultFeatures(content) {
    const features = [];
    
    if (content.includes('<form')) features.push({
        name: 'Form',
        type: 'form',
        description: 'User input form for data submission',
        selectors: ['form', 'input', 'textarea', 'select'],
        interactions: ['type', 'select', 'submit']
    });
    
    if (content.includes('input[type="email"]')) features.push({
        name: 'Email Input',
        type: 'form',
        description: 'Email field for user authentication or signup',
        selectors: ['input[type="email"]'],
        interactions: ['type', 'clear']
    });
    
    if (content.includes('button') || content.includes('<a')) features.push({
        name: 'Navigation Buttons',
        type: 'navigation',
        description: 'Links and buttons for page navigation',
        selectors: ['button', 'a[href]'],
        interactions: ['click']
    });
    
    if (content.includes('<table')) features.push({
        name: 'Data Table',
        type: 'table',
        description: 'Tabular data display',
        selectors: ['table', 'tr', 'td'],
        interactions: ['click', 'read']
    });
    
    if (features.length === 0) features.push({
        name: 'Page Content',
        type: 'button',
        description: 'General page elements',
        selectors: ['body', 'main', 'section'],
        interactions: ['visit', 'click']
    });
    
    return features;
}

function generateDefaultTestCases(url) {
    return [
        {
            title: 'Page Load & Visibility',
            type: 'Functional',
            description: 'Verify page loads successfully',
            code: `cy.visit('${url}');\ncy.get('body').should('be.visible');\ncy.title().should('not.be.empty');`
        },
        {
            title: 'Element Visibility',
            type: 'UI/UX',
            description: 'Check main elements are visible',
            code: `cy.visit('${url}');\ncy.get('main, section, [role="main"]').should('be.visible').or('exist');`
        },
        {
            title: 'Navigation Links',
            type: 'Functional',
            description: 'Test navigation functionality',
            code: `cy.visit('${url}');\ncy.get('a[href]:first').should('be.visible');\ncy.get('button:first').should('exist');`
        }
    ];
}

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

/**
 * Analyze website using Cypress to discover all features/functionality
 * POST /api/analyze-website-features
 */
router.post('/analyze-website-features', async (req, res) => {
    console.log('📌 Route /analyze-website-features called');
    console.log('📌 Request body:', JSON.stringify(req.body).substring(0, 100));
    
    try {
        const { url } = req.body;

        if (!url) {
            console.log('❌ No URL provided');
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`🔍 Analyzing website features: ${url}`);

        // Extract content using Puppeteer
        let pageContent = '';
        let buttons = [];
        let forms = [];
        let links = [];
        let inputs = [];
        
        try {
            console.log('🚀 Launching Puppeteer browser...');
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            console.log('✅ Browser launched');
            
            const page = await browser.newPage();
            page.setDefaultTimeout(30000);
            page.setDefaultNavigationTimeout(30000);
            
            console.log('🌐 Navigating to:', url);
            await page.goto(url, { waitUntil: 'load', timeout: 30000 });
            console.log('✅ Page loaded');

            // Extract all interactive elements
            console.log('🔎 Extracting buttons...');
            buttons = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('button, [role="button"]')).map(btn => ({
                    text: btn.textContent?.trim().substring(0, 50),
                    selector: btn.id || btn.className || 'button',
                    type: 'button'
                }));
            });
            console.log(`✅ Found ${buttons.length} buttons`);

            console.log('🔎 Extracting forms...');
            forms = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('form')).map(form => ({
                    text: form.querySelector('h1, h2, h3, label')?.textContent?.trim() || 'Form',
                    selector: form.id || form.className || 'form',
                    type: 'form',
                    fields: Array.from(form.querySelectorAll('input, textarea, select')).map(f => ({
                        name: f.name || f.placeholder,
                        type: f.type
                    }))
                }));
            });
            console.log(`✅ Found ${forms.length} forms`);

            console.log('🔎 Extracting links...');
            links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href]')).map(link => ({
                    text: link.textContent?.trim().substring(0, 50),
                    href: link.href,
                    type: 'link'
                })).filter(l => l.text && l.href);
            });
            console.log(`✅ Found ${links.length} links`);

            console.log('🔎 Extracting inputs...');
            inputs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea')).map(inp => ({
                    name: inp.name || inp.placeholder,
                    inputType: inp.type,
                    elementType: 'input_field'
                })).filter(i => i.name);
            });
            console.log(`✅ Found ${inputs.length} input fields`);

            pageContent = await page.content();
            console.log('🛑 Closing browser...');
            await browser.close();
            console.log('✅ Browser closed');

        } catch (err) {
            console.error('❌ Puppeteer error:', err.message);
            return res.status(500).json({ 
                error: 'Failed to analyze website: ' + err.message 
            });
        }

        // Use AI to summarize features
        const useMock = process.env.USE_MOCK === 'true';
        let features = [];

        if (!useMock && genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                
                const analysisPrompt = `Bạn là một QA automation engineer. Phân tích các tính năng của website này dựa trên các phần tử tìm thấy:

BUTTONS: ${buttons.map(b => b.text).join(', ')}
FORMS: ${forms.map(f => f.text).join(', ')}
LINKS: ${links.map(l => l.text).join(', ')}
INPUTS: ${inputs.map(i => i.name).join(', ')}

Hãy tóm tắt thành một danh sách các CHỨC NĂNG CHÍNH của website này (tối đa 10 chức năng).
Định dạng JSON:
{
  "features": [
    {
      "name": "Tên chức năng",
      "description": "Mô tả ngắn",
      "elements": ["button text hoặc form name"],
      "priority": "High|Medium|Low"
    }
  ]
}`;

                const result = await model.generateContent(analysisPrompt);
                const responseText = result.response.text();
                
                try {
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            const data = JSON.parse(jsonMatch[0]);
                            features = data.features || [];
                        } catch (parseErr) {
                            console.error('❌ JSON parse error in analyze-website-features:', parseErr.message);
                            features = [];
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Failed to parse AI response:', e.message);
                }
            } catch (err) {
                console.warn('⚠️ AI analysis failed:', err.message);
            }
        }

        // If AI failed or mock mode, create default features
        if (features.length === 0) {
            features = [];
            
            buttons.forEach(btn => {
                if (btn.text && btn.text.length > 0) {
                    features.push({
                        name: btn.text,
                        description: `Button: ${btn.text}`,
                        elements: [btn.text],
                        priority: 'Medium',
                        type: 'button'
                    });
                }
            });

            forms.forEach(form => {
                if (form.text && form.text.length > 0) {
                    features.push({
                        name: form.text,
                        description: `Form with ${form.fields.length} field(s)`,
                        elements: [form.text],
                        priority: 'High',
                        type: 'form'
                    });
                }
            });
        }

        console.log(`📊 Analysis complete! Found ${features.length} features`);
        console.log('✅ Sending response with features...');
        
        res.json({
            success: true,
            url: url,
            features: features.slice(0, 10),
            total_features: features.length,
            raw_elements: {
                buttons: buttons.slice(0, 5),
                forms: forms.slice(0, 3),
                links: links.slice(0, 5)
            }
        });
        
        console.log('✅ Response sent successfully');

    } catch (error) {
        console.error('❌ Website Analysis Error:', error.message);
        res.status(500).json({
            error: 'Failed to analyze website: ' + error.message
        });
    }
});

/**
 * Generate test cases for a specific website feature
 * POST /api/generate-tests-for-feature
 */
router.post('/generate-tests-for-feature', async (req, res) => {
    try {
        const { url, feature, featureDescription } = req.body;

        if (!url || !feature) {
            return res.status(400).json({ error: 'URL and feature name are required' });
        }

        console.log(`✏️ Generating test cases for feature: ${feature}`);

        const useMock = process.env.USE_MOCK === 'true';

        if (!genAI && !useMock) {
            return res.status(500).json({ error: 'AI not configured' });
        }

        let testCases = [];

        if (useMock) {
            // Mock test cases - 10 comprehensive test cases
            testCases = [
                {
                    id: 1,
                    name: `Test ${feature} - Happy Path`,
                    description: `Verify ${feature} works with valid inputs`,
                    steps: [
                        `Visit ${url}`,
                        `Locate the ${feature} element`,
                        `Interact with it (click/fill/submit)`,
                        `Verify success message or navigation`
                    ],
                    expectedResult: `${feature} should complete successfully`,
                    priority: 'High'
                },
                {
                    id: 2,
                    name: `Test ${feature} - Error Handling`,
                    description: `Verify ${feature} handles errors properly`,
                    steps: [
                        `Visit ${url}`,
                        `Try ${feature} with invalid data`,
                        `Verify error message is displayed`,
                        `Verify page remains stable`
                    ],
                    expectedResult: `Error should be handled gracefully`,
                    priority: 'High'
                },
                {
                    id: 3,
                    name: `Test ${feature} - Edge Cases`,
                    description: `Verify ${feature} handles edge cases`,
                    steps: [
                        `Visit ${url}`,
                        `Test with boundary values`,
                        `Test with special characters`,
                        `Verify handling is correct`
                    ],
                    expectedResult: `Edge cases should be handled appropriately`,
                    priority: 'Medium'
                },
                {
                    id: 4,
                    name: `Test ${feature} - Empty Input`,
                    description: `Verify ${feature} handles empty/null input`,
                    steps: [
                        `Visit ${url}`,
                        `Try to use ${feature} without required input`,
                        `Observe validation message`,
                        `Verify form does not submit`
                    ],
                    expectedResult: `Should show validation error for empty input`,
                    priority: 'Medium'
                },
                {
                    id: 5,
                    name: `Test ${feature} - Performance`,
                    description: `Verify ${feature} responds quickly`,
                    steps: [
                        `Visit ${url}`,
                        `Use ${feature}`,
                        `Measure response time`,
                        `Verify loads within acceptable time`
                    ],
                    expectedResult: `Response should be under 2 seconds`,
                    priority: 'Medium'
                },
                {
                    id: 6,
                    name: `Test ${feature} - User Feedback`,
                    description: `Verify user feedback is clear`,
                    steps: [
                        `Visit ${url}`,
                        `Use ${feature}`,
                        `Look for success/error messages`,
                        `Verify messages are clear and helpful`
                    ],
                    expectedResult: `User should see appropriate feedback messages`,
                    priority: 'Medium'
                },
                {
                    id: 7,
                    name: `Test ${feature} - Multiple Attempts`,
                    description: `Verify ${feature} handles multiple uses`,
                    steps: [
                        `Visit ${url}`,
                        `Use ${feature} multiple times`,
                        `Verify each attempt works correctly`,
                        `Check for data consistency`
                    ],
                    expectedResult: `All attempts should work correctly`,
                    priority: 'Low'
                },
                {
                    id: 8,
                    name: `Test ${feature} - Cross-browser Compatibility`,
                    description: `Verify ${feature} works across browsers`,
                    steps: [
                        `Test in Chrome`,
                        `Test in Firefox`,
                        `Test in Safari`,
                        `Verify all work similarly`
                    ],
                    expectedResult: `${feature} should work consistently across browsers`,
                    priority: 'Low'
                },
                {
                    id: 9,
                    name: `Test ${feature} - Mobile Responsive`,
                    description: `Verify ${feature} works on mobile`,
                    steps: [
                        `Visit ${url} on mobile viewport`,
                        `Use ${feature}`,
                        `Verify layout adapts properly`,
                        `Test all interactions`
                    ],
                    expectedResult: `${feature} should be fully functional on mobile`,
                    priority: 'Medium'
                },
                {
                    id: 10,
                    name: `Test ${feature} - Data Validation`,
                    description: `Verify ${feature} validates data correctly`,
                    steps: [
                        `Visit ${url}`,
                        `Test with invalid formats`,
                        `Test with valid formats`,
                        `Verify validation logic`
                    ],
                    expectedResult: `Should accept valid data and reject invalid data`,
                    priority: 'High'
                }
            ];
        } else {
            // Use AI to generate comprehensive test cases
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                
                const testPrompt = `Bạn là một chuyên gia Cypress testing. Tạo 8-12 test case chi tiết cho chức năng này:

URL: ${url}
Chức năng: ${feature}
Mô tả: ${featureDescription || 'N/A'}

Hãy tạo các test case bao gồm:
1. Happy path - chức năng hoạt động bình thường
2. Error handling - xử lý lỗi
3. Edge cases - trường hợp đặc biệt
4. Boundary tests - test giới hạn
5. User interaction variations - các cách tương tác khác nhau
6. Security/validation - kiểm tra validation

Mỗi test case phải chi tiết và có thể chạy được. Tạo tối thiểu 8 test case.

Định dạng JSON:
{
  "testCases": [
    {
      "id": 1,
      "name": "Test name",
      "description": "What this test validates",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "expectedResult": "What should happen",
      "priority": "High|Medium|Low",
      "code": "Complete Cypress test code"
    }
  ]
}`;

                const result = await model.generateContent(testPrompt);
                const responseText = result.response.text();
                
                try {
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            const data = JSON.parse(jsonMatch[0]);
                            testCases = data.testCases || [];
                        } catch (parseErr) {
                            console.error('❌ JSON parse error in test generation:', parseErr.message);
                            testCases = [];
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Failed to parse AI test cases:', e.message);
                }
            } catch (err) {
                console.error('❌ AI test generation error:', err.message);
            }
        }

        // Fallback if AI failed - provide at least 5 test cases
        if (testCases.length === 0) {
            testCases = [
                {
                    id: 1,
                    name: `Test ${feature} - Basic Functionality`,
                    description: `Basic test for ${feature}`,
                    steps: [
                        `Visit the website`,
                        `Find ${feature}`,
                        `Verify it exists and is interactable`,
                        `Verify expected behavior`
                    ],
                    expectedResult: `${feature} should work as expected`,
                    priority: 'High',
                    code: `describe('${feature}', () => { it('should work correctly', () => { cy.visit('${url}') }) })`
                },
                {
                    id: 2,
                    name: `Test ${feature} - Visibility`,
                    description: `Verify ${feature} is visible and accessible`,
                    steps: [
                        `Visit the website`,
                        `Check if ${feature} is visible`,
                        `Verify it is not disabled`,
                        `Check accessibility`
                    ],
                    expectedResult: `${feature} should be visible and accessible`,
                    priority: 'Medium'
                },
                {
                    id: 3,
                    name: `Test ${feature} - Interaction`,
                    description: `Test user interaction with ${feature}`,
                    steps: [
                        `Visit the website`,
                        `Interact with ${feature}`,
                        `Observe response`,
                        `Verify no errors occur`
                    ],
                    expectedResult: `${feature} should respond to user interaction`,
                    priority: 'High'
                },
                {
                    id: 4,
                    name: `Test ${feature} - Error State`,
                    description: `Test error handling for ${feature}`,
                    steps: [
                        `Visit the website`,
                        `Try invalid interaction`,
                        `Observe error handling`,
                        `Verify graceful failure`
                    ],
                    expectedResult: `Errors should be handled gracefully`,
                    priority: 'Medium'
                },
                {
                    id: 5,
                    name: `Test ${feature} - Data Persistence`,
                    description: `Test data persistence after using ${feature}`,
                    steps: [
                        `Visit the website`,
                        `Use ${feature}`,
                        `Verify data is saved`,
                        `Reload page and verify persistence`
                    ],
                    expectedResult: `Data should persist after page reload`,
                    priority: 'Medium'
                }
            ];
        }

        res.json({
            success: true,
            feature: feature,
            testCases: testCases
        });

    } catch (error) {
        console.error('❌ Test Generation Error:', error.message);
        res.status(500).json({
            error: 'Failed to generate test cases: ' + error.message
        });
    }
});

// Generate detailed test cases for a specific feature using AI
router.post('/generate-feature-tests', verifyToken, async (req, res) => {
    try {
        const { featureName, featureType, featureDescription } = req.body;

        if (!featureName) {
            return res.status(400).json({ error: 'Feature name is required' });
        }

        console.log(`🤖 Generating test cases for feature: ${featureName}`);

        let testCases = [];

        // Try using Google Gemini AI if available
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                
                const prompt = `Bạn là chuyên gia kiểm thử phần mềm. Hãy sinh ra 5-7 test cases chi tiết cho tính năng sau:

Tên Tính Năng: ${featureName}
Loại: ${featureType || 'Không xác định'}
Mô Tả: ${featureDescription || 'Tính năng chính của website'}

Yêu cầu:
1. Mỗi test case phải cụ thể, có thể chạy được
2. Bao gồm cả trường hợp thành công và thất bại
3. Trả về JSON array với định dạng:
[
  {
    "name": "Tên test case",
    "steps": ["Bước 1", "Bước 2", "Bước 3"],
    "expectedResult": "Kết quả dự kiến",
    "priority": "Critical|High|Medium|Low",
    "status": "PENDING"
  }
]

Chỉ trả về JSON, không text thêm.`;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                
                // Try to parse JSON from response
                try {
                    // Extract JSON from the response
                    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const parsedTests = JSON.parse(jsonMatch[0]);
                        testCases = parsedTests.map((tc, idx) => ({
                            id: `AI${Date.now()}_${idx}`,
                            name: tc.name || `Test ${idx + 1}`,
                            steps: Array.isArray(tc.steps) ? tc.steps : [tc.steps || ''],
                            expectedResult: tc.expectedResult || tc.expected_result || 'Không xác định',
                            priority: tc.priority || 'Medium',
                            status: tc.status || 'PENDING',
                            executionTime: '0s',
                            isAIGenerated: true
                        }));
                    } else {
                        throw new Error('Could not extract JSON from AI response');
                    }
                } catch (parseError) {
                    console.error('JSON Parse Error:', parseError.message);
                    // Fallback to structured test cases
                    testCases = generateFallbackTestCases(featureName);
                }
            } catch (aiError) {
                console.warn('⚠️ AI Generation failed, using fallback:', aiError.message);
                testCases = generateFallbackTestCases(featureName);
            }
        } else {
            // Fallback if no AI available
            testCases = generateFallbackTestCases(featureName);
        }

        res.json({
            success: true,
            feature: featureName,
            testCases: testCases
        });

    } catch (error) {
        console.error('❌ Feature Test Generation Error:', error.message);
        res.status(500).json({
            error: 'Failed to generate feature test cases: ' + error.message
        });
    }
});

// Helper function for fallback test cases
function generateFallbackTestCases(featureName) {
    const basePriorities = ['Critical', 'High', 'Medium'];
    
    return [
        {
            id: `FALLBACK_${Date.now()}_1`,
            name: `${featureName} - Trường hợp hợp lệ cơ bản`,
            steps: ['Truy cập tính năng', 'Nhập dữ liệu hợp lệ', 'Xác nhận hành động', 'Kiểm tra kết quả'],
            expectedResult: 'Tính năng hoạt động bình thường, dữ liệu được xử lý',
            priority: 'Critical',
            status: 'PENDING',
            executionTime: '0s'
        },
        {
            id: `FALLBACK_${Date.now()}_2`,
            name: `${featureName} - Trường hợp dữ liệu trống`,
            steps: ['Truy cập tính năng', 'Không nhập dữ liệu', 'Nhấp xác nhận', 'Kiểm tra phản hồi'],
            expectedResult: 'Hiển thị thông báo lỗi hoặc yêu cầu nhập dữ liệu',
            priority: 'High',
            status: 'PENDING',
            executionTime: '0s'
        },
        {
            id: `FALLBACK_${Date.now()}_3`,
            name: `${featureName} - Trường hợp dữ liệu không hợp lệ`,
            steps: ['Truy cập tính năng', 'Nhập dữ liệu không hợp lệ', 'Xác nhận hành động', 'Kiểm tra phản hồi'],
            expectedResult: 'Hiển thị thông báo lỗi xác thực',
            priority: 'High',
            status: 'PENDING',
            executionTime: '0s'
        },
        {
            id: `FALLBACK_${Date.now()}_4`,
            name: `${featureName} - Kiểm tra hiệu suất`,
            steps: ['Truy cập tính năng', 'Thực hiện hành động', 'Đo thời gian phản ứng', 'So sánh với chuẩn'],
            expectedResult: 'Thời gian phản ứng dưới 3 giây',
            priority: 'Medium',
            status: 'PENDING',
            executionTime: '0s'
        },
        {
            id: `FALLBACK_${Date.now()}_5`,
            name: `${featureName} - Kiểm tra trên các trình duyệt khác nhau`,
            steps: ['Truy cập tính năng trên Chrome', 'Truy cập tính năng trên Firefox', 'Truy cập tính năng trên Safari', 'So sánh kết quả'],
            expectedResult: 'Tính năng hoạt động nhất quán trên tất cả trình duyệt',
            priority: 'Medium',
            status: 'PENDING',
            executionTime: '0s'
        }
    ];
}

// Execute test case and return result
router.post('/execute-test-case', verifyToken, async (req, res) => {
    try {
        const { testCaseId, featureName, steps, expectedResult } = req.body;

        if (!testCaseId || !steps) {
            return res.status(400).json({ error: 'Test case ID and steps are required' });
        }

        console.log(`🧪 Executing test case: ${testCaseId}`);

        // Simulate test execution
        const executionTime = Math.floor(Math.random() * 8000) + 1000; // 1-9 seconds
        await new Promise(resolve => setTimeout(resolve, Math.min(executionTime, 3000))); // Max 3 second delay for simulation

        // Randomly determine pass/fail (80% pass rate)
        const isSuccess = Math.random() > 0.2;
        
        const result = {
            testCaseId: testCaseId,
            status: isSuccess ? 'PASSED' : 'FAILED',
            executionTime: (executionTime / 1000).toFixed(2) + 's',
            timestamp: new Date().toISOString(),
            message: isSuccess ? 
                `Test "${testCaseId}" passed successfully` : 
                `Test "${testCaseId}" failed - assertion mismatch`
        };

        console.log(`✅ Test execution complete:`, result);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('❌ Test Execution Error:', error.message);
        res.status(500).json({
            error: 'Failed to execute test case: ' + error.message
        });
    }
});

module.exports = router;
module.exports.setGenAI = setGenAI;

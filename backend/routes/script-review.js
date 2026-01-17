const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Perform basic code analysis without AI
 */
function performBasicCodeAnalysis(code) {
  const issues = [];
  let score = 8;
  const lines = code.split('\n');

  // Check for hardcoded credentials
  if (code.includes('password') || code.includes('Password') || code.includes('PASSWORD')) {
    if (!code.includes('process.env') && !code.includes('Cypress.env')) {
      issues.push({
        type: 'error',
        title: 'Hardcoded Credentials',
        description: 'Sensitive data like passwords should not be hardcoded in test scripts.',
        suggestion: 'Use environment variables or Cypress fixtures to store credentials.'
      });
      score -= 2;
    }
  }

  // Check for missing waits
  if (code.includes('.click()') && !code.includes('waitFor') && !code.includes('wait(')) {
    issues.push({
      type: 'warning',
      title: 'Missing Explicit Waits',
      description: 'Tests may be flaky without explicit waits for elements.',
      suggestion: 'Add cy.get().should() or cy.intercept() for better reliability.'
    });
    score -= 1;
  }

  // Check for cy.visit URL
  if (code.includes('cy.visit')) {
    if (!code.includes('http://') && !code.includes('https://')) {
      issues.push({
        type: 'info',
        title: 'Relative URL Not Found',
        description: 'cy.visit() should use absolute URLs or be configured with baseUrl.',
        suggestion: 'Use baseUrl in cypress.config.js or provide full URLs.'
      });
    }
  }

  // Check for proper assertions
  const assertionCount = (code.match(/\.should\(/g) || []).length;
  if (assertionCount === 0 && code.includes('it(')) {
    issues.push({
      type: 'warning',
      title: 'Missing Assertions',
      description: 'Test has no assertions - will always pass.',
      suggestion: 'Add .should() statements to verify expected behavior.'
    });
    score -= 2;
  }

  // Check for long lines (maintainability)
  const longLines = lines.filter(l => l.length > 100);
  if (longLines.length > 0) {
    issues.push({
      type: 'info',
      title: 'Long Lines Detected',
      description: `${longLines.length} lines exceed 100 characters - harder to maintain.`,
      suggestion: 'Break long lines into multiple statements for better readability.'
    });
  }

  // Determine quality
  let quality = 'GOOD';
  if (score < 6) quality = 'POOR';
  else if (score < 7.5) quality = 'FAIR';

  // Generate improved code
  let improvedCode = code;
  if (!code.includes('baseUrl') && code.includes('cy.visit')) {
    improvedCode = code.replace(
      /cy\.visit\('([^']+)'\)/g,
      "cy.visit('$1') // Consider using baseUrl in cypress.config.js"
    );
  }

  // Determine complexity
  const describeCount = (code.match(/describe\(/g) || []).length;
  const itCount = (code.match(/it\(/g) || []).length;
  let complexity = 'LOW';
  if (itCount > 3 || describeCount > 1) complexity = 'MEDIUM';
  if (itCount > 5 || describeCount > 2) complexity = 'HIGH';

  return {
    summary: `Code analysis complete. Found ${issues.length} item(s) to address. Overall structure is ${quality.toLowerCase()}.`,
    quality,
    score: Math.max(1, Math.min(10, score)),
    complexity,
    issues,
    recommendations: [
      'Use Page Object Model pattern for better maintainability',
      'Implement custom commands for repeated actions',
      'Add before/beforeEach hooks for test setup',
      'Use data-testid attributes for reliable selectors',
      'Consider using Cypress fixtures for test data'
    ],
    details: {
      'Cấu trúc': `Contains ${describeCount} describe block(s) and ${itCount} test(s). ${complexity} complexity.`,
      'Lỗi': issues.filter(i => i.type === 'error').length + ' critical issue(s) found',
      'Hiệu năng': 'Use explicit waits (.should) instead of arbitrary delays for better performance',
      'Bảo mật': 'Avoid hardcoding sensitive data. Use environment variables instead.',
      'Best Practices': 'Follow Cypress best practices: proper waits, good selectors, clear assertions'
    },
    improvedCode: improvedCode
  };
}

/**
 * Review Cypress test script with AI
 * POST /api/review-test-script
 */
router.post('/review-test-script', async (req, res) => {
  console.log('📌 [ROUTE] /review-test-script called');
  try {
    const { code } = req.body;
    console.log('📝 Code received, length:', code?.length);

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      console.log('❌ Code validation failed');
      return res.status(400).json({
        error: 'Code không được để trống'
      });
    }

    // Check if using mock mode
    const useMock = process.env.USE_MOCK === 'true';
    console.log('🎭 USE_MOCK mode:', useMock);
    console.log('🔍 Current env.USE_MOCK value:', process.env.USE_MOCK);
    console.log('✅ genAI initialized:', !!genAI);

    if (useMock) {
      console.log('✨ Using mock analysis instead of AI');
      const analysis = performBasicCodeAnalysis(code);
      return res.json({
        ...analysis,
        status: 'mock'
      });
    }

    if (!genAI) {
      console.log('⚠️ Gemini AI not configured, using fallback analysis');
      const analysis = performBasicCodeAnalysis(code);
      return res.json({
        ...analysis,
        status: 'fallback'
      });
    }

    // Use retry logic for API calls
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const reviewPrompt = `You are a world-class Cypress test automation engineer and code quality expert. 
Your goal is to provide HIGHLY VALUABLE, ACTIONABLE feedback that directly improves test reliability and maintainability.

TEST SCRIPT TO ANALYZE:
\`\`\`javascript
${code}
\`\`\`

EVALUATION CRITERIA:
1. RELIABILITY: Does it avoid flaky tests? Uses explicit waits, proper selectors, handles async correctly?
2. MAINTAINABILITY: Is code DRY? Uses Page Object Model? Has clear variable names? Easy to debug?
3. COVERAGE: Tests positive + negative + edge cases? Validates expected vs actual results properly?
4. SECURITY: No hardcoded credentials, API keys, or sensitive data exposed?
5. PERFORMANCE: Efficient selectors? Avoids unnecessary waits? Good use of cy.intercept()?
6. CYPRESS BEST PRACTICES: Proper use of before/beforeEach? Custom commands? Good error handling?
7. ASSERTIONS: All test paths have meaningful assertions that prove desired behavior?
8. SCALABILITY: Can be easily extended? Reusable selectors? Good data management?

PROVIDE DETAILED ANALYSIS IN THIS EXACT JSON FORMAT ONLY (no markdown, no backticks):
{
  "summary": "Professional assessment (2-3 sentences) of overall quality and main strengths/weaknesses",
  "metrics": {
    "quality": "EXCELLENT|GOOD|FAIR|POOR",
    "score": 8.5,
    "complexity": "LOW|MEDIUM|HIGH"
  },
  "issues": [
    {
      "type": "CRITICAL|ERROR|WARNING|INFO",
      "title": "Specific issue title",
      "description": "Why this is a problem and its impact on test reliability",
      "suggestion": "Exact code example or clear step-by-step fix",
      "severity": "High|Medium|Low"
    }
  ],
  "recommendations": [
    "Specific, actionable improvement with business value",
    "Pattern or technique to implement with expected benefit",
    "Best practice to adopt and why it matters"
  ],
  "details": {
    "Cấu trúc": "Assessment of organization, readability, and structure quality",
    "Lỗi": "Summary of all issues by category and severity",
    "Hiệu năng": "Performance analysis and optimization opportunities",
    "Bảo mật": "Security vulnerabilities and protective measures needed",
    "Best Practices": "Cypress patterns used/missing and specific techniques to apply"
  },
  "improvedCode": "Complete improved version of the script with all suggestions applied",
  "estimatedBenefit": "Expected improvement in test reliability, maintenance time saved, or bugs prevented"
}

QUALITY REQUIREMENTS FOR YOUR RESPONSE:
- Issues must be SPECIFIC with line numbers or code references
- Suggestions must be COPY-PASTE READY (exact code, not pseudo-code)
- Recommendations must have BUSINESS VALUE (explain why it matters)
- Improved code must be PRODUCTION-READY and TESTED
- Only include issues that are REAL PROBLEMS, not nitpicks
- Prioritize issues by IMPACT on test reliability and maintainability
- Be PROFESSIONAL but helpful in tone`;

        console.log(`🤖 Attempt ${retryCount + 1}/${maxRetries}: Calling Gemini AI...`);
        
        const result = await model.generateContent(reviewPrompt);
        const responseText = result.response.text();
        
        console.log('✅ AI response received');

        let reviewData;
        try {
          try {
            reviewData = JSON.parse(responseText);
          } catch (e) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                reviewData = JSON.parse(jsonMatch[0]);
              } catch (parseErr) {
                console.error('❌ JSON parse error:', parseErr.message);
                throw new Error('Failed to parse JSON: ' + parseErr.message);
              }
            } else {
              throw new Error('No JSON found in response');
            }
          }
        } catch (jsonError) {
          console.error('❌ JSON parsing failed:', jsonError.message);
          throw jsonError;
        }

        // Ensure all required fields exist
        const review = {
          summary: reviewData.summary || 'Script analysis completed',
          metrics: {
            quality: reviewData.metrics?.quality || 'FAIR',
            score: reviewData.metrics?.score || 5,
            complexity: reviewData.metrics?.complexity || 'MEDIUM'
          },
          issues: Array.isArray(reviewData.issues) ? reviewData.issues.filter(issue => {
            // Filter for quality: must have meaningful description and suggestion
            return issue.title && issue.description && issue.description.length > 10 && 
                   issue.suggestion && issue.suggestion.length > 10;
          }) : [],
          recommendations: Array.isArray(reviewData.recommendations) ? reviewData.recommendations.filter(rec => {
            // Filter for quality: must be specific and actionable
            return rec && rec.length > 20 && !rec.includes('e.g.') && !rec.includes('for example');
          }) : [],
          details: reviewData.details || {},
          improvedCode: reviewData.improvedCode || null,
          estimatedBenefit: reviewData.estimatedBenefit || 'Implementation of suggestions will improve test reliability and maintainability'
        };

        console.log(`✅ Quality validated: ${review.issues.length} issues, ${review.recommendations.length} recommendations`);
        
        return res.json({
          status: 'success',
          ...review
        });

      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${retryCount + 1} failed:`, error.message);
        retryCount++;

        // Check if error is rate limit
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          console.log(`⏳ Rate limited. Waiting ${2000 * retryCount}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        } else {
          // For other errors, try once more with shorter wait
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If all retries failed, return mock analysis response
    console.log('⚠️ All retries exhausted, returning mock analysis response');
    
    // Perform basic analysis on the code
    const basicAnalysis = performBasicCodeAnalysis(code);
    
    return res.json({
      status: 'mock',
      summary: basicAnalysis.summary,
      metrics: {
        quality: basicAnalysis.quality,
        score: basicAnalysis.score,
        complexity: basicAnalysis.complexity
      },
      issues: basicAnalysis.issues,
      recommendations: basicAnalysis.recommendations,
      details: basicAnalysis.details,
      improvedCode: basicAnalysis.improvedCode
    });

  } catch (error) {
    console.error('Script review error:', error);
    res.status(500).json({
      error: 'Unexpected error: ' + error.message
    });
  }
});

/**
 * Quick validation endpoint
 * GET /api/validate-syntax
 */
router.get('/validate-syntax', (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'Code parameter required' });
  }

  try {
    // Basic JavaScript syntax validation using Function constructor
    new Function(code);
    res.json({
      valid: true,
      message: 'Syntax is valid'
    });
  } catch (error) {
    res.json({
      valid: false,
      error: error.message
    });
  }
});

/**
 * Chat with AI about code review results
 * POST /api/review-code-chat
 */
router.post('/review-code-chat', async (req, res) => {
  try {
    const { message, reviewData, chatHistory } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Câu hỏi không được để trống'
      });
    }

    if (!genAI) {
      return res.json({
        success: false,
        error: 'AI chưa được cấu hình'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build context from review data
    const context = reviewData ? `
Kết quả review code trước đó:
- Chất lượng: ${reviewData.metrics?.quality || 'Unknown'}
- Điểm số: ${reviewData.metrics?.score || 'N/A'}/10
- Độ phức tạp: ${reviewData.metrics?.complexity || 'Unknown'}
- Tóm tắt: ${reviewData.summary || 'N/A'}
- Vấn đề: ${reviewData.issues?.map(i => i.title).join(', ') || 'Không có'}
- Gợi ý: ${reviewData.recommendations?.slice(0, 3).join(', ') || 'Không có'}
    ` : 'Chưa có review code nào';

    // Build conversation history
    let conversationHistory = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach(chat => {
        if (chat.user) {
          conversationHistory.push({
            role: 'user',
            parts: [{ text: chat.user }]
          });
        }
        if (chat.assistant) {
          conversationHistory.push({
            role: 'model',
            parts: [{ text: chat.assistant }]
          });
        }
      });
    }

    const chatPrompt = `Bạn là một chuyên gia Cypress testing. Người dùng đã nhận được kết quả review code này:

${context}

Bây giờ họ hỏi: "${message}"

Trả lời bằng tiếng Việt, ngắn gọn (2-3 câu), và cụ thể giúp họ cải thiện code test.
Nếu câu hỏi liên quan tới review code, sử dụng thông tin từ kết quả review để trả lời.
Nếu là câu hỏi chung chung về Cypress, hãy cung cấp ví dụ code nếu cần thiết.`;

    conversationHistory.push({
      role: 'user',
      parts: [{ text: chatPrompt }]
    });

    console.log(`🤖 Chat request: "${message.substring(0, 50)}..."`);

    const result = await model.generateContent({
      contents: conversationHistory
    });

    const response = result.response.text();
    console.log('✅ Chat response received');

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('❌ Chat Error:', error.message);
    res.json({
      success: false,
      error: error.message || 'Lỗi khi xử lý chat'
    });
  }
});

/**
 * Ask follow-up questions about a review
 * POST /api/ask-about-review
 */
router.post('/ask-about-review', async (req, res) => {
  console.log('📌 [ROUTE] /ask-about-review called');
  try {
    const { question, previousReview, code } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      console.log('❌ Question validation failed');
      return res.status(400).json({
        error: 'Câu hỏi không được để trống'
      });
    }

    if (!previousReview) {
      console.log('❌ Previous review data missing');
      return res.status(400).json({
        error: 'Vui lòng review code trước'
      });
    }

    console.log('❓ Question:', question.substring(0, 100));

    // Check if using mock mode
    const useMock = process.env.USE_MOCK === 'true';
    
    if (useMock || !genAI) {
      console.log('⚠️ Using mock response for follow-up question');
      const mockAnswers = {
        'timeout': 'Timeout 5000 được sử dụng để chờ element tải xong. Nó giúp tránh flaky tests khi element chưa render. Bạn có thể điều chỉnh giá trị này tùy theo tốc độ ứng dụng.',
        'wait': 'Trong Cypress, nên dùng .should() assertions thay vì cy.wait() với ID. Điều này giúp test chặn đúng thời điểm cần thiết mà không hardcode thời gian.',
        'selector': 'Selector [name="email"] rất tốt vì nó cụ thể và ít thay đổi. Tránh dùng .class hoặc vị trí trong DOM vì dễ bị ảnh hưởng bởi thay đổi styling.',
        'assertion': 'Assertion .should("include", "/dashboard") kiểm tra URL sau login thành công. Đây là cách tốt để xác nhận navigation đúng.',
        'default': 'Dựa trên review code trước đó, điều quan trọng là sử dụng explicit waits thay vì implicit waits, tránh hardcode data, và luôn có assertions ý nghĩa.'
      };

      let answer = mockAnswers.default;
      for (const [key, value] of Object.entries(mockAnswers)) {
        if (question.toLowerCase().includes(key)) {
          answer = value;
          break;
        }
      }

      return res.json({
        success: true,
        answer: answer,
        source: 'mock'
      });
    }

    // Build context from previous review
    const reviewContext = `
KẾT QUẢ REVIEW CODE TRƯỚC:
- Chất lượng: ${previousReview.metrics?.quality || 'N/A'}
- Điểm số: ${previousReview.metrics?.score || 'N/A'}/10
- Độ phức tạp: ${previousReview.metrics?.complexity || 'N/A'}
- Số lỗi tìm thấy: ${previousReview.issues?.length || 0}

CÁC VẤN ĐỀ TÌM THẤY:
${(previousReview.issues || []).map(i => `- [${i.type.toUpperCase()}] ${i.title}: ${i.description}`).join('\n')}

GỢI Ý CẢI THIỆN:
${(previousReview.recommendations || []).map(r => `- ${r}`).join('\n')}

CODE GỐC:
\`\`\`javascript
${code}
\`\`\`
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const followUpPrompt = `Bạn là một chuyên gia Cypress testing có kinh nghiệm hơn 10 năm. 
Người dùng đã nhận được kết quả review code của mình:

${reviewContext}

Bây giờ họ có câu hỏi follow-up: "${question}"

YÊUVỀ ĐÁP TIẾP:
1. Trả lời bằng Tiếng Việt, rõ ràng và chuyên nghiệp
2. Giải thích kỹ LỚN (không quá dài, 3-5 câu)
3. Nếu câu hỏi liên quan tới code, cung cấp ví dụ code cụ thể
4. Giải thích TẠI SAO điều đó lại quan trọng
5. Nếu có cách tốt hơn, hãy đề xuất

Trả lời trực tiếp mà không dùng markdown hoặc định dạng đặc biệt.`;

    console.log('🤖 Calling Gemini AI for follow-up...');
    
    const result = await model.generateContent(followUpPrompt);
    const answer = result.response.text();

    console.log('✅ Follow-up answer received');

    res.json({
      success: true,
      answer: answer,
      source: 'ai'
    });

  } catch (error) {
    console.error('❌ Follow-up Question Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi xử lý câu hỏi'
    });
  }
});

module.exports = router;

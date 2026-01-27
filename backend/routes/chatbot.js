const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper function to set genAI
function setGenAI(instance) {
  genAI = instance;
}

/**
 * POST /api/chatbot/send
 * Send message to AI chatbot and get response
 */
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`💬 Chatbot message from user ${userId}: "${message.substring(0, 50)}..."`);

    // If AI is not available, use fallback responses
    if (!genAI) {
      console.log('⚠️ Gemini API not available, using fallback responses');
      const fallbackResponse = getFallbackResponse(message);
      return res.json({
        success: true,
        response: fallbackResponse,
        isAI: false,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Build conversation history for context
      const historyForAI = conversationHistory.slice(-6).map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // System prompt for the chatbot
      const systemPrompt = `Bạn là AI Assistant của AI-TestLab - một nền tảng QA automation testing mạnh mẽ.

Thông tin về AI-TestLab:
- Công cụ tạo test cases tự động bằng AI
- Hỗ trợ Cypress E2E testing
- Có tính năng phân tích website, sinh test case từ HTML
- Hỗ trợ kiểm thử form, navigation, security
- Tích hợp Google Gemini AI để sinh test case thông minh

Khi trả lời, hãy:
1. Tập trung vào các chủ đề: Testing, QA, Cypress, AI-TestLab
2. Nếu câu hỏi ngoài phạm vi, hãy chuyển hướng lại QA testing
3. Trả lời bằng tiếng Việt nếu người dùng nói tiếng Việt
4. Sử dụng ngôn ngữ thân thiện, chuyên nghiệp
5. Nếu được hỏi về tính năng cụ thể, giải thích rõ ràng cách sử dụng
6. Giới hạn phản hồi trong 2-3 đoạn văn để dễ đọc

Các tính năng chính:
- Website Analyzer: Quét website → phát hiện chức năng → sinh test cases
- Test Creation: Tạo test cases thủ công với UI friendly
- Test Execution: Chạy test và xem kết quả
- Analytics: Theo dõi kết quả test, tỷ lệ pass/fail
- Cypress Integration: Tạo Cypress code tự động
- Test Case Library: Quản lý các test cases

Nếu người dùng hỏi:
- "Làm sao để..." → Hướng dẫn cách sử dụng tính năng
- "AI-TestLab có thể..." → Giải thích khả năng của tool
- "Tôi cần help với..." → Cung cấp giải pháp hoặc câu hỏi làm rõ
- Technical questions → Trả lời chi tiết`;

      const chatPrompt = `${systemPrompt}

User message: "${message}"`;

      console.log('🤖 Calling Gemini 2.0 Flash for chatbot response...');
      
      const result = await model.generateContent(chatPrompt);
      const responseText = result.response.text();

      console.log(`✅ AI Response received (${responseText.length} chars)`);

      res.json({
        success: true,
        response: responseText,
        isAI: true,
        timestamp: new Date().toISOString()
      });

    } catch (aiError) {
      console.error('❌ Gemini API Error:', aiError.message);
      
      // Fallback if AI fails
      const fallbackResponse = getFallbackResponse(message);
      res.json({
        success: true,
        response: fallbackResponse,
        isAI: false,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Chatbot Error:', error.message);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

/**
 * Fallback response system when AI is unavailable
 */
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Vietnamese responses
  const responses = {
    greeting: [
      'Xin chào! 👋 Tôi là AI Assistant của AI-TestLab. Hôm nay tôi có thể giúp bạn gì?',
      'Hi! Mình sẵn sàng giúp bạn. Hỏi mình về Testing, Cypress, hoặc bất kỳ tính năng nào!'
    ],
    website_analyzer: [
      'Website Analyzer là tính năng mạnh mẽ của AI-TestLab:\n' +
      '• Quét website tự động\n' +
      '• Phát hiện các chức năng chính (forms, buttons, navigation)\n' +
      '• Sinh test cases tự động bằng AI\n' +
      '• Tạo Cypress code sẵn dùng\n\n' +
      'Để sử dụng: Vào "Thao tác nhanh" → chọn "AI Scan" → nhập URL'
    ],
    test_creation: [
      'Test Creation cho phép bạn tạo test cases chi tiết:\n' +
      '• Định nghĩa precondition và postcondition\n' +
      '• Thêm các step kiểm thử\n' +
      '• Gán priority và tags\n' +
      '• Quản lý test cases trong thư viện\n\n' +
      'Bắt đầu từ "Test Cases" trong sidebar!'
    ],
    cypress: [
      'Cypress là công cụ E2E testing mạnh mẽ:\n' +
      '• Viết test bằng JavaScript\n' +
      '• Hỗ trợ selector tìm elements\n' +
      '• Assertions linh hoạt\n' +
      '• Visual debugger\n\n' +
      'AI-TestLab giúp sinh Cypress code tự động từ test cases của bạn!'
    ],
    analytics: [
      'Analytics giúp bạn theo dõi kết quả testing:\n' +
      '• Xem tỷ lệ pass/fail\n' +
      '• Thống kê theo thời gian\n' +
      '• Phân tích test performance\n' +
      '• Tìm bug thường xuyên xảy ra\n\n' +
      'Vào "Phân tích" để xem dashboard chi tiết!'
    ],
    help: [
      'Tôi có thể giúp bạn với:\n' +
      '• Tạo test cases\n' +
      '• Sử dụng Website Analyzer\n' +
      '• Viết Cypress code\n' +
      '• Phân tích kết quả testing\n' +
      '• Best practices QA\n\n' +
      'Hỏi mình về chủ đề nào bạn quan tâm!'
    ]
  };

  // Keyword matching
  const keywords = {
    ['hello|hi|xin chào|chào|tài sao']: 'greeting',
    ['website|analyzer|scan|quét|phân tích']: 'website_analyzer',
    ['test case|tạo test|test creation']: 'test_creation',
    ['cypress|code|automated']: 'cypress',
    ['analytics|phân tích|kết quả|result|statistics']: 'analytics',
    ['help|giúp|tutorial|hướng dẫn|làm sao|sử dụng']: 'help'
  };

  // Find matching category
  for (const [keywordPattern, category] of Object.entries(keywords)) {
    const keywords_list = keywordPattern.split('|');
    if (keywords_list.some(kw => lowerMessage.includes(kw))) {
      const categoryResponses = responses[category];
      return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }
  }

  // Default response
  return responses.help[0];
}

module.exports = router;
module.exports.setGenAI = setGenAI;

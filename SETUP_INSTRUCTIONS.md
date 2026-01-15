# 🧪 AI Cypress Test Generator

AI-powered test automation platform using Google Gemini API to automatically generate Cypress test cases from HTML files.

## 🚀 Features

### ✅ Manual Test Creation
- Create test cases step-by-step with Manual Steps tab
- Define test steps, verify points, and status
- Organize tests by module and priority

### ✅ Script Review (AI-Powered)
- Paste Cypress test scripts
- Get AI analysis with:
  - Quality score and complexity assessment
  - Specific issues and recommendations
  - Improved code suggestions
  - Performance and security analysis

### ✅ Auto-Generate Tests (AI-Powered)
- Upload HTML files
- Gemini AI automatically generates 12-15 specific test cases
- Includes:
  - Positive tests (happy path)
  - Negative tests (validation, error handling)
  - Edge cases (security, special characters)
  - Exact test data and CSS selectors

## 📋 Prerequisites

- Node.js v16+ 
- npm or yarn
- Google Gemini API Key (free at [Google AI Studio](https://aistudio.google.com))

## ⚙️ Setup

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` folder (use `.env.example` as template):

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your credentials:
```
GEMINI_API_KEY=your_actual_google_gemini_api_key
USE_MOCK=false
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

**Get your free Gemini API key:**
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Click "Create API Key"
3. Copy the key and paste into `.env`

### 3. Frontend Setup
```bash
npm install
```

## 🏃 Running the Application

### Terminal 1 - Backend Server
```bash
cd backend
node server.js
```
Server runs on: **http://localhost:3000**

### Terminal 2 - Frontend Server
```bash
node frontend-server.js
```
Server runs on: **http://localhost:8080**

### Open in Browser
- **Home**: http://localhost:8080
- **Test Creation**: http://localhost:8080/test-creation.html
- **Authentication**: http://localhost:8080/auth.html
- **Dashboard**: http://localhost:8080/dashboard.html

## 🎯 Using the Application

### Manual Test Creation
1. Navigate to Test Creation page
2. Click "Manual Steps" tab
3. Add test steps with expected results
4. Set priority and module
5. Save test case

### AI Script Review
1. Click "Automation Script" tab
2. Paste your Cypress test code
3. Click "Review Script"
4. Get detailed AI analysis with improvement suggestions

### AI Test Generation
1. Click "Upload HTML UI & Auto-Generate Tests" tab
2. Upload an HTML file (or drag & drop)
3. System automatically generates test cases
4. Review generated tests with specific:
   - Test data
   - CSS selectors
   - Expected results
   - Priority levels

## 📁 Project Structure

```
├── backend/
│   ├── server.js                 # Express server
│   ├── routes/
│   │   ├── autotest.js          # HTML analysis & AI test generation
│   │   ├── script-review.js     # AI script review
│   │   └── auth.js              # Authentication
│   ├── config/database.js       # SQLite configuration
│   ├── middleware/auth.js       # JWT middleware
│   ├── utils/cypress-generator.js
│   ├── data/database.db         # SQLite database (auto-created)
│   └── .env.example             # Environment template
├── frontend/
│   ├── test-creation.html       # Main test creation UI
│   ├── auth.html                # Login page
│   ├── dashboard.html           # Dashboard
│   └── assets/                  # CSS and JS
├── cypress-runner/
│   ├── cypress/e2e/             # Generated Cypress tests
│   └── cypress.config.js
├── frontend-server.js           # Static file server
└── README.md
```

## 🔐 Security Notes

⚠️ **Important:**
- `.env` file is in `.gitignore` - your API key won't be exposed to git
- `.env.example` shows the structure without sensitive data
- Always use environment variables for secrets
- Change JWT_SECRET in production

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `USE_MOCK` | Use mock AI responses | `false` |
| `PORT` | Backend server port | `3000` |
| `JWT_SECRET` | JWT signing secret | `your-secret` |

## 📊 Database Schema

### test_cases table
- id: Primary key
- testcaseTitle: Test name
- testcaseModule: Module name
- testcaseType: Type (manual/automation)
- testcasePriority: Priority level
- testcaseTags: Tags (comma-separated)
- testcaseDescription: Description
- createdAt: Timestamp

### test_steps table
- id: Primary key
- testCaseId: Reference to test_cases
- stepNumber: Step order
- stepAction: Action description
- expectedResult: Expected outcome
- status: Step status (PASS/FAIL/PENDING)

## 🚀 Deployment

### Environment Setup
1. Ensure `.env` is in `.gitignore`
2. Set production environment variables
3. Change `JWT_SECRET` in production
4. Use a real database (not SQLite) for production

### Running Production
```bash
NODE_ENV=production node backend/server.js
```

## 🐛 Troubleshooting

### API Key Error (403 Forbidden)
- Check if API key is correct in `.env`
- Verify Gemini API is enabled in Google Cloud
- Create a new API key at [Google AI Studio](https://aistudio.google.com)

### Database Errors
- Delete `backend/data/database.db` to reset
- Server will auto-create new database on startup

### Port Already in Use
```bash
# Backend
lsof -i :3000
kill -9 <PID>

# Frontend
lsof -i :8080
kill -9 <PID>
```

## 📝 Example Test Case Generated by AI

```json
{
  "id": 1,
  "name": "Login with valid email and password",
  "description": "Verify user can login with correct credentials",
  "steps": [
    "cy.get('#email').type('test@example.com')",
    "cy.get('#password').type('ValidPassword123!')",
    "cy.get('button[type=submit]').click()",
    "cy.contains('Dashboard').should('be.visible')"
  ],
  "testData": {
    "email": "test@example.com",
    "password": "ValidPassword123!"
  },
  "expectedResult": "User is redirected to dashboard with success message",
  "priority": "High",
  "type": "Functional"
}
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 🎓 Learn More

- [Cypress Documentation](https://docs.cypress.io)
- [Google Gemini API](https://ai.google.dev)
- [Testing Best Practices](https://testingjavascript.com)

---

**Version**: 1.0.0  
**Last Updated**: January 2026

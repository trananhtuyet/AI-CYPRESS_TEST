# 📊 Thống Kê: Nơi Dùng AI và Cypress Trong Project

## 🤖 **PHẦN DÙNG AI (Gemini)**

### 1. **Backend Server - Khởi tạo AI**
- **File**: `backend/server.js`
- **Dòng**: 4, 24, 26-27
- **Tác vụ**:
  - Import `GoogleGenerativeAI`
  - Khởi tạo genAI instance nếu có GEMINI_API_KEY
  - Mô hình: `gemini-2.0-flash`

### 2. **Routes - Sử dụng AI để Phân Tích và Sinh Test Cases**

#### **a) Website Analyzer Route**
- **File**: `backend/routes/website-analyzer.js`
- **API Endpoints**:
  
| Endpoint | Dòng | Tác vụ AI |
|----------|------|----------|
| POST `/website-analyzer` | 35 | Phân tích trang web, trích xuất features |
| POST `/analyze-website-features` | 318 | AI phân tích HTML, tìm ra features |
| POST `/generate-tests-for-feature` | 524 | AI sinh test cases cho feature |

**AI Call Details**:
- **Dòng 111**: Gọi AI để phân tích website (extract buttons, forms, links)
- **Dòng 449**: Gọi AI để phát hiện features từ HTML
- **Dòng 712**: Gọi AI để sinh comprehensive test cases

#### **b) Script Review Route**
- **File**: `backend/routes/script-review.js`
- **API Endpoints**:
  
| Endpoint | Dòng | Tác vụ AI |
|----------|------|----------|
| POST `/review-test-script` | 236 | AI review Cypress code |
| POST `/validate-syntax` | 423 | AI kiểm tra lỗi syntax |
| POST `/ask-about-review` | 537 | AI trả lời câu hỏi follow-up |

**AI Call Details**:
- **Dòng 236**: Review Cypress script, kiểm tra best practices
- **Dòng 423**: Validate syntax và suggest fixes
- **Dòng 537**: AI trả lời câu hỏi về test script

#### **c) Autotest Route**
- **File**: `backend/routes/autotest.js`
- **AI Call**: **Dòng 193** - Sinh Cypress test code

### 3. **Frontend - Tương tác với AI**

#### **a) Website Analyzer HTML**
- **File**: `frontend/website-analyzer.html`

| Chức năng | Dòng | Tác vụ |
|-----------|------|--------|
| Tạo Test Case Custom | 1485 | Modal form để user tạo test case |
| Optimize Custom Tests | 989 | Gọi API `/review-test-script` để AI tối ưu |
| Generate Test Cases | 1204 | Gọi API `/generate-tests-for-feature` để AI sinh test cases |

---

## 🧪 **PHẦN DÙNG CYPRESS**

### 1. **Cypress Configuration**
- **File**: `cypress-runner/cypress.config.js`
- **Tác vụ**: Config Cypress environment

### 2. **Cypress Custom Commands**
- **File**: `cypress-runner/cypress/support/commands.js`
- **Commands**:

| Command | Dòng | Tác vụ |
|---------|------|--------|
| `cy.login()` | 4 | Tự động đăng nhập |
| `cy.fillForm()` | 12 | Điền dữ liệu form |
| `cy.waitForElement()` | 21 | Đợi element xuất hiện |

### 3. **Cypress Test Files (E2E)**
- **Thư mục**: `cypress-runner/cypress/e2e/`
- **Số lượng**: 100+ test files (ai_test_*.cy.js)
- **Ví dụ tests**:
  - `ai_test_html_1__Page_loads_successfully.cy.js`
  - `ai_test_html_1__Successful_Account_Creation_with_Valid_Data.cy.js`
  - `ai_test_html_10__CSRF_Protection.cy.js`
  - Các test về SQL injection, XSS, form validation, v.v.

### 4. **Cypress Mock Data**
- **File**: `backend/routes/website-analyzer.js`
- **Dòng**: 558-730 (Mock Cypress test cases)
- **Tác vụ**: Sinh mock test cases (backup khi AI không hoạt động)

**Ví dụ Cypress code generated**:
```javascript
// Mô hình test case được tạo
cy.visit('URL');
cy.get('selector').should('be.visible');
cy.get('button').click();
cy.get('.result').should('contain', 'Success');
```

### 5. **Frontend Test Case Display**
- **File**: `frontend/website-analyzer.html`
- **Các hàm Cypress-related**:

| Hàm | Dòng | Tác vụ |
|-----|------|--------|
| `displayTestCases()` | 1301 | Hiển thị test cases được AI sinh |
| `runSingleTest()` | 1377 | Chạy 1 test case |
| `runAllTestCases()` | 1398 | Chạy tất cả test cases |
| `generateTestCases()` | 1204 | Gọi backend để sinh test cases |

---

## 📈 **TÓMLƯỢC FLOW**

### **Flow 1: Phân tích Website → Sinh Test Cases**
```
1. Frontend: User nhập URL
2. Frontend → Backend: POST /analyze-website-features (with URL)
3. Backend (Puppeteer): Lấy HTML từ URL
4. Backend (AI/Gemini): Phân tích HTML → tìm features
5. Frontend: Hiển thị features trong left column
6. User nhấn feature
7. Frontend → Backend: POST /generate-tests-for-feature
8. Backend (AI/Gemini): Sinh test cases chi tiết
9. Frontend: Hiển thị test cases trong tab "AI Test Cases"
```

### **Flow 2: Custom Test Case → AI Optimize**
```
1. Frontend: User nhấn "Tạo kịch bản mới"
2. Frontend: Modal form, user nhập test case details
3. Frontend: Lưu vào localStorage (customTestCases)
4. Frontend: Hiển thị trong tab "Test Tùy Chỉnh"
5. User nhấn "AI Tối Ưu"
6. Frontend → Backend: POST /review-test-script
7. Backend (AI/Gemini): Review test case, suggest improvements
8. Frontend: Hiển thị suggestions trong console
```

### **Flow 3: Test Execution (Demo)**
```
1. User nhấn "Run" trên test case
2. Frontend: runSingleTest() được gọi
3. Frontend: Simulate execution (1.5s delay)
4. Frontend: Hiển thị PASS/FAIL result
```

---

## 🔍 **CHI TIẾT LOCATIONS**

### **AI Locations**:
- `backend/server.js` - 1 file
- `backend/routes/website-analyzer.js` - 1 file (7 AI calls)
- `backend/routes/script-review.js` - 1 file (3+ AI calls)
- `backend/routes/autotest.js` - 1 file (1 AI call)
- `backend/debug-website-analyzer.js` - Test debug file
- **Total**: 5 backend files + 1 frontend (website-analyzer.html)

### **Cypress Locations**:
- `cypress-runner/cypress.config.js` - Config
- `cypress-runner/cypress/support/commands.js` - Custom commands
- `cypress-runner/cypress/e2e/` - 100+ test files (AI-generated)
- `backend/routes/website-analyzer.js` - Mock test data
- `frontend/website-analyzer.html` - Display & run tests
- **Total**: 5+ files + 100+ test files

---

## 📋 **TÓMLƯỢC**

| Thành phần | AI | Cypress | Tác vụ |
|-----------|----|---------|----|
| **Phân tích Website** | ✅ | ❌ | AI phân tích, tìm features |
| **Sinh Test Cases** | ✅ | ✅ | AI sinh, Cypress format |
| **Review Code** | ✅ | ❌ | AI check best practices |
| **Custom Test Cases** | ❌ | ✅ | User tạo, lưu local |
| **AI Optimize** | ✅ | ❌ | AI suggest improvements |
| **Run Tests** | ❌ | ✅ | Simulate test execution |
| **E2E Tests** | ❌ | ✅ | 100+ pre-generated tests |


# Analytics API Documentation

## Overview
The Analytics API provides comprehensive test execution statistics and reporting capabilities.

## Base URL
```
http://localhost:3000/api/analytics
```

## Authentication
All endpoints require JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get Summary Statistics
**GET** `/api/analytics/summary`

Returns overall test statistics including pass/fail rates, breakdown by priority/module/type.

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalTests": 10,
    "totalSteps": 50,
    "passedSteps": 40,
    "failedSteps": 5,
    "pendingSteps": 5,
    "passRate": 80,
    "failRate": 10
  },
  "byPriority": {
    "Critical": 2,
    "High": 3,
    "Medium": 4,
    "Low": 1
  },
  "byModule": {
    "Authentication": 4,
    "Dashboard": 3,
    "Settings": 3
  },
  "byType": {
    "automation": 6,
    "manual": 4
  }
}
```

---

### 2. Get Test Cases (Paginated)
**GET** `/api/analytics/test-cases?page=1&limit=10&priority=High`

Get list of test cases with optional filtering.

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10
- `priority` (optional): Filter by priority (Critical, High, Medium, Low)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 4,
      "name": "Login with valid credentials",
      "module": "Authentication",
      "type": "automation",
      "priority": "High",
      "tags": "smoke,critical",
      "created_at": "2026-01-16T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 3. Get Module Breakdown
**GET** `/api/analytics/by-module`

Get statistics grouped by module.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "module": "Authentication",
      "totalTests": 5,
      "automationTests": 3,
      "manualTests": 2
    },
    {
      "module": "Dashboard",
      "totalTests": 3,
      "automationTests": 2,
      "manualTests": 1
    }
  ]
}
```

---

### 4. Get Module Details
**GET** `/api/analytics/by-module/:module`

Get detailed information for a specific module.

**Path Parameters:**
- `module`: Module name (e.g., "Authentication")

**Response:**
```json
{
  "success": true,
  "module": "Authentication",
  "testCases": [
    {
      "id": 1,
      "name": "Login with valid credentials",
      "priority": "High",
      "type": "automation",
      "stepCount": 5,
      "passedSteps": 4
    }
  ],
  "summary": {
    "total": 2,
    "totalSteps": 10,
    "passedSteps": 8
  }
}
```

---

### 5. Get Priority Breakdown
**GET** `/api/analytics/by-priority`

Get statistics grouped by priority level.

**Response:**
```json
{
  "success": true,
  "data": [
    { "priority": "Critical", "count": 2 },
    { "priority": "High", "count": 3 },
    { "priority": "Medium", "count": 4 },
    { "priority": "Low", "count": 1 }
  ]
}
```

---

### 6. Get Test Type Breakdown
**GET** `/api/analytics/by-type`

Get statistics grouped by test type.

**Response:**
```json
{
  "success": true,
  "data": [
    { "type": "automation", "count": 6 },
    { "type": "manual", "count": 4 }
  ]
}
```

---

### 7. Get Step Status
**GET** `/api/analytics/step-status`

Get detailed step execution status.

**Response:**
```json
{
  "success": true,
  "data": [
    { "status": "PASS", "count": 40 },
    { "status": "FAIL", "count": 5 },
    { "status": "PENDING", "count": 5 }
  ]
}
```

---

### 8. Export Analytics as CSV
**GET** `/api/analytics/export/csv`

Download analytics report as CSV file.

**Response:** CSV file download
```
ID,Test Case Name,Module,Priority,Type,Total Steps,Passed Steps
1,"Login with valid credentials",Authentication,High,automation,5,4
2,"Create account",Authentication,Medium,manual,3,3
```

---

### 9. Debug Information
**GET** `/api/analytics/debug`

Get debug information about the analytics service.

**Response:**
```json
{
  "success": true,
  "message": "Analytics service is running",
  "timestamp": "2026-01-16T10:30:00Z",
  "endpoints": [
    "GET /api/analytics/summary - Overall statistics",
    "GET /api/analytics/test-cases - List test cases with pagination",
    "GET /api/analytics/by-module - Breakdown by module",
    "GET /api/analytics/by-priority - Breakdown by priority",
    "GET /api/analytics/by-type - Breakdown by type",
    "GET /api/analytics/step-status - Step execution status",
    "GET /api/analytics/export/csv - Export as CSV"
  ]
}
```

---

## Error Handling

All errors return standard format:
```json
{
  "error": "Error description",
  "details": "Optional error details"
}
```

**Common Error Codes:**
- `401`: Unauthorized (missing/invalid token)
- `400`: Bad request (invalid parameters)
- `500`: Internal server error

---

## Example Usage

### Using fetch (JavaScript)
```javascript
const token = localStorage.getItem('token');

// Get summary
const response = await fetch('http://localhost:3000/api/analytics/summary', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
console.log(data);

// Get test cases with filter
const testCases = await fetch(
  'http://localhost:3000/api/analytics/test-cases?page=1&limit=10&priority=High',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### Using cURL
```bash
# Get summary
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/analytics/summary

# Export CSV
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -o analytics.csv \
  http://localhost:3000/api/analytics/export/csv
```

---

## Database Schema

### test_cases_new
```sql
CREATE TABLE test_cases_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  module TEXT DEFAULT 'General',
  type TEXT DEFAULT 'manual',
  priority TEXT DEFAULT 'Medium',
  tags TEXT,
  precondition TEXT,
  postcondition TEXT,
  automation_code TEXT,
  html_content TEXT,
  analyzed_elements TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### test_steps
```sql
CREATE TABLE test_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_case_id INTEGER NOT NULL,
  step_num TEXT,
  action TEXT,
  expected TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_case_id) REFERENCES test_cases_new(id) ON DELETE CASCADE
)
```

---

## Notes
- All user-specific queries are filtered by `user_id` from the JWT token
- Timestamps are in ISO 8601 format (UTC)
- Status values: `PASS`, `FAIL`, `PENDING` (case-insensitive)
- Priority values: `Critical`, `High`, `Medium`, `Low`
- Type values: `automation`, `manual`

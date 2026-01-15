# Hướng Dẫn Setup PostgreSQL & Chạy Authentication System

## 1. Cài đặt PostgreSQL

### Windows:
1. Tải PostgreSQL từ: https://www.postgresql.org/download/windows/
2. Chạy installer và ghi nhớ password cho user `postgres`
3. Chọn port mặc định: 5432
4. Cài đặt pgAdmin (optional, để manage database qua UI)

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Linux:
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## 2. Tạo Database

### Cách 1: Dùng pgAdmin UI
1. Mở pgAdmin (http://localhost:5050)
2. Connect đến local server (password: postgres)
3. Create new database: `ai_cypress_test`

### Cách 2: Dùng Command Line
```bash
# Windows - Command Prompt hoặc PowerShell
psql -U postgres

# Rồi chạy:
CREATE DATABASE ai_cypress_test;
\q  # Thoát

# Hoặc một dòng:
psql -U postgres -c "CREATE DATABASE ai_cypress_test;"
```

---

## 3. Cấu hình Backend

### File `.env` (đã có sẵn):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_cypress_test
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
```

**LƯU Ý:** Đổi `DB_PASSWORD` thành password bạn đặt khi cài PostgreSQL

---

## 4. Chạy Backend

```bash
cd backend
npm install  # (nếu chưa cài)
npm run dev
```

Backend sẽ:
- Tự động tạo tables (users, sessions, test_cases)
- Chạy trên: http://localhost:3000

---

## 5. Kiểm Tra Database

### Xem tables được tạo:
```bash
psql -U postgres -d ai_cypress_test -c "\dt"
```

**Output:**
```
          List of relations
 Schema |    Name    | Type  | Owner
--------+------------+-------+----------
 public | sessions   | table | postgres
 public | test_cases | table | postgres
 public | users      | table | postgres
```

---

## 6. Test API với Postman

### Import Postman Collection:
1. Mở Postman
2. File → Import → Chọn file `backend/postman_collection.json`

### Test Register:
- Method: POST
- URL: `http://localhost:3000/api/auth/register`
- Body (JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**Response (Success 201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test Login:
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Test Get Profile:
- Method: GET
- URL: `http://localhost:3000/api/auth/profile`
- Header: `Authorization: Bearer <TOKEN_FROM_LOGIN>`

---

## 7. Test Frontend

### Mở browser:
```
http://127.0.0.1:5500/frontend/register.html
```

Hoặc setup Live Server trong VS Code

---

## 8. Troubleshoot

### Lỗi: "connect ECONNREFUSED"
→ PostgreSQL chưa start
```bash
# Windows
net start postgresql-x64-15  # (hoặc phiên bản bạn cài)

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Lỗi: "FATAL: Ident authentication failed"
→ Password sai trong `.env`
- Kiểm tra lại password PostgreSQL

### Lỗi: "database does not exist"
→ Chưa tạo database
```bash
psql -U postgres -c "CREATE DATABASE ai_cypress_test;"
```

---

## 9. Các Lệnh Hữu Ích

```bash
# Kết nối vào database
psql -U postgres -d ai_cypress_test

# Xem tất cả users
SELECT * FROM users;

# Xem user theo email
SELECT * FROM users WHERE email = 'test@example.com';

# Xóa tất cả users (thận trọng!)
DELETE FROM users;

# Reset auto_increment (ID)
ALTER SEQUENCE users_id_seq RESTART WITH 1;
```

---

## 10. Kết Quả Kỳ Vọng

✅ Backend chạy trên port 3000
✅ PostgreSQL kết nối thành công
✅ Có thể register user mới
✅ Có thể login và lấy token
✅ Có thể get/update profile
✅ Frontend form hoạt động

---

**Nếu có vấn đề, check console của:**
1. Backend: Terminal chạy `npm run dev`
2. Browser: F12 → Console tab
3. Postman: Response tab

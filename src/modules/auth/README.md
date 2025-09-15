# Auth Module API Documentation

Module xử lý authentication và authorization cho ứng dụng MMA Trade Auto.

## 🔐 Authentication Flow

1. **Login**: User đăng nhập bằng Telegram hoặc Google OAuth
2. **Token Management**: Hệ thống tạo access token (15 phút) và refresh token (7 ngày)
3. **Cookie Storage**: Tokens được lưu trong HTTP only cookies
4. **Auto Refresh**: Frontend có thể refresh access token khi cần
5. **Auto Registration**: Tự động tạo user mới khi đăng nhập Google lần đầu

## 📡 API Endpoints

### 1. Login với Telegram

**Endpoint:** `POST /auth/login/telegram`

**Description:** Đăng nhập bằng Telegram với verification code

**Request Body:**
```json
{
  "telegram_id": "123456789",
  "code": "abc123def456"
}
```

**Response:**
```json
{
  "message": "Login successful"
}
```

**Cookies được set:**
- `access_token` (HTTP only, 15 phút, sameSite: none)
- `refresh_token` (HTTP only, 7 ngày, sameSite: none)

**Error Responses:**
- `404 Not Found`: "User not found"
- `401 Unauthorized`: "Invalid or expired verification code"
- `401 Unauthorized`: "Verification code has expired"

---

### 2. Login với Google OAuth

**Endpoint:** `POST /auth/login/google`

**Description:** Đăng nhập bằng Google OAuth với authorization code

**Request Body:**
```json
{
  "code": "4/0AX4XfWh...",
  "path": "login-email"
}
```

**Response:**
```json
{
  "message": "Login successful"
}
```

**Cookies được set:**
- `access_token` (HTTP only, 15 phút, sameSite: none)
- `refresh_token` (HTTP only, 7 ngày, sameSite: none)

**Quy trình:**
1. Frontend redirect user đến Google OAuth
2. Google trả về authorization code
3. Frontend gửi code lên API này
4. Backend exchange code lấy access token và ID token
5. Backend verify ID token và tạo/cập nhật user
6. Backend trả về JWT tokens

**Auto Registration:**
- Nếu user chưa tồn tại: Tự động tạo user mới với thông tin từ Google
- Tự động tạo ví Solana cho user mới
- Cập nhật trạng thái xác thực email

**Error Responses:**
- `400 Bad Request`: "Failed to exchange code for token"
- `400 Bad Request`: "Invalid Google token"
- `400 Bad Request`: "Invalid token issuer"
- `400 Bad Request`: "Invalid token audience"
- `400 Bad Request`: "Email not verified"

---

### 3. Refresh Access Token

**Endpoint:** `POST /auth/refresh`

**Description:** Làm mới access token từ refresh token

**Request:** Không cần body, sử dụng refresh token từ cookie

**Response:**
```json
{
  "message": "Token refreshed successfully"
}
```

**Cookie được set:**
- `access_token` mới (HTTP only, 15 phút, sameSite: none)

**Error Responses:**
- `401 Unauthorized`: "Invalid refresh token"
- `401 Unauthorized`: "Invalid token type"
- `404 Not Found`: "User not found"

---

### 4. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Đăng xuất và xóa tất cả cookies

**Request:** Không cần body

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Cookies được xóa:**
- `access_token` - Đã bị xóa
- `refresh_token` - Đã bị xóa

---

### 5. Lấy thông tin User

**Endpoint:** `GET /auth/me`

**Description:** Lấy thông tin của user hiện tại đang đăng nhập

**Authentication:** Required (JWT Guard)

**Request:** Sử dụng access token từ cookie

**Response:**
```json
{
  "id": 1,
  "telegram_id": "123456789",
  "full_name": null,
  "email": null,
  "is_verified_email": false,
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: "Invalid token type"
- `401 Unauthorized`: "Unauthorized"
- `404 Not Found`: "User not found"

## 🔧 Environment Variables

```env
# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRES_IN=7d

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WORKER_URL=https://api.telegram.org
FRONTEND_URL_TELEGRAM_REDIRECT=http://localhost:3000/auth/telegram

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FRONTEND_URL_GOOGLE_REDIRECT=http://localhost:3000/auth/google
```

## 🔐 Security Features

### Token Management
- **Access Token**: 15 phút, dùng cho authentication
- **Refresh Token**: 7 ngày, dùng để tạo access token mới
- **Separate Secrets**: Access và refresh token dùng secret khác nhau
- **Token Type Validation**: Kiểm tra `type` trong JWT payload

### Cookie Security
- **HTTP Only**: Không thể truy cập từ JavaScript
- **SameSite None**: Hỗ trợ cross-site requests
- **Secure**: Chỉ gửi qua HTTPS trong production
- **Auto Expiry**: Tự động hết hạn theo thời gian đã set

### CORS Configuration
- **Credentials**: Hỗ trợ cookie trong cross-origin requests
- **Frontend URLs**: Cấu hình domain được phép
- **Methods**: Hỗ trợ GET, POST, PUT, PATCH, DELETE



## 🚀 Google OAuth Setup Guide

### 1. Tạo Google OAuth App
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Google+ API
4. Tạo OAuth 2.0 credentials
5. Cấu hình authorized redirect URIs:
   - `http://localhost:3000/auth/google` (development)
   - `https://yourdomain.com/auth/google` (production)

### 2. Frontend Integration
```javascript
// Tạo Google OAuth URL
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(FRONTEND_URL_GOOGLE_REDIRECT)}&` +
  `scope=email profile&` +
  `response_type=code&` +
  `access_type=offline&` +
  `prompt=consent`;

// Redirect user đến Google
window.location.href = googleAuthUrl;

// Xử lý callback từ Google
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  // Gửi code lên backend
  const response = await fetch('/auth/login/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, path: 'login-email' })
  });
}
```

### 3. Backend Configuration
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FRONTEND_URL_GOOGLE_REDIRECT=http://localhost:3000/auth/google
```

## ⚠️ Important Notes

1. **HTTPS Required**: Khi sử dụng `sameSite: 'none'`, cần HTTPS trong production
2. **Token Expiry**: Access token hết hạn sau 15 phút, cần refresh
3. **Cookie Domain**: Đảm bảo cookie domain phù hợp với frontend
4. **Error Handling**: Luôn xử lý 401 errors để redirect về login
5. **Refresh Logic**: Implement auto-refresh khi access token hết hạn
6. **Google OAuth**: Đảm bảo redirect URI khớp chính xác với cấu hình
7. **Auto Registration**: User mới sẽ được tạo tự động với ví Solana

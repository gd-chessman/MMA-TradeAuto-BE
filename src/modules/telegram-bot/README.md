# Telegram Bot Module

Module xử lý tích hợp Telegram Bot cho ứng dụng MMA Trade Auto.

## 🤖 Tính năng chính

- **Auto Registration**: Tự động tạo user và ví Solana khi user gửi `/start`
- **Verification Code**: Tạo và gửi mã xác thực cho đăng nhập
- **User Management**: Lưu thông tin user từ Telegram (ID, tên)
- **Wallet Creation**: Tự động tạo ví Solana cho user mới
- **Real-time Polling**: Lắng nghe tin nhắn từ Telegram real-time

## 📡 Bot Commands

### `/start`
Khởi tạo quy trình đăng ký/đăng nhập cho user.

**Quy trình:**
1. Bot kiểm tra user đã tồn tại chưa
2. Nếu chưa có: Tạo user mới với thông tin từ Telegram
3. Tạo ví Solana MAIN cho user mới
4. Tạo mã xác thực 32 ký tự (hết hạn 10 phút)
5. Gửi link đăng nhập cho user

**Response:**
```
⭐️ *Welcome to MemePump* 🤘

Please click the button below to login.
This link will expire in 10 minutes.

[🌐 Login Website] (button)
```

## 🔧 Cấu hình

### Environment Variables
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
URL_WORKER=https://proxy.michosso2025.workers.dev
FRONTEND_URL_TELEGRAM_REDIRECT=http://localhost:3000
```

### Dependencies
- `@nestjs/common`: NestJS framework
- `@nestjs/config`: Configuration management
- `@nestjs/typeorm`: Database ORM
- `@solana/web3.js`: Solana wallet generation
- `bs58`: Base58 encoding for private keys
- `axios`: HTTP client for Telegram API

## 🏗️ Kiến trúc

### Services
- **TelegramBotService**: Main service xử lý bot logic
- **User Repository**: Quản lý user data
- **Wallet Repository**: Quản lý ví Solana
- **VerifyCode Repository**: Quản lý mã xác thực

### Database Entities
- **User**: Thông tin user (telegram_id, full_name)
- **Wallet**: Ví Solana (sol_address, private_key, wallet_type)
- **VerifyCode**: Mã xác thực (code, type, expires_at)

## 🔄 Quy trình hoạt động

### 1. Bot Initialization
```typescript
async onModuleInit() {
    await this.initializeLastUpdateId();
    await this.startPolling();
}
```

### 2. Message Processing
```typescript
private async handleUpdate(update: any) {
    // Lấy thông tin từ message
    const telegramId = message.from?.id?.toString();
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Xử lý command /start
    if (text?.startsWith('/start')) {
        // Tạo/cập nhật user
        // Tạo ví Solana
        // Gửi mã xác thực
    }
}
```

### 3. User Creation
```typescript
// Tạo user mới
user = this.userRepository.create({
    telegram_id: telegramId,
    full_name: fullName || null,
});

// Tạo ví Solana MAIN
const solanaWallet = this.generateSolanaWallet();
const wallet = this.walletRepository.create({
    user_id: user.id,
    sol_address: solanaWallet.publicKey,
    private_key: solanaWallet.privateKey,
    wallet_type: WalletType.MAIN,
});
```

## 🔐 Bảo mật

### Verification Code
- **Length**: 32 ký tự ngẫu nhiên
- **Characters**: a-z, 0-9 (lowercase)
- **Expiry**: 10 phút
- **One-time use**: Mỗi code chỉ dùng được 1 lần

### Wallet Security
- **Private Key**: Mã hóa Base58 và lưu trong database
- **Public Key**: Lưu dạng Base58 string
- **Wallet Type**: Ví đầu tiên luôn là MAIN

## 📊 Logging

### Log Levels
- **Info**: User creation, wallet creation
- **Error**: API errors, database errors
- **Debug**: Polling status, update processing

### Log Examples
```
🚀 Telegram bot starting...
🚀 Telegram bot started
Created new user with telegram_id: 123456789, full_name: John Doe
Created new MAIN wallet for user: 123456789
```

## 🚀 API Integration

### Telegram API Endpoints
- **Send Message**: `POST /bot{token}/sendMessage`
- **Get Updates**: `GET /bot{token}/getUpdates`

### Worker Proxy
Sử dụng worker proxy để bypass CORS và rate limiting:
```
https://proxy.michosso2025.workers.dev
```

## 🔄 Polling Mechanism

### Real-time Updates
- **Interval**: 1 giây
- **Timeout**: 30 giây
- **Offset**: Tự động cập nhật để tránh duplicate

### Error Handling
- **Network errors**: Retry với exponential backoff
- **API errors**: Log và continue
- **Database errors**: Rollback và notify user

## 📱 Frontend Integration

### Login URL Format
```
{FRONTEND_URL_TELEGRAM_REDIRECT}/tglogin?id={telegramId}&code={verificationCode}
```

### Example
```
http://localhost:3000/tglogin?id=123456789&code=abc123def456...
```

## ⚠️ Lưu ý quan trọng

1. **Bot Token**: Cần có quyền gửi tin nhắn và đọc updates
2. **Database**: Cần có bảng users, wallets, verify_codes
3. **Worker URL**: Có thể thay đổi worker proxy nếu cần
4. **Rate Limiting**: Telegram có giới hạn API calls
5. **Error Recovery**: Bot tự động retry khi có lỗi

## 🛠️ Troubleshooting

### Common Issues
1. **Bot không phản hồi**: Kiểm tra bot token và worker URL
2. **Database errors**: Kiểm tra connection và entity definitions
3. **Code không hoạt động**: Kiểm tra expiry time và usage status
4. **Polling stopped**: Restart application để khởi động lại polling

### Debug Steps
1. Kiểm tra logs trong console
2. Verify environment variables
3. Test Telegram API trực tiếp
4. Kiểm tra database connections

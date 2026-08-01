# Hướng dẫn chạy Backend

## 1. Yêu cầu

- Java 17
- MySQL 8 đang chạy local (hoặc chỉnh `DB_URL` trỏ tới MySQL khác)
- (Tuỳ chọn) RPC Sepolia (Alchemy/Infura) + contract đã deploy + ví server có Sepolia ETH, nếu muốn thử nghiệm phần blockchain thật

## 2. Cấu hình biến môi trường

Copy `.env.example` thành `.env` (không commit) rồi điền giá trị thật, hoặc set trực tiếp trong PowerShell:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/certificate_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="mat-khau-that-cua-ban"
$env:SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/API-KEY-MOI"
$env:CONTRACT_ADDRESS="0x..."
$env:SERVER_WALLET_PRIVATE_KEY="0x..."
$env:JWT_SECRET="chuoi-random-it-nhat-32-ky-tu"
$env:DEMO_ADMIN_WALLET="0x..."
$env:DEMO_ISSUER_WALLET="0x..."
$env:DEMO_STUDENT_WALLET="0x..."
$env:DEMO_STUDENT_ID="2311004"
./mvnw spring-boot:run
```

**Quan trọng:** private key/API key cũ đã từng hardcode trong source (đã bị lộ) — phải tạo API key Alchemy mới và ví server mới trước khi dùng thật, xem mục 3.3 trong file yêu cầu.

## 3. Nếu chưa cấu hình Web3j/Sepolia

App vẫn khởi động và chạy bình thường (đăng nhập MetaMask, quản lý user vẫn hoạt động). Các API liên quan blockchain (`POST /api/certificates`, `POST /api/certificates/{certId}/revoke`, `GET /api/certificates/verify`) sẽ trả **503 BLOCKCHAIN_NOT_CONFIGURED** thay vì âm thầm dùng ví giả như code cũ.

## 4. Base URL

```
http://localhost:5000
```

Swagger UI: `http://localhost:5000/swagger-ui.html`

## 5. Build & test

```powershell
./mvnw clean test
./mvnw clean package
```

> Lưu ý: môi trường tạo bộ code này không có Maven Central / MySQL / RPC Sepolia thật để tự chạy lệnh trên, nên **chưa có output build/test thật kèm theo**. Bạn cần tự chạy 2 lệnh trên ở máy có mạng đầy đủ và dán log vào báo cáo (mục D trong file yêu cầu của nhóm trưởng).

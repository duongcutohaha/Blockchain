# Hệ thống quản lý thư viện bằng Blockchain

Ứng dụng quản lý sách, người dùng và lịch sử mượn/trả trên nền tảng Ethereum. Mỗi giao dịch mượn hoặc trả sách được ghi nhận bằng smart contract Solidity để tăng tính minh bạch, an toàn và hạn chế chỉnh sửa dữ liệu sau khi phát sinh.

## Công nghệ sử dụng

- Solidity, Hardhat, OpenZeppelin
- Ethereum local bằng Ganache
- MetaMask để đăng nhập và ký giao dịch
- React, Vite, Ethers.js

## Chức năng chính

### Admin

- Thêm sách mới.
- Cập nhật tên sách, tác giả, ISBN, số lượng và trạng thái sách.
- Thêm/cập nhật người dùng.
- Cấp quyền User hoặc Admin.
- Khóa/mở tài khoản người dùng.
- Xem toàn bộ lịch sử mượn/trả.
- Trả sách thay người dùng khi cần xử lý tại quầy.

### User

- Đăng nhập bằng ví MetaMask.
- Tự đăng ký hồ sơ người dùng nếu ví chưa tồn tại trong hệ thống.
- Xem danh sách sách và số lượng khả dụng.
- Mượn sách.
- Trả sách.
- Xem lịch sử giao dịch của bản thân.

## Cài đặt

```bash
npm install
npm --prefix frontend install
```

## Chạy với Ganache

1. Mở Ganache.
2. Tạo workspace hoặc quickstart với RPC server:
   - `http://127.0.0.1:7545`
   - Chain ID: `1337`
3. Import một private key từ Ganache vào MetaMask.
4. Thêm network Ganache trong MetaMask:
   - Network name: `Ganache`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`
   - Currency symbol: `ETH`
5. Compile và deploy contract:

```bash
npm run compile
npm run deploy:ganache
```

Lệnh deploy sẽ tự ghi địa chỉ contract và ABI vào:

```text
frontend/src/contracts/libraryManagement.json
```

6. Chạy frontend:

```bash
npm run dev
```

Mở địa chỉ Vite hiển thị trên terminal, thường là:

```text
http://127.0.0.1:5173
```

## Kiểm thử smart contract

```bash
npm test
```

## Tài khoản Admin ban đầu

Ví deploy contract sẽ tự động là Admin đầu tiên. Hãy dùng đúng ví đó trên MetaMask để truy cập các chức năng quản lý.

## Cấu trúc thư mục

```text
contracts/LibraryManagement.sol     Smart contract chính
scripts/deploy.js                   Deploy contract và xuất ABI cho frontend
test/LibraryManagement.test.js      Kiểm thử contract
frontend/src/main.jsx               Ứng dụng React
frontend/src/styles.css             Giao diện
docs/bao-cao-de-tai.md              Nội dung báo cáo đề tài
```

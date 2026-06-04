# Xây dựng hệ thống đặt tour du lịch minh bạch bằng blockchain

Hệ thống đặt tour nhanh chóng tiện lợi , khách hàng xem đánh giá trực tiếp về nơi mình đang quan tâm tìm .Chỉ khách đã đi tour mới được mở khóa tính năng đánh giá. Toàn bộ review được ghi lên Blockchain, không ai (kể cả admin) có thể sửa hay xóa.Băm đánh giá và lưu vào block chain khi khách hàng muốn xem đánh giá thì p đối chiếu hàm băm đúng thì mới hiện đánh giá thật nếu k sẽ hiện đánh giá đã bị sửa đổi.

## Công nghệ sử dụng

HTML — cấu trúc trang web.
CSS — định dạng giao diện, layout, modal, toast.
JavaScript — xử lý logic: đăng nhập, đăng ký, đặt tour, review, quản trị, lưu dữ liệu.
localStorage — lưu dữ liệu cục bộ trên trình duyệt:
users
currentUser
tours
bookings
reviews
## Chức năng chính
đây là một mini web app đặt tour + quản trị tour + đánh giá, chạy hoàn toàn bằng HTML/CSS/JS.
### Admin

Quản lý tour:

Thêm tour mới với tên, địa điểm, giá, ảnh và mô tả.
Sửa thông tin tour hiện có.
Xóa tour.
Xem đánh giá:

Hiển thị số lượng đánh giá của từng tour.
Mở modal xem chi tiết các đánh giá cho tour đó.
Quyền truy cập:

Chỉ user có role === "admin" mới vào được admin.html.
Nếu không phải admin, trang sẽ báo lỗi và chuyển về index.html.
Tự động tạo admin:

register.html khởi tạo sẵn tài khoản admin mặc định khi chưa có:
email: admin@gmail.com
password: 123456

### User

Đăng ký tài khoản và đăng nhập.
Xem danh sách tour trên index.html.
Tìm kiếm tour bằng thanh tìm kiếm.
Đặt tour:
Khi nhấn Đặt Tour, dữ liệu lưu vào localStorage.bookings.
Xem lịch sử đặt tour trên history.html.
Gửi đánh giá trên review.html nếu đã đặt tour:
Chọn tour đã đặt
Nhập số sao và nội dung đánh giá
Xem lại đánh giá của bản thân và đánh giá chung.

## Cài đặt

Dự án này là ứng dụng web tĩnh HTML/CSS/JS.
Không cần cài thêm thư viện hay build.
Cách chạy
Mở index.html trong trình duyệt.
Hoặc dùng Live Server trong VS Code để chạy local.
Nếu cần server đơn giản
Dùng Python:
Mở Terminal tại blockchain
Chạy:
python -m http.server 8000
Mở http://localhost:8000

## Kiểm thử smart contract

```bash
npm test
```

## Tài khoản Admin ban đầu

Email: admin@gmail.com
Mật khẩu: 123456

## Cấu trúc thư mục

blockchain
admin.html
history.html
index.html
login.html
register.html
review.html
css
style.css
js
admin.js
auth.js
booking.js
review.js
toast.js
tours.js

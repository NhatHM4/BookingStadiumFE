1. ✅ /stadiums/{id} LẤY THỜI GIAN HIỆN TẠI VÀ DISABLE ĐẶT NHỮNG SÂN CÓ THỜI GIAN TRONG QUÁ KHỨ
   - Implemented in SlotPicker.tsx
   - Past time slots are automatically disabled
   - Shows "Đã qua" badge for past slots

2. ✅ /stadiums/{id} Sân mà có người đặt sân thì hiển thị tên của người đặt luôn nhé
   - Added bookedByName field to AvailableSlotResponse type
   - SlotPicker now displays booker's name in badge
   - ⚠️ Backend needs to provide bookedByName in API response:
     GET /fields/{fieldId}/available-slots?date={date}
     Response should include: { ..., bookedByName: "Tên người đặt" }

3. ✅ Admin/Owner - Quick Time Slot Creation
   - Added "Tạo nhanh" feature in /owner/stadiums/[id]/time-slots
   - Configure: start time, end time, duration (30/60/90/120 min), base price
   - Generate list of slots automatically
   - Edit individual slots before creation
   - Bulk create all at once 

4. ✅ Đặt sân cho Khách (không cần đăng nhập) - API 7.3
   - Thêm trang /bookings/guest cho phép đặt sân không cần đăng nhập
   - Khách nhập: Tên (bắt buộc), SĐT (bắt buộc), Email (tùy chọn)
   - Khách KHÔNG thể tạo trận ráp kèo (isMatchRequest = false)
   - API: POST /api/v1/bookings/guest (Public, không cần auth)
   - Booking khách có customerId = null, isGuestBooking = true
   - Khi click "Đặt sân ngay" ở trang chi tiết sân:
     + Đã đăng nhập → chuyển đến /bookings/new (đặt sân thường)
     + Chưa đăng nhập → chuyển đến /bookings/guest (đặt sân khách)
   - Types: GuestBookingRequest, BookingResponse updated với guest fields

5. ✅ Tra cứu đơn đặt sân theo mã (không cần đăng nhập) - API 7.4
   - Trang /bookings/lookup cho phép tra cứu booking bằng mã bookingCode
   - API: GET /api/v1/bookings/lookup?bookingCode=xxx (Public)
   - Hiển thị đầy đủ: trạng thái, thông tin sân, giờ, giá, cọc, thông tin khách
   - Sau khi đặt sân khách thành công → nút "Tra cứu đơn đặt sân" tự điền mã
   - Route public, không cần đăng nhập
   - Thêm tab "Tra cứu đơn" ở Header (hiển thị cho tất cả user)

6. ✅ Trang chủ - Search kèo ráp và nhận kèo nhanh
   - Thêm block "Kèo Ráp Đang Mở" ngay tại `/` (Home)
   - Search client-side theo: mã kèo, đội chủ, tên sân, tên sân con
   - Lấy dữ liệu từ API: `GET /api/v1/match-requests?page=0&size=100&sort=createdAt,desc`
   - User có thể bấm "Nhận kèo ngay" trực tiếp tại Home
   - Gửi nhận kèo qua API: `POST /api/v1/match-requests/{id}/responses`
   - Hỗ trợ 2 cách nhận kèo: bằng đội hoặc tham gia cá nhân (không cần đội)
   - Chỉ tài khoản CUSTOMER mới nhận kèo trực tiếp; user chưa đăng nhập sẽ được yêu cầu login

7. ✅ Owner - Sân con hỗ trợ ảnh (create/update)
   - Cập nhật `FieldRequest` thêm `imageUrl?: string`
   - Cập nhật form `/owner/stadiums/{id}/fields`:
     + Upload ảnh sân con (dùng lại API `POST /api/v1/images/upload`)
     + Preview, đổi ảnh, xóa ảnh trước khi submit
     + Gửi `imageUrl` trong cả `POST /stadiums/{stadiumId}/fields` và `PUT /fields/{id}`
   - Danh sách sân con trong trang owner hiển thị thumbnail ảnh
   - Trang chi tiết sân public `/stadiums/{id}` hiển thị ảnh của từng sân con (nếu có)

8. ✅ Team members linh hoạt + Team bắt buộc SĐT + Auto-fill SĐT ráp kèo
   - Team:
     + `TeamRequest` thêm `phone` và bắt buộc ở form tạo đội
     + Danh sách/chi tiết đội hiển thị SĐT đội
   - Team members:
     + Chuyển từ invite theo email sang thêm trực tiếp `name + phone`
     + `AddMemberRequest` cập nhật thành `{ name, phone }`
     + Xử lý remove/chuyển đội trưởng dùng `memberId`
   - Booking ráp kèo (`/bookings/new`):
     + SĐT liên hệ được auto-fill từ đội đã chọn hoặc SĐT user đăng nhập
     + User vẫn có thể sửa tay và hệ thống tôn trọng giá trị nhập thủ công

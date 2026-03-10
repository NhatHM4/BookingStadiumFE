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
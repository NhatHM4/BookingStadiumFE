# Đặc Tả Telegram Bot Backend (Java/Spring)

Tài liệu này áp dụng theo skill `telegram-booking-bot` cho hệ thống Booking Stadium.

## 1) Mục tiêu

Triển khai Telegram bot ở backend Java (Spring Boot 3+, Java 17+) với 2 tính năng:

1. Có kèo mới thì gửi thông báo Telegram cho user đã subscribe.
2. User hỏi sân trống theo ngày giờ trong Telegram, bot trả slot phù hợp rồi hỏi thêm SĐT + tên người đặt để tạo booking lead/request.

## 2) Biến môi trường

- `TELEGRAM_BOT_ENABLED=true|false`
- `TELEGRAM_BOT_TOKEN=...`
- `TELEGRAM_WEBHOOK_SECRET=...`
- `APP_BASE_URL=https://your-fe-domain`

## 3) Kiến trúc module (gợi ý)

- `com.yourapp.telegram.controller`
- `com.yourapp.telegram.service`
- `com.yourapp.telegram.handlers`
- `com.yourapp.telegram.template`
- `com.yourapp.telegram.subscription`
- `com.yourapp.telegram.outbox`

Nguyên tắc: domain service không gọi Telegram trực tiếp. Dùng event + outbox.

## 4) Data model tối thiểu

### `telegram_subscriptions`

- `id` (pk)
- `chat_id` (unique)
- `user_id` (nullable)
- `match_alert_enabled` (bool)
- `created_at`
- `updated_at`

### `telegram_conversations`

- `id` (pk)
- `chat_id`
- `state` (`IDLE|ASK_DATE|ASK_TIME|ASK_LOCATION|SHOW_SLOTS|ASK_PHONE|ASK_NAME|CONFIRM`)
- `payload_json`
- `expires_at`
- `created_at`
- `updated_at`

### `notification_outbox`

- `id` (pk)
- `event_type`
- `event_id`
- `chat_id`
- `payload_json`
- `status` (`PENDING|SENT|FAILED|DEAD`)
- `retry_count`
- `next_retry_at`
- `last_error`
- `created_at`
- `updated_at`

Unique key: `(event_id, chat_id)`.

## 5) Tính năng A: thông báo kèo mới

Nguồn event: `MATCH_REQUEST_CREATED`.

Payload cần có:

- `eventId`
- `matchRequestId`
- `matchCode`
- `stadiumName`
- `fieldName`
- `bookingDate`
- `startTime`
- `endTime`
- `hostTeamName`
- `contactPhone`

Template tin nhắn:

```text
[KÈO MỚI]
Mã kèo: {matchCode}
Sân: {stadiumName} - {fieldName}
Ngày: {bookingDate}
Giờ: {startTime}-{endTime}
Chủ kèo: {hostTeamName}
Liên hệ: {contactPhone}
Xem chi tiết: {appBaseUrl}/matches/{matchRequestId}
```

Yêu cầu kỹ thuật:

- Chỉ gửi cho chat bật subscribe.
- Chống gửi trùng theo `(eventId, chatId)`.
- Retry exponential backoff.
- Quá số lần retry thì chuyển `DEAD`.

## 6) Tính năng B: hỏi sân trống rồi lấy thông tin đặt

Flow hội thoại:

1. `/san_trong` -> hỏi ngày `YYYY-MM-DD`
2. Hỏi giờ `HH:mm`
3. Hỏi quận/huyện (optional)
4. Gọi `AvailabilityService.search(...)`
5. Trả top slot để user chọn
6. Hỏi SĐT liên hệ
7. Hỏi tên người đặt
8. Xác nhận thông tin
9. Tạo booking lead/request

Rule:

- Validate format ngày/giờ.
- Không cho chọn thời điểm quá khứ.
- Validate/normalize phone.
- Timeout hội thoại sau 15 phút.
- `/cancel` xóa state ngay.

## 7) API/Webhook

Webhook endpoint gợi ý:

- `POST /api/v1/telegram/webhook`

Bắt buộc:

- Verify header `X-Telegram-Bot-Api-Secret-Token`.
- Rate limit theo `chatId`.
- Mask SĐT trong log.

## 8) Service contract nội bộ

- `AvailabilityService.search(date, time, district?) -> SlotOption[]`
- `BookingLeadService.createFromTelegram(input)`
- `TelegramMessageSender.sendMessage(chatId, text)`

## 9) Checklist bàn giao BR/BE

1. Có migration cho 3 bảng Telegram.
2. Có webhook controller + verify secret.
3. Có handler cho `/start`, `/subscribe_keo`, `/unsubscribe_keo`, `/san_trong`, `/cancel`.
4. Có consumer `MATCH_REQUEST_CREATED` + outbox worker.
5. Có test unit + integration cho 2 flow chính.
6. Có metrics cơ bản: sent/failed/active-conversations.


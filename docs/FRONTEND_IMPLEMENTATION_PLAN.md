# Booking Stadium - Frontend Implementation Plan

> **Tech Stack:** Next.js 14 (App Router) + NextAuth.js + Tailwind CSS + TypeScript  
> **UI Library:** shadcn/ui (Radix UI + Tailwind)  
> **HTTP Client:** Axios  
> **State Management:** React Query (TanStack Query) + Zustand  
> **Form:** React Hook Form + Zod  
> **Icons:** Lucide React  
> **Date:** date-fns  
> **Backend API:** `http://localhost:8080/api/v1`

---

## Mục Lục

1. [Tổng Quan Phases](#1-tổng-quan-phases)
2. [Phase 1 - Foundation & Auth](#2-phase-1---foundation--auth)
3. [Phase 2 - Public Pages](#3-phase-2---public-pages)
4. [Phase 3 - Customer Booking](#4-phase-3---customer-booking)
5. [Phase 4 - Owner Dashboard](#5-phase-4---owner-dashboard)
6. [Phase 5 - Team & Match Making](#6-phase-5---team--match-making)
7. [Phase 6 - Recurring Booking & Admin](#7-phase-6---recurring-booking--admin)
8. [Project Structure](#8-project-structure)
9. [Conventions & Standards](#9-conventions--standards)

---

## 1. Tổng Quan Phases

| Phase | Mô tả | APIs sử dụng | Ước lượng |
|-------|--------|--------------|-----------|
| **Phase 1** | Foundation & Auth | Auth (6 APIs) | Setup + Auth |
| **Phase 2** | Public Pages (Home, Stadium) | Stadium (4), Field (1), TimeSlot (1), Available Slots (1) | 7 APIs |
| **Phase 3** | Customer Booking & Review | Booking (5), Deposit (4), Review (3) | 12 APIs |
| **Phase 4** | Owner Dashboard | Owner APIs (Stadium, Field, TimeSlot, Booking, Deposit) | 15 APIs |
| **Phase 5** | Team & Match Making | Team (11), Match (10) | 21 APIs |
| **Phase 6** | Recurring Booking & Admin | Recurring (7), Admin (7) | 14 APIs |

---

## 2. Phase 1 - Foundation & Auth

### 2.1 Mục tiêu
- Khởi tạo Next.js 14 project với App Router
- Cấu hình Tailwind CSS, shadcn/ui
- Setup API client (Axios) với interceptor cho JWT
- Tích hợp NextAuth.js (Credentials + Google OAuth)
- Trang đăng nhập, đăng ký
- Layout chung (Header, Footer)
- Protected routes middleware

### 2.2 Trang cần làm

| Route | Component | Auth | Mô tả |
|-------|-----------|------|--------|
| `/login` | `LoginPage` | Public | Đăng nhập (email/password + Google) |
| `/register` | `RegisterPage` | Public | Đăng ký (Customer/Owner) |
| `/` | `HomePage` | Public | Trang chủ (placeholder) |

### 2.3 API Integration

| API | Hook/Function | Mô tả |
|-----|---------------|--------|
| `POST /auth/login` | NextAuth Credentials Provider | Đăng nhập |
| `POST /auth/register` | `useRegister()` | Đăng ký |
| `POST /auth/social-login` | NextAuth Google Provider → social-login | Google login |
| `POST /auth/refresh-token` | Axios interceptor | Auto refresh |
| `POST /auth/logout` | `signOut()` + API call | Đăng xuất |
| `GET /auth/me` | NextAuth session | Lấy user info |

### 2.4 Key Files

```
src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login page
│   │   └── register/page.tsx         # Register page
│   └── api/auth/[...nextauth]/route.ts  # NextAuth API route
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── UserMenu.tsx
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── client.ts                 # Axios instance
│   │   └── auth.ts                   # Auth API functions
│   ├── auth.ts                       # NextAuth config
│   └── utils.ts                      # Utilities
├── types/
│   ├── api.ts                        # API response types
│   ├── auth.ts                       # Auth types
│   └── index.ts                      # Common types
├── hooks/
│   └── use-auth.ts                   # Auth hooks
└── middleware.ts                      # Route protection
```

---

## 3. Phase 2 - Public Pages

### 3.1 Mục tiêu
- Trang chủ với featured stadiums, tìm kiếm
- Trang chủ hiển thị kèo ráp đang mở + tìm kiếm theo mã/đội/sân
- Nhận kèo nhanh ngay tại trang chủ (không cần vào trang chi tiết kèo)
- Danh sách sân với bộ lọc (city, district, fieldType)
- Chi tiết sân (info, fields, time slots, reviews)
- Tìm sân gần đây (geolocation)
- Xem slot trống theo ngày

### 3.2 Trang cần làm

| Route | Component | Auth | Mô tả |
|-------|-----------|------|--------|
| `/` | `HomePage` | Public | Hero, search, featured |
| `/stadiums` | `StadiumListPage` | Public | DS sân + filter + pagination |
| `/stadiums/[id]` | `StadiumDetailPage` | Public | Chi tiết sân, fields, reviews |
| `/stadiums/nearby` | `NearbyStadiumsPage` | Public | Sân gần đây (GPS) |

### 3.3 API Integration

| API | Hook | Mô tả |
|-----|------|--------|
| `GET /stadiums` | `useStadiums(filters)` | DS sân + filter |
| `GET /stadiums/{id}` | `useStadium(id)` | Chi tiết sân |
| `GET /stadiums/nearby` | `useNearbyStadiums(lat, lng)` | Sân gần đây |
| `GET /stadiums/{id}/fields` | `useFields(stadiumId)` | DS sân con |
| `GET /fields/{id}/time-slots` | `useTimeSlots(fieldId)` | DS khung giờ |
| `GET /fields/{id}/available-slots` | `useAvailableSlots(fieldId, date)` | Slot trống |
| `GET /stadiums/{id}/reviews` | `useStadiumReviews(stadiumId)` | Đánh giá |
| `GET /match-requests` | `useOpenMatches({ page: 0, size: 100 })` | DS kèo đang mở trên Home |
| `POST /match-requests/{id}/responses` | `useSendMatchResponse()` | Nhận kèo nhanh từ Home (cần đăng nhập) |

---

## 4. Phase 3 - Customer Booking

### 4.1 Mục tiêu
- Flow đặt sân hoàn chỉnh (chọn field → slot → confirm)
- Đặt cọc (upload proof, chọn payment method)
- Lịch sử đặt sân (filter by status)
- Chi tiết đơn đặt
- Hủy đặt sân
- Đánh giá sau hoàn thành

### 4.2 Trang cần làm

| Route | Component | Auth | Mô tả |
|-------|-----------|------|--------|
| `/booking/new` | `BookingPage` | CUSTOMER | Flow đặt sân |
| `/bookings` | `MyBookingsPage` | CUSTOMER | Lịch sử đặt sân |
| `/bookings/[id]` | `BookingDetailPage` | Authenticated | Chi tiết + cọc + hủy |
| `/reviews` | `MyReviewsPage` | Authenticated | DS đánh giá của tôi |

### 4.3 API Integration

| API | Hook | Mô tả |
|-----|------|--------|
| `POST /bookings` | `useCreateBooking()` | Đặt sân |
| `GET /bookings/my` | `useMyBookings(status)` | Lịch sử |
| `GET /bookings/{id}` | `useBooking(id)` | Chi tiết |
| `PUT /bookings/{id}/cancel` | `useCancelBooking()` | Hủy |
| `GET /stadiums/{id}/deposit-policy` | `useDepositPolicy(stadiumId)` | Chính sách cọc |
| `POST /bookings/{id}/deposits` | `useCreateDeposit()` | Đặt cọc |
| `GET /bookings/{id}/deposits` | `useBookingDeposits(bookingId)` | Lịch sử cọc |
| `POST /reviews` | `useCreateReview()` | Đánh giá |
| `GET /reviews/my` | `useMyReviews()` | DS đánh giá |
| `DELETE /reviews/{id}` | `useDeleteReview()` | Xóa đánh giá |

---

## 5. Phase 4 - Owner Dashboard

### 5.1 Mục tiêu
- Dashboard tổng quan cho Owner
- CRUD stadium, field, time slot
- Quản lý booking (xem/xác nhận/từ chối/hoàn thành)
- Quản lý deposit (xác nhận/từ chối cọc, hoàn cọc)
- Cấu hình deposit policy

### 5.2 Trang cần làm

| Route | Component | Auth | Mô tả |
|-------|-----------|------|--------|
| `/owner` | `OwnerDashboard` | OWNER | Tổng quan |
| `/owner/stadiums` | `OwnerStadiumsPage` | OWNER | DS sân của tôi |
| `/owner/stadiums/new` | `CreateStadiumPage` | OWNER | Tạo sân mới |
| `/owner/stadiums/[id]` | `EditStadiumPage` | OWNER | Sửa sân |
| `/owner/stadiums/[id]/fields` | `ManageFieldsPage` | OWNER | Quản lý sân con |
| `/owner/stadiums/[id]/time-slots` | `ManageTimeSlotsPage` | OWNER | Quản lý khung giờ |
| `/owner/stadiums/[id]/deposit-policy` | `DepositPolicyPage` | OWNER | Cấu hình cọc |
| `/owner/bookings` | `OwnerBookingsPage` | OWNER | DS đơn đặt |
| `/owner/bookings/[id]` | `OwnerBookingDetailPage` | OWNER | Chi tiết đơn |

### 5.3 API Integration

Owner-specific APIs:
- `GET /owner/stadiums` — DS sân của tôi
- `POST /stadiums` — Tạo sân
- `PUT /stadiums/{id}` — Sửa sân
- `DELETE /stadiums/{id}` — Xóa sân
- `POST /stadiums/{id}/fields` — Tạo sân con
- `PUT /fields/{id}` — Sửa sân con
- `DELETE /fields/{id}` — Xóa sân con
- `POST /fields/{id}/time-slots` — Tạo khung giờ
- `PUT /time-slots/{id}` — Sửa khung giờ
- `DELETE /time-slots/{id}` — Xóa khung giờ
- `GET /owner/bookings` — DS đơn đặt
- `GET /owner/stadiums/{id}/bookings?date=` — Đơn theo sân+ngày
- `PUT /owner/bookings/{id}/confirm` — Xác nhận
- `PUT /owner/bookings/{id}/reject` — Từ chối
- `PUT /owner/bookings/{id}/complete` — Hoàn thành
- `PUT /stadiums/{id}/deposit-policy` — Cập nhật chính sách cọc
- `PUT /owner/deposits/{id}/confirm` — Xác nhận cọc
- `PUT /owner/deposits/{id}/reject` — Từ chối cọc
- `POST /owner/bookings/{id}/refund` — Hoàn cọc

---

## 6. Phase 5 - Team & Match Making

### 6.1 Mục tiêu
- Quản lý đội bóng (CRUD, members)
- Tạo kèo ráp đối
- Duyệt/nhận kèo
- DS kèo đang mở (public)

### 6.2 Trang cần làm

| Route | Component | Auth | Mô tả |
|-------|-----------|------|--------|
| `/teams` | `MyTeamsPage` | Authenticated | DS đội của tôi |
| `/teams/new` | `CreateTeamPage` | Authenticated | Tạo đội |
| `/teams/[id]` | `TeamDetailPage` | Authenticated | Chi tiết đội + members |
| `/matches` | `MatchListPage` | Public | DS kèo đang mở |
| `/matches/[id]` | `MatchDetailPage` | Public | Chi tiết kèo |
| `/matches/my` | `MyMatchesPage` | Authenticated | Kèo tôi tạo/nhận |
| `/matches/new` | `CreateMatchPage` | Authenticated | Tạo kèo |

### 6.3 API Integration

Team APIs (11):
- `POST /teams` — Tạo đội
- `GET /teams/my` — DS đội
- `GET /teams/{id}` — Chi tiết
- `PUT /teams/{id}` — Sửa
- `DELETE /teams/{id}` — Giải tán
- `POST /teams/{id}/members` — Mời thành viên
- `PUT /teams/{id}/members/{userId}/remove` — Xóa thành viên
- `PUT /teams/{id}/members/{userId}/captain` — Chuyển đội trưởng
- `PUT /teams/{id}/leave` — Rời đội
- `PUT /team-invites/{id}/accept` — Chấp nhận mời
- `PUT /team-invites/{id}/reject` — Từ chối mời

Match APIs (10):
- `POST /match-requests` — Tạo kèo
- `GET /match-requests` — DS kèo (filter)
- `GET /match-requests/{id}` — Chi tiết
- `PUT /match-requests/{id}/cancel` — Hủy kèo
- `GET /match-requests/my` — Kèo tôi tạo
- `GET /match-requests/my-matches` — Kèo tôi nhận
- `POST /match-requests/{id}/responses` — Gửi nhận kèo
- `PUT /match-requests/{id}/responses/{responseId}/accept` — Chấp nhận
- `PUT /match-requests/{id}/responses/{responseId}/reject` — Từ chối
- `PUT /match-requests/{id}/responses/{responseId}/withdraw` — Rút

---

## 7. Phase 6 - Recurring Booking & Admin

### 7.1 Mục tiêu
- Đặt sân dài hạn (weekly/monthly)
- Admin dashboard & quản lý
- Duyệt sân mới

### 7.2 Trang cần làm

| Route | Component | Auth | Mô tả |
|-------|-----------|------|--------|
| `/recurring-bookings` | `MyRecurringPage` | CUSTOMER | DS gói dài hạn |
| `/recurring-bookings/new` | `CreateRecurringPage` | CUSTOMER | Tạo gói |
| `/recurring-bookings/[id]` | `RecurringDetailPage` | Authenticated | Chi tiết gói |
| `/admin` | `AdminDashboard` | ADMIN | Dashboard thống kê |
| `/admin/users` | `AdminUsersPage` | ADMIN | Quản lý users |
| `/admin/stadiums` | `AdminStadiumsPage` | ADMIN | Duyệt sân |

---

## 8. Project Structure

```
booking-stadium-fe/
├── public/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root layout (providers, fonts)
│   │   ├── page.tsx                       # Home page
│   │   ├── globals.css                    # Tailwind imports
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                 # Auth layout (centered)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx                 # Main layout (header+footer)
│   │   │   ├── stadiums/
│   │   │   │   ├── page.tsx               # Stadium list
│   │   │   │   ├── [id]/page.tsx          # Stadium detail
│   │   │   │   └── nearby/page.tsx        # Nearby stadiums
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx               # My bookings
│   │   │   │   ├── [id]/page.tsx          # Booking detail
│   │   │   │   └── new/page.tsx           # New booking
│   │   │   ├── teams/
│   │   │   ├── matches/
│   │   │   ├── reviews/
│   │   │   └── recurring-bookings/
│   │   ├── owner/
│   │   │   ├── layout.tsx                 # Owner dashboard layout
│   │   │   ├── page.tsx                   # Owner dashboard
│   │   │   ├── stadiums/
│   │   │   ├── bookings/
│   │   │   └── recurring-bookings/
│   │   ├── admin/
│   │   │   ├── layout.tsx                 # Admin layout
│   │   │   ├── page.tsx                   # Admin dashboard
│   │   │   ├── users/
│   │   │   └── stadiums/
│   │   └── api/
│   │       └── auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── ui/                            # shadcn/ui (Button, Input, Card...)
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── stadium/
│   │   │   ├── StadiumCard.tsx
│   │   │   ├── StadiumList.tsx
│   │   │   ├── StadiumFilter.tsx
│   │   │   └── StadiumDetail.tsx
│   │   ├── booking/
│   │   │   ├── BookingForm.tsx
│   │   │   ├── SlotPicker.tsx
│   │   │   └── BookingCard.tsx
│   │   ├── team/
│   │   ├── match/
│   │   └── shared/
│   │       ├── Pagination.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── StatusBadge.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                  # Axios instance + interceptors
│   │   │   ├── auth.ts                    # Auth API functions
│   │   │   ├── stadiums.ts                # Stadium APIs
│   │   │   ├── fields.ts                  # Field APIs
│   │   │   ├── time-slots.ts              # TimeSlot APIs
│   │   │   ├── bookings.ts                # Booking APIs
│   │   │   ├── deposits.ts                # Deposit APIs
│   │   │   ├── recurring-bookings.ts      # Recurring APIs
│   │   │   ├── teams.ts                   # Team APIs
│   │   │   ├── matches.ts                 # Match APIs
│   │   │   ├── reviews.ts                 # Review APIs
│   │   │   └── admin.ts                   # Admin APIs
│   │   ├── auth.ts                        # NextAuth configuration
│   │   ├── utils.ts                       # cn(), formatCurrency(), etc.
│   │   └── validations/
│   │       ├── auth.ts                    # Login/Register schemas
│   │       ├── booking.ts                 # Booking schemas
│   │       └── stadium.ts                 # Stadium schemas
│   ├── types/
│   │   ├── api.ts                         # ApiResponse<T>, PaginatedResponse
│   │   ├── auth.ts                        # User, JwtResponse, LoginRequest...
│   │   ├── stadium.ts                     # Stadium, Field, TimeSlot...
│   │   ├── booking.ts                     # Booking, Deposit, DepositPolicy...
│   │   ├── team.ts                        # Team, TeamMember...
│   │   ├── match.ts                       # MatchRequest, MatchResponse...
│   │   ├── review.ts                      # Review...
│   │   └── enums.ts                       # All enums
│   ├── hooks/
│   │   ├── use-stadiums.ts                # Stadium query hooks
│   │   ├── use-bookings.ts                # Booking query hooks
│   │   ├── use-teams.ts                   # Team query hooks
│   │   ├── use-matches.ts                 # Match query hooks
│   │   └── use-reviews.ts                 # Review query hooks
│   ├── stores/
│   │   └── booking-store.ts               # Zustand store for booking flow
│   ├── providers/
│   │   ├── AuthProvider.tsx               # NextAuth SessionProvider
│   │   └── QueryProvider.tsx              # TanStack Query provider
│   └── middleware.ts                       # Route protection
├── .env.local                              # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── components.json                         # shadcn/ui config
```

---

## 9. Conventions & Standards

### Naming
- **Files:** kebab-case (`stadium-card.tsx`)
- **Components:** PascalCase (`StadiumCard`)
- **Hooks:** camelCase with `use` prefix (`useStadiums`)
- **Types/Interfaces:** PascalCase (`StadiumResponse`)
- **API functions:** camelCase (`getStadiums`, `createBooking`)
- **Enums:** UPPER_SNAKE_CASE values

### API Client Pattern
```typescript
// lib/api/client.ts - Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach JWT
// Response interceptor: auto refresh token on 401
```

### React Query Pattern
```typescript
// hooks/use-stadiums.ts
export function useStadiums(filters: StadiumFilters) {
  return useQuery({
    queryKey: ['stadiums', filters],
    queryFn: () => getStadiums(filters),
  });
}

export function useCreateStadium() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStadium,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stadiums'] }),
  });
}
```

### Auth Flow
```
1. User submits login form
2. NextAuth calls POST /auth/login
3. On success: store accessToken + refreshToken in NextAuth session
4. Axios interceptor reads token from session for API calls
5. On 401: interceptor calls POST /auth/refresh-token
6. On logout: call POST /auth/logout + signOut()
```

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

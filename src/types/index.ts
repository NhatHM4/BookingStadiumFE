import {
  FieldType,
  Role,
  StadiumStatus,
  BookingStatus,
  DepositStatus,
  DepositType,
  DepositTransactionStatus,
  PaymentMethod,
  RecurrenceType,
  RecurringBookingStatus,
  RecurringDepositStatus,
  SkillLevel,
  CostSharing,
  MatchStatus,
  MatchResponseStatus,
  TeamMemberRole,
  TeamMemberStatus,
} from "./enums";

// ========================
// Stadium
// ========================

export interface StadiumResponse {
  id: number;
  ownerId: number;
  ownerName: string;
  name: string;
  address: string;
  district: string | null;
  city: string | null;
  description: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  openTime: string | null;
  closeTime: string | null;
  status: StadiumStatus;
  avgRating: number;
  reviewCount: number;
  fieldCount: number;
}

export interface StadiumRequest {
  name: string;
  address: string;
  district?: string;
  city?: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  openTime?: string;
  closeTime?: string;
}

export interface StadiumFilters {
  city?: string;
  district?: string;
  name?: string;
  fieldType?: FieldType;
  page?: number;
  size?: number;
  sort?: string;
}

// ========================
// Field
// ========================

export interface FieldResponse {
  id: number;
  stadiumId: number;
  stadiumName: string;
  name: string;
  fieldType: FieldType;
  defaultPrice: number;
  isActive: boolean;
  parentFieldId: number | null;
  childFieldCount: number;
}

export interface FieldRequest {
  name: string;
  fieldType: FieldType;
  defaultPrice: number;
  parentFieldId?: number | null;
}

// ========================
// TimeSlot
// ========================

export interface TimeSlotResponse {
  id: number;
  fieldId: number;
  fieldName: string;
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
}

export interface TimeSlotRequest {
  startTime: string;
  endTime: string;
  price: number;
}

// ========================
// Available Slot
// ========================

export interface AvailableSlotResponse {
  timeSlotId: number;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
  bookedByName?: string; // Name of the person who booked this slot
}

// ========================
// Booking
// ========================

export interface BookingResponse {
  id: number;
  bookingCode: string;
  customerId: number | null;
  customerName: string;
  isGuestBooking?: boolean;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  fieldId: number;
  fieldName: string;
  stadiumId: number;
  stadiumName: string;
  timeSlotId: number;
  startTime: string;
  endTime: string;
  bookingDate: string;
  isMatchRequest: boolean;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  depositStatus: DepositStatus;
  note: string | null;
  status: BookingStatus;
  cancelledAt: string | null;
  cancelReason: string | null;
  recurringBookingId: number | null;
  createdAt: string;
}

export interface BookingRequest {
  fieldId: number;
  timeSlotId: number;
  bookingDate: string;
  note?: string;
  isMatchRequest?: boolean;
  // Match request fields (only when isMatchRequest = true)
  // Option 1: Dùng đội có sẵn
  teamId?: number;
  // Option 2: Tạo đội nhanh
  createQuickTeam?: boolean;
  quickTeamName?: string;
  quickTeamSkillLevel?: SkillLevel;
  // Option 3: Không cần đội
  hostName?: string;
  contactPhone?: string;
  // Thông tin chung
  requiredSkillLevel?: SkillLevel;
  costSharing?: CostSharing;
  hostSharePercent?: number;
  opponentSharePercent?: number;
  matchMessage?: string;
}

export interface GuestBookingRequest {
  fieldId: number;
  timeSlotId: number;
  bookingDate: string;
  note?: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
}

// ========================
// Deposit
// ========================

export interface DepositResponse {
  id: number;
  bookingId: number;
  bookingCode: string;
  amount: number;
  depositType: DepositType;
  paymentMethod: PaymentMethod;
  transactionCode: string | null;
  note: string | null;
  confirmedById: number | null;
  confirmedByName: string | null;
  confirmedAt: string | null;
  status: DepositTransactionStatus;
  createdAt: string;
}

export interface DepositRequest {
  paymentMethod: PaymentMethod;
  transactionCode?: string;
  note?: string;
}

export interface RefundRequest {
  paymentMethod?: PaymentMethod;
  note?: string;
}

export interface DepositPolicyResponse {
  id: number;
  stadiumId: number;
  stadiumName: string;
  depositPercent: number;
  refundBeforeHours: number;
  refundPercent: number;
  lateCancelRefundPercent: number;
  recurringDiscountPercent: number;
  minRecurringSessions: number;
  isDepositRequired: boolean;
}

export interface DepositPolicyRequest {
  depositPercent: number;
  refundBeforeHours?: number;
  refundPercent?: number;
  lateCancelRefundPercent?: number;
  recurringDiscountPercent?: number;
  minRecurringSessions?: number;
  isDepositRequired?: boolean;
}

// ========================
// Recurring Booking
// ========================

export interface RecurringBookingResponse {
  id: number;
  recurringCode: string;
  customerId: number;
  customerName: string;
  fieldId: number;
  fieldName: string;
  stadiumId: number;
  stadiumName: string;
  timeSlotId: number;
  timeSlotRange: string;
  recurrenceType: RecurrenceType;
  dayOfWeek: number;
  startDate: string;
  endDate: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  discountPercent: number;
  originalPricePerSession: number;
  discountedPricePerSession: number;
  totalPrice: number;
  totalDeposit: number;
  depositStatus: RecurringDepositStatus;
  status: RecurringBookingStatus;
  note: string | null;
  createdAt: string;
  bookings: BookingResponse[];
}

export interface RecurringBookingRequest {
  fieldId: number;
  timeSlotId: number;
  recurrenceType: RecurrenceType;
  startDate: string;
  endDate: string;
  note?: string;
}

// ========================
// Team
// ========================

export interface TeamResponse {
  id: number;
  name: string;
  logoUrl: string | null;
  description: string | null;
  preferredFieldType: FieldType | null;
  skillLevel: SkillLevel | null;
  captainId: number;
  captainName: string;
  memberCount: number;
  city: string | null;
  district: string | null;
  isActive: boolean;
  createdAt: string;
  members: TeamMemberResponse[];
}

export interface TeamMemberResponse {
  id: number;
  teamId: number;
  teamName: string;
  userId: number;
  userName: string;
  userEmail: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joinedAt: string | null;
  createdAt: string;
}

export interface TeamRequest {
  name: string;
  logoUrl?: string;
  description?: string;
  preferredFieldType?: FieldType;
  skillLevel?: SkillLevel;
  city?: string;
  district?: string;
}

export interface AddMemberRequest {
  email: string;
}

// ========================
// Match Making
// ========================

export interface MatchRequestResponse {
  id: number;
  matchCode: string;
  bookingId: number;
  bookingCode: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  stadiumId: number;
  stadiumName: string;
  stadiumAddress: string;
  fieldId: number;
  fieldName: string;
  hostTeamId: number;
  hostTeamName: string;
  hostTeamLogoUrl: string | null;
  opponentTeamId: number | null;
  opponentTeamName: string | null;
  opponentTeamLogoUrl: string | null;
  fieldType: FieldType;
  requiredSkillLevel: SkillLevel;
  costSharing: CostSharing;
  hostSharePercent: number;
  opponentSharePercent: number;
  totalPrice: number;
  opponentAmount: number;
  message: string | null;
  contactPhone: string | null;
  status: MatchStatus;
  acceptedAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  responseCount: number;
  responses: MatchResponseResponse[];
}

export interface MatchRequestRequest {
  bookingId: number;
  teamId: number;
  requiredSkillLevel?: SkillLevel;
  costSharing?: CostSharing;
  hostSharePercent?: number;
  opponentSharePercent?: number;
  message?: string;
  contactPhone?: string;
}

export interface MatchResponseResponse {
  id: number;
  matchRequestId: number;
  teamId: number;
  teamName: string;
  teamLogoUrl: string | null;
  message: string | null;
  status: MatchResponseStatus;
  respondedAt: string | null;
  createdAt: string;
}

export interface MatchResponseRequest {
  teamId?: number;
  message?: string;
}

// ========================
// Review
// ========================

export interface ReviewResponse {
  id: number;
  bookingId: number;
  bookingCode: string;
  customerId: number;
  customerName: string;
  customerAvatarUrl: string | null;
  stadiumId: number;
  stadiumName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewRequest {
  bookingId: number;
  rating: number;
  comment?: string;
}

// ========================
// Admin
// ========================

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  provider: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardResponse {
  totalUsers: number;
  totalCustomers: number;
  totalOwners: number;
  totalStadiums: number;
  approvedStadiums: number;
  pendingStadiums: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalTeams: number;
  totalMatchRequests: number;
  totalReviews: number;
  averageRating: number;
  recentBookings: Record<string, number>;
}

// ========================
// Enums matching Backend
// ========================

export enum Role {
  CUSTOMER = "CUSTOMER",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  SOCIAL = "SOCIAL",
}

export enum FieldType {
  FIVE_A_SIDE = "FIVE_A_SIDE",
  SEVEN_A_SIDE = "SEVEN_A_SIDE",
  ELEVEN_A_SIDE = "ELEVEN_A_SIDE",
}

export enum StadiumStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  INACTIVE = "INACTIVE",
}

export enum BookingStatus {
  PENDING = "PENDING",
  DEPOSIT_PAID = "DEPOSIT_PAID",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum DepositStatus {
  NOT_REQUIRED = "NOT_REQUIRED",
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}

export enum DepositType {
  DEPOSIT = "DEPOSIT",
  REFUND = "REFUND",
}

export enum DepositTransactionStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
}

export enum PaymentMethod {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  MOMO = "MOMO",
  ZALOPAY = "ZALOPAY",
}

export enum RecurrenceType {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export enum RecurringBookingStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
}

export enum RecurringDepositStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
  REFUNDED = "REFUNDED",
}

export enum SkillLevel {
  ANY = "ANY",
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  PRO = "PRO",
}

export enum CostSharing {
  EQUAL_SPLIT = "EQUAL_SPLIT",
  HOST_PAY = "HOST_PAY",
  OPPONENT_PAY = "OPPONENT_PAY",
  CUSTOM = "CUSTOM",
}

export enum MatchStatus {
  OPEN = "OPEN",
  ACCEPTED = "ACCEPTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  COMPLETED = "COMPLETED",
}

export enum MatchResponseStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export enum TeamMemberRole {
  CAPTAIN = "CAPTAIN",
  MEMBER = "MEMBER",
}

export enum TeamMemberStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  LEFT = "LEFT",
  KICKED = "KICKED",
}

// ========================
// Display labels (Vietnamese)
// ========================

export const FieldTypeLabel: Record<FieldType, string> = {
  [FieldType.FIVE_A_SIDE]: "Sân 5",
  [FieldType.SEVEN_A_SIDE]: "Sân 7",
  [FieldType.ELEVEN_A_SIDE]: "Sân 11",
};

export const BookingStatusLabel: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Chờ đặt cọc",
  [BookingStatus.DEPOSIT_PAID]: "Đã đặt cọc",
  [BookingStatus.CONFIRMED]: "Đã xác nhận",
  [BookingStatus.CANCELLED]: "Đã hủy",
  [BookingStatus.COMPLETED]: "Hoàn thành",
};

export const StadiumStatusLabel: Record<StadiumStatus, string> = {
  [StadiumStatus.PENDING]: "Chờ duyệt",
  [StadiumStatus.APPROVED]: "Đã duyệt",
  [StadiumStatus.REJECTED]: "Bị từ chối",
  [StadiumStatus.INACTIVE]: "Ngừng hoạt động",
};

export const SkillLevelLabel: Record<SkillLevel, string> = {
  [SkillLevel.ANY]: "Bất kỳ",
  [SkillLevel.BEGINNER]: "Mới chơi",
  [SkillLevel.INTERMEDIATE]: "Trung bình",
  [SkillLevel.ADVANCED]: "Nâng cao",
  [SkillLevel.PRO]: "Chuyên nghiệp",
};

export const PaymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Tiền mặt",
  [PaymentMethod.TRANSFER]: "Chuyển khoản",
  [PaymentMethod.MOMO]: "MoMo",
  [PaymentMethod.ZALOPAY]: "ZaloPay",
};

export const DepositStatusLabel: Record<DepositStatus, string> = {
  [DepositStatus.NOT_REQUIRED]: "Không cần cọc",
  [DepositStatus.PENDING]: "Chờ đặt cọc",
  [DepositStatus.PAID]: "Đã cọc",
  [DepositStatus.REFUNDED]: "Đã hoàn cọc",
};

export const DepositTransactionStatusLabel: Record<DepositTransactionStatus, string> = {
  [DepositTransactionStatus.PENDING]: "Chờ xác nhận",
  [DepositTransactionStatus.CONFIRMED]: "Đã xác nhận",
  [DepositTransactionStatus.REJECTED]: "Bị từ chối",
};

export const CostSharingLabel: Record<CostSharing, string> = {
  [CostSharing.EQUAL_SPLIT]: "Chia đều",
  [CostSharing.HOST_PAY]: "Chủ sân trả",
  [CostSharing.OPPONENT_PAY]: "Đối thủ trả",
  [CostSharing.CUSTOM]: "Tùy chỉnh",
};

export const MatchStatusLabel: Record<MatchStatus, string> = {
  [MatchStatus.OPEN]: "Đang tìm đối",
  [MatchStatus.ACCEPTED]: "Đã ghép",
  [MatchStatus.CANCELLED]: "Đã hủy",
  [MatchStatus.EXPIRED]: "Hết hạn",
  [MatchStatus.COMPLETED]: "Hoàn thành",
};

export const MatchResponseStatusLabel: Record<MatchResponseStatus, string> = {
  [MatchResponseStatus.PENDING]: "Chờ phản hồi",
  [MatchResponseStatus.ACCEPTED]: "Đã chấp nhận",
  [MatchResponseStatus.REJECTED]: "Bị từ chối",
  [MatchResponseStatus.WITHDRAWN]: "Đã rút",
};

export const TeamMemberRoleLabel: Record<TeamMemberRole, string> = {
  [TeamMemberRole.CAPTAIN]: "Đội trưởng",
  [TeamMemberRole.MEMBER]: "Thành viên",
};

export const TeamMemberStatusLabel: Record<TeamMemberStatus, string> = {
  [TeamMemberStatus.PENDING]: "Chờ xác nhận",
  [TeamMemberStatus.ACTIVE]: "Hoạt động",
  [TeamMemberStatus.LEFT]: "Đã rời",
  [TeamMemberStatus.KICKED]: "Bị loại",
};

export const RecurringBookingStatusLabel: Record<RecurringBookingStatus, string> = {
  [RecurringBookingStatus.ACTIVE]: "Đang hoạt động",
  [RecurringBookingStatus.CANCELLED]: "Đã hủy",
  [RecurringBookingStatus.COMPLETED]: "Hoàn thành",
  [RecurringBookingStatus.EXPIRED]: "Hết hạn",
};

export const RecurringDepositStatusLabel: Record<RecurringDepositStatus, string> = {
  [RecurringDepositStatus.PENDING]: "Chờ đặt cọc",
  [RecurringDepositStatus.PAID]: "Đã cọc",
  [RecurringDepositStatus.PARTIALLY_REFUNDED]: "Hoàn một phần",
  [RecurringDepositStatus.REFUNDED]: "Đã hoàn cọc",
};

export const RecurrenceTypeLabel: Record<RecurrenceType, string> = {
  [RecurrenceType.WEEKLY]: "Hàng tuần",
  [RecurrenceType.MONTHLY]: "Hàng tháng",
};

export const RoleLabel: Record<Role, string> = {
  [Role.CUSTOMER]: "Khách hàng",
  [Role.OWNER]: "Chủ sân",
  [Role.ADMIN]: "Quản trị",
};

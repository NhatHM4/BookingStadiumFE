import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BookingStatus,
  BookingStatusLabel,
  StadiumStatus,
  StadiumStatusLabel,
  MatchStatus,
  DepositTransactionStatus,
} from "@/types/enums";

type StatusType =
  | BookingStatus
  | StadiumStatus
  | MatchStatus
  | DepositTransactionStatus
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusVariantMap: Record<string, string> = {
  // Booking
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  DEPOSIT_PAID: "bg-blue-100 text-blue-800 border-blue-200",
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",

  // Stadium
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  INACTIVE: "bg-gray-100 text-gray-800 border-gray-200",

  // Match
  OPEN: "bg-blue-100 text-blue-800 border-blue-200",
  ACCEPTED: "bg-green-100 text-green-800 border-green-200",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-200",
  WITHDRAWN: "bg-orange-100 text-orange-800 border-orange-200",

  // Deposit
  PAID: "bg-green-100 text-green-800 border-green-200",
  REFUNDED: "bg-purple-100 text-purple-800 border-purple-200",
  NOT_REQUIRED: "bg-gray-100 text-gray-600 border-gray-200",

  // Team
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  LEFT: "bg-gray-100 text-gray-800 border-gray-200",
  KICKED: "bg-red-100 text-red-800 border-red-200",
};

const statusLabelMap: Record<string, string> = {
  ...BookingStatusLabel,
  ...StadiumStatusLabel,
  OPEN: "Đang mở",
  ACCEPTED: "Đã chấp nhận",
  EXPIRED: "Hết hạn",
  WITHDRAWN: "Đã rút",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn",
  NOT_REQUIRED: "Không cần cọc",
  ACTIVE: "Hoạt động",
  LEFT: "Đã rời",
  KICKED: "Bị đuổi",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariantMap[status] || "bg-gray-100 text-gray-800";
  const label = statusLabelMap[status] || status;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", variant, className)}
    >
      {label}
    </Badge>
  );
}

"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Loader2,
  CalendarDays,
  MapPin,
  User,
  Clock,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBooking, useBookingDeposits } from "@/hooks/use-bookings";
import {
  useConfirmBooking,
  useRejectBooking,
  useCompleteBooking,
  useConfirmDeposit,
  useRejectDeposit,
  useRefundBooking,
} from "@/hooks/use-owner";
import { BookingStatus, DepositTransactionStatus } from "@/types/enums";
import {
  BookingStatusLabel,
  DepositStatusLabel,
  DepositTransactionStatusLabel,
  PaymentMethodLabel,
} from "@/types/enums";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTimeRange,
} from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";

export default function OwnerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const bookingId = parseInt(id, 10);

  const { data: booking, isLoading } = useBooking(bookingId);
  const { data: deposits } = useBookingDeposits(bookingId);

  const confirmBooking = useConfirmBooking();
  const rejectBooking = useRejectBooking();
  const completeBooking = useCompleteBooking();
  const confirmDeposit = useConfirmDeposit();
  const rejectDeposit = useRejectDeposit();
  const refundBooking = useRefundBooking();

  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);

  const handleAction = async (
    action: string,
    fn: () => Promise<unknown>
  ) => {
    try {
      await fn();
      toast.success(
        action === "confirm"
          ? "Đã xác nhận booking!"
          : action === "reject"
          ? "Đã từ chối booking!"
          : action === "complete"
          ? "Đã hoàn thành booking!"
          : action === "refund"
          ? "Đã hoàn tiền!"
          : "Thành công!"
      );
      setConfirmDialog(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Không tìm thấy booking</p>
      </div>
    );
  }

  const isPending = booking.status === BookingStatus.PENDING;
  const isDepositPaid = booking.status === BookingStatus.DEPOSIT_PAID;
  const isConfirmed = booking.status === BookingStatus.CONFIRMED;
  const isCancelled = booking.status === BookingStatus.CANCELLED;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link
        href="/owner/bookings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Booking #{booking.bookingCode || booking.id}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo lúc {formatDateTime(booking.createdAt)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Booking info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Thông tin đặt sân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Sân"
              value={`${booking.stadiumName} - ${booking.fieldName}`}
            />
            <InfoRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Ngày"
              value={formatDate(booking.bookingDate)}
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Giờ"
              value={formatTimeRange(booking.startTime, booking.endTime)}
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Khách hàng"
              value={booking.customerName}
            />
            {booking.note && (
              <InfoRow
                icon={<FileText className="h-4 w-4" />}
                label="Ghi chú"
                value={booking.note}
              />
            )}
            {booking.isMatchRequest && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded">
                ⚽ Yêu cầu ghép trận
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tổng tiền</span>
              <span className="font-semibold text-lg">
                {formatCurrency(booking.totalPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiền cọc</span>
              <span>{formatCurrency(booking.depositAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Còn lại</span>
              <span>{formatCurrency(booking.remainingAmount)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trạng thái cọc</span>
              <span>
                {DepositStatusLabel[booking.depositStatus] ??
                  booking.depositStatus}
              </span>
            </div>
            {booking.cancelledAt && (
              <>
                <hr />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hủy lúc</span>
                  <span>{formatDateTime(booking.cancelledAt)}</span>
                </div>
                {booking.cancelReason && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lý do hủy</span>
                    <span>{booking.cancelReason}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deposit transactions */}
      {deposits && deposits.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Giao dịch cọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deposits.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {d.depositType === "DEPOSIT" ? "Đặt cọc" : "Hoàn tiền"}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {PaymentMethodLabel[d.paymentMethod] ?? d.paymentMethod}
                      {d.transactionCode && ` - Mã: ${d.transactionCode}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(d.createdAt)}
                    </p>
                    {d.note && (
                      <p className="text-xs text-muted-foreground">
                        Ghi chú: {d.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatCurrency(d.amount)}
                    </span>
                    {d.status === DepositTransactionStatus.PENDING && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={confirmDeposit.isPending}
                          onClick={() =>
                            handleAction("deposit-confirm", () =>
                              confirmDeposit.mutateAsync(d.id)
                            )
                          }
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Xác nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={rejectDeposit.isPending}
                          onClick={() =>
                            handleAction("deposit-reject", () =>
                              rejectDeposit.mutateAsync(d.id)
                            )
                          }
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!isCancelled && booking.status !== BookingStatus.COMPLETED && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thao tác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {/* Confirm booking (available when PENDING or DEPOSIT_PAID) */}
              {(isPending || isDepositPaid) && (
                <Dialog
                  open={confirmDialog === "confirm"}
                  onOpenChange={(open) =>
                    setConfirmDialog(open ? "confirm" : null)
                  }
                >
                  <DialogTrigger
                    render={
                      <Button variant="default">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Xác nhận booking
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận booking?</DialogTitle>
                      <DialogDescription>
                        Booking #{booking.bookingCode || booking.id} sẽ được xác nhận.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmDialog(null)}
                      >
                        Hủy
                      </Button>
                      <Button
                        disabled={confirmBooking.isPending}
                        onClick={() =>
                          handleAction("confirm", () =>
                            confirmBooking.mutateAsync(bookingId)
                          )
                        }
                      >
                        {confirmBooking.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Xác nhận
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Complete booking */}
              {isConfirmed && (
                <Dialog
                  open={confirmDialog === "complete"}
                  onOpenChange={(open) =>
                    setConfirmDialog(open ? "complete" : null)
                  }
                >
                  <DialogTrigger
                    render={
                      <Button variant="default">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Hoàn thành
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hoàn thành booking?</DialogTitle>
                      <DialogDescription>
                        Đánh dấu booking này là đã hoàn thành.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmDialog(null)}
                      >
                        Hủy
                      </Button>
                      <Button
                        disabled={completeBooking.isPending}
                        onClick={() =>
                          handleAction("complete", () =>
                            completeBooking.mutateAsync(bookingId)
                          )
                        }
                      >
                        {completeBooking.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Hoàn thành
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Reject booking */}
              {isPending && (
                <Dialog
                  open={confirmDialog === "reject"}
                  onOpenChange={(open) =>
                    setConfirmDialog(open ? "reject" : null)
                  }
                >
                  <DialogTrigger
                    render={
                      <Button variant="destructive">
                        <Ban className="h-4 w-4 mr-2" />
                        Từ chối
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Từ chối booking?</DialogTitle>
                      <DialogDescription>
                        Booking sẽ bị từ chối và không thể hoàn tác.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmDialog(null)}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={rejectBooking.isPending}
                        onClick={() =>
                          handleAction("reject", () =>
                            rejectBooking.mutateAsync(bookingId)
                          )
                        }
                      >
                        {rejectBooking.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Từ chối
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Refund */}
              {(isDepositPaid || isConfirmed) && (
                <Dialog
                  open={confirmDialog === "refund"}
                  onOpenChange={(open) =>
                    setConfirmDialog(open ? "refund" : null)
                  }
                >
                  <DialogTrigger
                    render={
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Hoàn tiền
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hoàn tiền cho booking?</DialogTitle>
                      <DialogDescription>
                        Sẽ hoàn tiền cọc theo chính sách sân.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmDialog(null)}
                      >
                        Hủy
                      </Button>
                      <Button
                        disabled={refundBooking.isPending}
                        onClick={() =>
                          handleAction("refund", () =>
                            refundBooking.mutateAsync({ bookingId })
                          )
                        }
                      >
                        {refundBooking.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Hoàn tiền
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <span className="text-muted-foreground min-w-[80px]">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

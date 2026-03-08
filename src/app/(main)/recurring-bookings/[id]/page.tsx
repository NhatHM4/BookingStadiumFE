"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Repeat,
  CalendarDays,
  Clock,
  MapPin,
  Banknote,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useRecurringBooking,
  useCancelRecurringBooking,
  useCancelSingleSession,
} from "@/hooks/use-recurring";
import {
  RecurringBookingStatus,
  RecurringBookingStatusLabel,
  RecurringDepositStatusLabel,
  RecurrenceTypeLabel,
  BookingStatus,
  BookingStatusLabel,
} from "@/types/enums";
import { formatDate, formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import type { BookingResponse } from "@/types/index";

function RecurringStatusBadge({ status }: { status: RecurringBookingStatus }) {
  const colorMap: Record<RecurringBookingStatus, string> = {
    [RecurringBookingStatus.ACTIVE]:
      "bg-green-100 text-green-800 border-green-200",
    [RecurringBookingStatus.COMPLETED]:
      "bg-emerald-100 text-emerald-800 border-emerald-200",
    [RecurringBookingStatus.CANCELLED]:
      "bg-red-100 text-red-800 border-red-200",
    [RecurringBookingStatus.EXPIRED]:
      "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Badge variant="outline" className={colorMap[status]}>
      {RecurringBookingStatusLabel[status]}
    </Badge>
  );
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const colorMap: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [BookingStatus.DEPOSIT_PAID]: "bg-blue-100 text-blue-800 border-blue-200",
    [BookingStatus.CONFIRMED]: "bg-green-100 text-green-800 border-green-200",
    [BookingStatus.COMPLETED]:
      "bg-emerald-100 text-emerald-800 border-emerald-200",
    [BookingStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Badge variant="outline" className={colorMap[status]}>
      {BookingStatusLabel[status]}
    </Badge>
  );
}

export default function RecurringBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const recurringId = parseInt(id, 10);

  const { data: recurring, isLoading, error } = useRecurringBooking(recurringId);
  const cancelRecurring = useCancelRecurringBooking();
  const cancelSession = useCancelSingleSession();

  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
  const [cancelSessionId, setCancelSessionId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="Đang tải chi tiết..." />
      </div>
    );
  }

  if (error || !recurring) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy</h2>
        <Link href="/recurring-bookings">
          <Button>Quay lại</Button>
        </Link>
      </div>
    );
  }

  const handleCancelAll = async () => {
    try {
      await cancelRecurring.mutateAsync(recurringId);
      toast.success("Đã hủy tất cả lịch định kỳ");
      setShowCancelAllDialog(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Hủy thất bại");
    }
  };

  const handleCancelSession = async (bookingId: number) => {
    try {
      await cancelSession.mutateAsync({ recurringId, bookingId });
      toast.success("Đã hủy buổi đặt sân");
      setCancelSessionId(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Hủy buổi thất bại");
    }
  };

  const canCancel = recurring.status === RecurringBookingStatus.ACTIVE;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/recurring-bookings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Đặt sân định kỳ
            </h1>
            <RecurringStatusBadge status={recurring.status} />
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {recurring.recurringCode}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin lịch định kỳ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sân</p>
                  <p className="font-medium">{recurring.stadiumName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sân con</p>
                  <p className="font-medium">{recurring.fieldName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại lặp</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Repeat className="h-4 w-4" />
                    {RecurrenceTypeLabel[recurring.recurrenceType]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khung giờ</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {recurring.timeSlotRange}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Từ ngày</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(recurring.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đến ngày</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(recurring.endDate)}
                  </p>
                </div>
              </div>

              {recurring.note && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                    <p className="text-sm">{recurring.note}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sessions list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Danh sách buổi ({recurring.bookings?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recurring.bookings?.map((booking: BookingResponse) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-muted-foreground">
                            {booking.bookingCode}
                          </span>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(booking.bookingDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatPrice(booking.totalPrice)}
                      </span>
                      {booking.status === BookingStatus.PENDING ||
                      booking.status === BookingStatus.DEPOSIT_PAID ||
                      booking.status === BookingStatus.CONFIRMED ? (
                        <Dialog
                          open={cancelSessionId === booking.id}
                          onOpenChange={(open) =>
                            setCancelSessionId(open ? booking.id : null)
                          }
                        >
                          <DialogTrigger
                            render={
                              <Button variant="ghost" size="sm">
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            }
                          />
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Hủy buổi đặt sân</DialogTitle>
                              <DialogDescription>
                                Bạn có chắc muốn hủy buổi{" "}
                                {formatDate(booking.bookingDate)}?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setCancelSessionId(null)}
                              >
                                Không
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleCancelSession(booking.id)}
                                disabled={cancelSession.isPending}
                              >
                                {cancelSession.isPending && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Hủy buổi
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chi phí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giá gốc/buổi</span>
                <span>{formatPrice(recurring.originalPricePerSession)}</span>
              </div>
              {recurring.discountPercent > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giảm giá</span>
                  <span className="text-green-600">
                    -{recurring.discountPercent}%
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giá sau giảm/buổi</span>
                <span className="font-medium">
                  {formatPrice(recurring.discountedPricePerSession)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng buổi</span>
                <span>{recurring.totalSessions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hoàn thành</span>
                <span className="text-green-600">
                  {recurring.completedSessions}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đã hủy</span>
                <span className="text-red-600">
                  {recurring.cancelledSessions}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {formatPrice(recurring.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đặt cọc</span>
                <span>{formatPrice(recurring.totalDeposit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trạng thái cọc</span>
                <Badge variant="outline" className="text-xs">
                  {RecurringDepositStatusLabel[recurring.depositStatus]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canCancel && (
            <Card>
              <CardContent className="pt-6">
                <Dialog
                  open={showCancelAllDialog}
                  onOpenChange={setShowCancelAllDialog}
                >
                  <DialogTrigger
                    render={
                      <Button variant="destructive" className="w-full">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Hủy toàn bộ
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hủy toàn bộ lịch định kỳ</DialogTitle>
                      <DialogDescription>
                        Tất cả các buổi chưa hoàn thành sẽ bị hủy. Hành động
                        này không thể hoàn tác.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowCancelAllDialog(false)}
                      >
                        Không
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelAll}
                        disabled={cancelRecurring.isPending}
                      >
                        {cancelRecurring.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Xác nhận hủy
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Repeat,
  CalendarDays,
  Clock,
  CheckCircle,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  useOwnerRecurringBookings,
  useConfirmRecurringBooking,
} from "@/hooks/use-recurring";
import {
  RecurringBookingStatus,
  RecurringBookingStatusLabel,
  RecurringDepositStatusLabel,
  RecurrenceTypeLabel,
} from "@/types/enums";
import { formatDate, formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { toast } from "sonner";
import type { RecurringBookingResponse } from "@/types/index";

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

function RecurringOwnerCard({
  booking,
}: {
  booking: RecurringBookingResponse;
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const confirmRecurring = useConfirmRecurringBooking();

  const canConfirm = booking.status === RecurringBookingStatus.ACTIVE;

  const handleConfirm = async () => {
    try {
      await confirmRecurring.mutateAsync(booking.id);
      toast.success("Đã xác nhận đặt sân định kỳ");
      setShowConfirmDialog(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground">
                {booking.recurringCode}
              </span>
              <RecurringStatusBadge status={booking.status} />
            </div>
            <h3 className="font-semibold truncate">{booking.fieldName}</h3>
            <p className="text-sm text-muted-foreground">
              {booking.stadiumName}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span>{booking.customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Repeat className="h-3.5 w-3.5" />
            <span>{RecurrenceTypeLabel[booking.recurrenceType]}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{booking.timeSlotRange}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Tổng: </span>
            <span className="font-semibold">
              {formatPrice(booking.totalPrice)}
            </span>
            <span className="text-muted-foreground ml-3">Cọc: </span>
            <span className="font-medium">
              {formatPrice(booking.totalDeposit)}
            </span>
          </div>

          {canConfirm && (
            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogTrigger
                render={
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Xác nhận
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận lịch đặt định kỳ</DialogTitle>
                  <DialogDescription>
                    Xác nhận đặt sân định kỳ &quot;{booking.recurringCode}&quot;
                    của {booking.customerName}?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={confirmRecurring.isPending}
                  >
                    {confirmRecurring.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Xác nhận
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Sessions: {booking.completedSessions}/{booking.totalSessions} hoàn
          thành • {booking.cancelledSessions} hủy
        </div>
      </CardContent>
    </Card>
  );
}

export default function OwnerRecurringPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useOwnerRecurringBookings(page, 10);

  const bookings = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Đặt sân định kỳ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý các lịch đặt sân lặp lại
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Đang tải danh sách..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Chưa có đặt sân định kỳ"
          description="Chưa có khách hàng nào đặt sân định kỳ."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {totalElements} lịch đặt sân
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <RecurringOwnerCard key={booking.id} booking={booking} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

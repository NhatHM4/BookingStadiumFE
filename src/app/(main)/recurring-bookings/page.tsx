"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Repeat,
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyRecurringBookings } from "@/hooks/use-recurring";
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
import type { RecurringBookingResponse } from "@/types/index";

const statusTabs: { value: string; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: RecurringBookingStatus.ACTIVE, label: "Hoạt động" },
  { value: RecurringBookingStatus.COMPLETED, label: "Hoàn thành" },
  { value: RecurringBookingStatus.CANCELLED, label: "Đã hủy" },
  { value: RecurringBookingStatus.EXPIRED, label: "Hết hạn" },
];

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

function RecurringCard({
  booking,
}: {
  booking: RecurringBookingResponse;
}) {
  return (
    <Link href={`/recurring-bookings/${booking.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-muted-foreground">
                  {booking.recurringCode}
                </span>
                <RecurringStatusBadge status={booking.status} />
              </div>
              <h3 className="font-semibold truncate">{booking.stadiumName}</h3>
              <p className="text-sm text-muted-foreground">
                {booking.fieldName}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Repeat className="h-3.5 w-3.5" />
              <span>{RecurrenceTypeLabel[booking.recurrenceType]}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                {formatDate(booking.startDate)} -{" "}
                {formatDate(booking.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{booking.timeSlotRange}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Tổng: </span>
              <span className="font-semibold">
                {formatPrice(booking.totalPrice)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Sessions: </span>
              <span className="font-medium">
                {booking.completedSessions}/{booking.totalSessions}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MyRecurringBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  const status =
    statusFilter === "ALL"
      ? undefined
      : (statusFilter as RecurringBookingStatus);
  const { data, isLoading } = useMyRecurringBookings(status, page, 10);

  const bookings = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Đặt sân định kỳ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các lịch đặt sân lặp lại
          </p>
        </div>
        <Link href="/recurring-bookings/new">
          <Button>
            <Repeat className="h-4 w-4 mr-2" />
            Đặt định kỳ
          </Button>
        </Link>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v ?? "ALL");
          setPage(0);
        }}
        className="mb-6"
      >
        <TabsList className="flex-wrap h-auto gap-1">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <LoadingSpinner text="Đang tải danh sách..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Chưa có đặt sân định kỳ"
          description={
            statusFilter === "ALL"
              ? "Bạn chưa có lịch đặt sân định kỳ nào."
              : `Không có lịch nào với trạng thái "${
                  statusTabs.find((t) => t.value === statusFilter)?.label
                }"`
          }
          action={
            <Link href="/recurring-bookings/new">
              <Button>Đặt định kỳ</Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {totalElements} lịch đặt sân
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <RecurringCard key={booking.id} booking={booking} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

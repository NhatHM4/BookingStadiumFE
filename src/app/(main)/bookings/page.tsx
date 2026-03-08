"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyBookings } from "@/hooks/use-bookings";
import { BookingStatus, BookingStatusLabel, DepositStatusLabel } from "@/types/enums";
import { formatDate, formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import type { BookingResponse } from "@/types/index";

const statusTabs: { value: string; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: BookingStatus.PENDING, label: "Chờ cọc" },
  { value: BookingStatus.DEPOSIT_PAID, label: "Đã cọc" },
  { value: BookingStatus.CONFIRMED, label: "Xác nhận" },
  { value: BookingStatus.COMPLETED, label: "Hoàn thành" },
  { value: BookingStatus.CANCELLED, label: "Đã hủy" },
];

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const colorMap: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [BookingStatus.DEPOSIT_PAID]: "bg-blue-100 text-blue-800 border-blue-200",
    [BookingStatus.CONFIRMED]: "bg-green-100 text-green-800 border-green-200",
    [BookingStatus.COMPLETED]: "bg-emerald-100 text-emerald-800 border-emerald-200",
    [BookingStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Badge variant="outline" className={colorMap[status]}>
      {BookingStatusLabel[status]}
    </Badge>
  );
}

function BookingCard({ booking }: { booking: BookingResponse }) {
  return (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-muted-foreground">
                  {booking.bookingCode}
                </span>
                <BookingStatusBadge status={booking.status} />
              </div>
              <h3 className="font-semibold truncate">{booking.stadiumName}</h3>
              <p className="text-sm text-muted-foreground">{booking.fieldName}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatDate(booking.bookingDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Tổng: </span>
              <span className="font-semibold">{formatPrice(booking.totalPrice)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cọc: </span>
              <span className="font-medium text-primary">
                {formatPrice(booking.depositAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MyBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  const status = statusFilter === "ALL" ? undefined : (statusFilter as BookingStatus);
  const { data, isLoading } = useMyBookings(status, page, 10);

  const bookings = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử đặt sân</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tất cả đơn đặt sân của bạn
          </p>
        </div>
        <Link href="/stadiums">
          <Button>
            <MapPin className="h-4 w-4 mr-2" />
            Đặt sân mới
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
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

      {/* Bookings list */}
      {isLoading ? (
        <LoadingSpinner text="Đang tải đơn đặt sân..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Chưa có đơn đặt sân"
          description={
            statusFilter === "ALL"
              ? "Bạn chưa đặt sân nào. Hãy tìm và đặt sân ngay!"
              : `Không có đơn nào với trạng thái "${statusTabs.find((t) => t.value === statusFilter)?.label}"`
          }
          action={
            <Link href="/stadiums">
              <Button>Đặt sân ngay</Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {totalElements} đơn đặt sân
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
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

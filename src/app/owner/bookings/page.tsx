"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useOwnerBookings, useOwnerStadiums } from "@/hooks/use-owner";
import { BookingStatusLabel } from "@/types/enums";
import { formatCurrency, formatDate, formatTimeRange } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";

export default function OwnerBookingsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchStadium, setSearchStadium] = useState("");

  const { data: stadiums } = useOwnerStadiums();
  const { data, isLoading } = useOwnerBookings(page, 10);

  const bookings = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Client-side filters
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (dateFilter && b.bookingDate !== dateFilter) return false;
    if (
      searchStadium &&
      !b.stadiumName?.toLowerCase().includes(searchStadium.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đặt sân</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tất cả booking trên các sân của bạn
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sân..."
            value={searchStadium}
            onChange={(e) => setSearchStadium(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v ?? "");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              {Object.entries(BookingStatusLabel).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          placeholder="Lọc theo ngày"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" text="Đang tải..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Chưa có booking"
          description="Chưa có đặt sân nào"
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Mã</th>
                  <th className="py-3 px-4 font-medium">Sân</th>
                  <th className="py-3 px-4 font-medium">Khách hàng</th>
                  <th className="py-3 px-4 font-medium">Ngày</th>
                  <th className="py-3 px-4 font-medium">Giờ</th>
                  <th className="py-3 px-4 font-medium">Tổng tiền</th>
                  <th className="py-3 px-4 font-medium">Trạng thái</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-xs">
                      #{booking.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{booking.stadiumName}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.fieldName}
                      </div>
                    </td>
                    <td className="py-3 px-4">{booking.customerName}</td>
                    <td className="py-3 px-4">
                      {formatDate(booking.bookingDate)}
                    </td>
                    <td className="py-3 px-4">
                      {formatTimeRange(booking.startTime, booking.endTime)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(booking.totalPrice)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/owner/bookings/${booking.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{booking.stadiumName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.fieldName} - {booking.customerName}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatDate(booking.bookingDate)} |{" "}
                      {formatTimeRange(booking.startTime, booking.endTime)}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Link href={`/owner/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
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

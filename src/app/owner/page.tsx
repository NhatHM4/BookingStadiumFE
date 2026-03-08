"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOwnerStadiums, useOwnerBookings } from "@/hooks/use-owner";
import { BookingStatusLabel, StadiumStatusLabel } from "@/types/enums";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatDate, formatPrice } from "@/lib/utils";

export default function OwnerDashboardPage() {
  const { data: stadiums, isLoading: loadingStadiums } = useOwnerStadiums();
  const { data: recentBookings, isLoading: loadingBookings } = useOwnerBookings(0, 5);

  if (loadingStadiums || loadingBookings) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Đang tải dashboard..." />
      </div>
    );
  }

  const totalStadiums = stadiums?.length || 0;
  const approvedStadiums = stadiums?.filter((s) => s.status === "APPROVED").length || 0;
  const totalFields = stadiums?.reduce((sum, s) => sum + s.fieldCount, 0) || 0;
  const avgRating =
    totalStadiums > 0
      ? (stadiums?.reduce((sum, s) => sum + s.avgRating, 0) || 0) / totalStadiums
      : 0;

  const bookings = recentBookings?.content || [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý sân bóng của bạn
          </p>
        </div>
        <Link href="/owner/stadiums/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sân
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Tổng sân"
          value={totalStadiums}
          sub={`${approvedStadiums} đang hoạt động`}
        />
        <StatCard
          icon={TrendingUp}
          label="Tổng sân con"
          value={totalFields}
          sub="Tất cả loại sân"
        />
        <StatCard
          icon={CalendarDays}
          label="Đơn gần đây"
          value={recentBookings?.totalElements || 0}
          sub="Tổng cộng"
        />
        <StatCard
          icon={Star}
          label="Đánh giá TB"
          value={avgRating.toFixed(1)}
          sub={`${stadiums?.reduce((s, st) => s + st.reviewCount, 0) || 0} đánh giá`}
        />
      </div>

      {/* Quick actions + Recent bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Stadiums */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Sân của tôi</CardTitle>
            <Link href="/owner/stadiums">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stadiums && stadiums.length > 0 ? (
              <div className="space-y-3">
                {stadiums.slice(0, 5).map((stadium) => (
                  <Link
                    key={stadium.id}
                    href={`/owner/stadiums/${stadium.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {stadium.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stadium.fieldCount} sân · ⭐ {(stadium.avgRating ?? 0).toFixed(1)}
                      </p>
                    </div>
                    <Badge
                      variant={stadium.status === "APPROVED" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {StadiumStatusLabel[stadium.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Bạn chưa có sân nào
                </p>
                <Link href="/owner/stadiums/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Tạo sân đầu tiên
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Đơn đặt gần đây</CardTitle>
            <Link href="/owner/bookings">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/owner/bookings/${b.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {b.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.fieldName} · {formatDate(b.bookingDate)} · {b.startTime}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {formatPrice(b.totalPrice)}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {BookingStatusLabel[b.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Chưa có đơn đặt sân nào
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{sub}</p>
      </CardContent>
    </Card>
  );
}

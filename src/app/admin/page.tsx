"use client";

import {
  Users,
  Building2,
  CalendarDays,
  Trophy,
  Swords,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/use-admin";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  color?: string;
}

function StatCard({ title, value, icon: Icon, description, color = "text-primary" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Đang tải dashboard..." />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thống kê tổng hợp toàn bộ hệ thống
        </p>
      </div>

      {/* User stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Người dùng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Tổng users"
            value={dashboard.totalUsers}
            icon={Users}
          />
          <StatCard
            title="Khách hàng"
            value={dashboard.totalCustomers}
            icon={Users}
            color="text-blue-600"
          />
          <StatCard
            title="Chủ sân"
            value={dashboard.totalOwners}
            icon={Users}
            color="text-purple-600"
          />
        </div>
      </div>

      {/* Stadium stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Sân bóng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Tổng sân"
            value={dashboard.totalStadiums}
            icon={Building2}
          />
          <StatCard
            title="Đã duyệt"
            value={dashboard.approvedStadiums}
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard
            title="Chờ duyệt"
            value={dashboard.pendingStadiums}
            icon={Clock}
            color="text-yellow-600"
          />
        </div>
      </div>

      {/* Booking stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Đặt sân</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Tổng đơn đặt"
            value={dashboard.totalBookings}
            icon={CalendarDays}
          />
          <StatCard
            title="Hoàn thành"
            value={dashboard.completedBookings}
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard
            title="Đã hủy"
            value={dashboard.cancelledBookings}
            icon={XCircle}
            color="text-red-600"
          />
        </div>
      </div>

      {/* Other stats */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Hoạt động khác</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Đội bóng"
            value={dashboard.totalTeams}
            icon={Trophy}
          />
          <StatCard
            title="Trận ráp kèo"
            value={dashboard.totalMatchRequests}
            icon={Swords}
            color="text-orange-600"
          />
          <StatCard
            title="Đánh giá"
            value={dashboard.totalReviews}
            icon={Star}
            color="text-yellow-600"
          />
          <StatCard
            title="Điểm TB"
            value={(dashboard.averageRating ?? 0).toFixed(1)}
            icon={TrendingUp}
            color="text-emerald-600"
          />
        </div>
      </div>

      {/* Recent Bookings Chart (simple table) */}
      {dashboard.recentBookings && Object.keys(dashboard.recentBookings).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đặt sân gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(dashboard.recentBookings)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, count]) => (
                  <div
                    key={date}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {date}
                    </span>
                    <div className="flex items-center gap-3">
                      <div
                        className="bg-primary/20 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (count /
                              Math.max(
                                ...Object.values(dashboard.recentBookings)
                              )) *
                              200,
                            200
                          )}px`,
                        }}
                      />
                      <span className="text-sm font-medium w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

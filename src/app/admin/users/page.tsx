"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Loader2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminUsers, useToggleUserActive } from "@/hooks/use-admin";
import { Role, RoleLabel } from "@/types/enums";
import { formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { toast } from "sonner";
import type { UserResponse } from "@/types/index";

function RoleBadge({ role }: { role: Role }) {
  const colorMap: Record<Role, string> = {
    [Role.CUSTOMER]: "bg-blue-100 text-blue-800 border-blue-200",
    [Role.OWNER]: "bg-purple-100 text-purple-800 border-purple-200",
    [Role.ADMIN]: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Badge variant="outline" className={colorMap[role]}>
      {RoleLabel[role]}
    </Badge>
  );
}

function UserCard({ user, onToggle }: { user: UserResponse; onToggle: (id: number) => void }) {
  const [showDialog, setShowDialog] = useState(false);
  const toggleActive = useToggleUserActive();

  const initials = user.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const handleToggle = async () => {
    try {
      await toggleActive.mutateAsync(user.id);
      toast.success(
        user.isActive ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản"
      );
      setShowDialog(false);
      onToggle(user.id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{user.fullName}</h3>
              <RoleBadge role={user.role} />
              {!user.isActive && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Bị khóa
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Tham gia: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger
              render={
                <Button
                  variant={user.isActive ? "outline" : "default"}
                  size="sm"
                >
                  {user.isActive ? (
                    <>
                      <ShieldOff className="h-4 w-4 mr-1" />
                      Khóa
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-1" />
                      Mở khóa
                    </>
                  )}
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                </DialogTitle>
                <DialogDescription>
                  {user.isActive
                    ? `Bạn có chắc muốn khóa tài khoản "${user.fullName}"? Người dùng sẽ không thể đăng nhập.`
                    : `Bạn có chắc muốn mở khóa tài khoản "${user.fullName}"?`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Hủy
                </Button>
                <Button
                  variant={user.isActive ? "destructive" : "default"}
                  onClick={handleToggle}
                  disabled={toggleActive.isPending}
                >
                  {toggleActive.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {user.isActive ? "Khóa" : "Mở khóa"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);

  const role = roleFilter === "ALL" ? undefined : (roleFilter as Role);
  const { data, isLoading, refetch } = useAdminUsers(
    role,
    searchQuery || undefined,
    page,
    10
  );

  const users = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem và quản lý tất cả người dùng trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v ?? "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value={Role.CUSTOMER}>{RoleLabel[Role.CUSTOMER]}</SelectItem>
            <SelectItem value={Role.OWNER}>{RoleLabel[Role.OWNER]}</SelectItem>
            <SelectItem value={Role.ADMIN}>{RoleLabel[Role.ADMIN]}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-1" />
          Tìm
        </Button>
      </div>

      {/* Users list */}
      {isLoading ? (
        <LoadingSpinner text="Đang tải danh sách..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy người dùng"
          description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {totalElements} người dùng
          </p>
          <div className="grid grid-cols-1 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onToggle={() => refetch()}
              />
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

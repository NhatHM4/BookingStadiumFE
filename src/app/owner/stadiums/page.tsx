"use client";

import Link from "next/link";
import {
  Plus,
  Settings,
  Layers,
  Clock,
  Shield,
  Trash2,
  Star,
  Loader2,
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
import { useOwnerStadiums, useDeleteStadium } from "@/hooks/use-owner";
import { StadiumStatusLabel } from "@/types/enums";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { useState } from "react";
import type { StadiumResponse } from "@/types/index";

export default function OwnerStadiumsPage() {
  const { data: stadiums, isLoading } = useOwnerStadiums();

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sân của tôi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tất cả sân bóng
          </p>
        </div>
        <Link href="/owner/stadiums/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sân mới
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Đang tải..." />
      ) : !stadiums || stadiums.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Chưa có sân nào"
          description="Tạo sân đầu tiên để bắt đầu nhận đơn đặt"
          action={
            <Link href="/owner/stadiums/new">
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Tạo sân
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stadiums.map((stadium) => (
            <StadiumManageCard key={stadium.id} stadium={stadium} />
          ))}
        </div>
      )}
    </div>
  );
}

function StadiumManageCard({ stadium }: { stadium: StadiumResponse }) {
  const deleteStadium = useDeleteStadium();
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteStadium.mutateAsync(stadium.id);
      toast.success("Đã xóa sân");
      setShowDelete(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const statusColor: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    INACTIVE: "bg-gray-100 text-gray-800",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg truncate">{stadium.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {stadium.address}
            </p>
          </div>
          <Badge
            variant="outline"
            className={statusColor[stadium.status] || ""}
          >
            {StadiumStatusLabel[stadium.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>{stadium.fieldCount} sân con</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {(stadium.avgRating ?? 0).toFixed(1)} ({stadium.reviewCount})
          </span>
          {stadium.openTime && (
            <>
              <span>·</span>
              <span>
                {stadium.openTime} - {stadium.closeTime}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/owner/stadiums/${stadium.id}`}>
            <Button size="sm" variant="outline">
              <Settings className="h-3.5 w-3.5 mr-1" />
              Sửa
            </Button>
          </Link>
          <Link href={`/owner/stadiums/${stadium.id}/fields`}>
            <Button size="sm" variant="outline">
              <Layers className="h-3.5 w-3.5 mr-1" />
              Sân con
            </Button>
          </Link>
          <Link href={`/owner/stadiums/${stadium.id}/time-slots`}>
            <Button size="sm" variant="outline">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Khung giờ
            </Button>
          </Link>
          <Link href={`/owner/stadiums/${stadium.id}/deposit-policy`}>
            <Button size="sm" variant="outline">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Cọc
            </Button>
          </Link>
          <Dialog open={showDelete} onOpenChange={setShowDelete}>
            <DialogTrigger
              render={
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xóa sân &quot;{stadium.name}&quot;?</DialogTitle>
                <DialogDescription>
                  Hành động này sẽ xóa sân và tất cả dữ liệu liên quan. Không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDelete(false)}>
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteStadium.isPending}
                >
                  {deleteStadium.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Xóa"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

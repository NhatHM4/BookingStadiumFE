"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Star,
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
import { usePendingStadiums, useApproveStadium, useRejectStadium } from "@/hooks/use-admin";
import { formatDate, getImageUrl } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { toast } from "sonner";
import type { StadiumResponse } from "@/types/index";

function StadiumApprovalCard({ stadium }: { stadium: StadiumResponse }) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const approveStadium = useApproveStadium();
  const rejectStadium = useRejectStadium();

  const handleApprove = async () => {
    try {
      await approveStadium.mutateAsync(stadium.id);
      toast.success("Đã duyệt sân thành công");
      setShowApproveDialog(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Duyệt sân thất bại");
    }
  };

  const handleReject = async () => {
    try {
      await rejectStadium.mutateAsync(stadium.id);
      toast.success("Đã từ chối sân");
      setShowRejectDialog(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Từ chối thất bại");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Stadium image */}
          {stadium.imageUrl ? (
            <img
              src={getImageUrl(stadium.imageUrl) || undefined}
              alt={stadium.name}
              className="w-full sm:w-40 h-28 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full sm:w-40 h-28 bg-muted rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{stadium.name}</h3>
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-200"
              >
                <Clock className="h-3 w-3 mr-1" />
                Chờ duyệt
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{stadium.address}</span>
              </div>
              {(stadium.district || stadium.city) && (
                <p className="pl-5.5">
                  {[stadium.district, stadium.city].filter(Boolean).join(", ")}
                </p>
              )}
              <p>
                Chủ sân: <span className="font-medium">{stadium.ownerName}</span>
              </p>
              <p>
                Sân con: <span className="font-medium">{stadium.fieldCount}</span>
              </p>
            </div>

            {stadium.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {stadium.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Dialog
                open={showApproveDialog}
                onOpenChange={setShowApproveDialog}
              >
                <DialogTrigger
                  render={
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Duyệt
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Duyệt sân</DialogTitle>
                    <DialogDescription>
                      Xác nhận duyệt sân &quot;{stadium.name}&quot;? Sân sẽ
                      hiển thị trên hệ thống.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowApproveDialog(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={approveStadium.isPending}
                    >
                      {approveStadium.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Xác nhận duyệt
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={showRejectDialog}
                onOpenChange={setShowRejectDialog}
              >
                <DialogTrigger
                  render={
                    <Button variant="destructive" size="sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Từ chối
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Từ chối sân</DialogTitle>
                    <DialogDescription>
                      Xác nhận từ chối sân &quot;{stadium.name}&quot;?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectDialog(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={rejectStadium.isPending}
                    >
                      {rejectStadium.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Xác nhận từ chối
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminStadiumsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = usePendingStadiums(page, 10);

  const stadiums = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Duyệt sân bóng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem và phê duyệt các sân bóng chờ duyệt
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Đang tải danh sách..." />
      ) : stadiums.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Không có sân chờ duyệt"
          description="Tất cả sân đã được xử lý."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {totalElements} sân chờ duyệt
          </p>
          <div className="grid grid-cols-1 gap-4">
            {stadiums.map((stadium) => (
              <StadiumApprovalCard key={stadium.id} stadium={stadium} />
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

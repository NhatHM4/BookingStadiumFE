"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Trash2,
  Loader2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMyReviews, useDeleteReview } from "@/hooks/use-bookings";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import type { ReviewResponse } from "@/types/index";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewResponse }) {
  const deleteReview = useDeleteReview();
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteReview.mutateAsync(review.id);
      toast.success("Đã xóa đánh giá");
      setShowDelete(false);
    } catch {
      toast.error("Xóa đánh giá thất bại");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/stadiums/${review.stadiumId}`}
                className="font-semibold text-primary hover:underline truncate"
              >
                {review.stadiumName}
              </Link>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <span className="font-mono">{review.bookingCode}</span>
              <span>·</span>
              <span>{formatDateTime(review.createdAt)}</span>
            </div>
            <StarDisplay rating={review.rating} />
            {review.comment && (
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                {review.comment}
              </p>
            )}
          </div>

          <Dialog open={showDelete} onOpenChange={setShowDelete}>
            <DialogTrigger render={
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xóa đánh giá</DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn xóa đánh giá này? Hành động không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDelete(false)}>
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteReview.isPending}
                >
                  {deleteReview.isPending ? (
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

export default function MyReviewsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useMyReviews(page, 10);

  const reviews = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Đánh giá của tôi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý các đánh giá bạn đã viết
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Đang tải đánh giá..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Chưa có đánh giá"
          description="Bạn chưa đánh giá sân nào. Sau khi hoàn thành đặt sân, bạn có thể đánh giá."
          action={
            <Link href="/bookings">
              <Button variant="outline">Xem đơn đặt sân</Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {totalElements} đánh giá
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
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

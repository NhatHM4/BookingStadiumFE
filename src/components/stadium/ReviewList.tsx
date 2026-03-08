"use client";

import { Star, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStadiumReviews } from "@/hooks/use-stadiums";
import { Pagination } from "@/components/shared/Pagination";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime, getInitials } from "@/lib/utils";
import { useState } from "react";

interface ReviewListProps {
  stadiumId: number;
}

function StarRating({ rating }: { rating: number }) {
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

function RatingSummary({
  averageRating,
  totalReviews,
}: {
  averageRating: number;
  totalReviews: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
        <StarRating rating={Math.round(averageRating)} />
        <div className="text-sm text-muted-foreground mt-1">
          {totalReviews} đánh giá
        </div>
      </div>
    </div>
  );
}

export function ReviewList({ stadiumId }: ReviewListProps) {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useStadiumReviews(stadiumId, page, 5);

  if (isLoading) {
    return <LoadingSpinner text="Đang tải đánh giá..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive text-center">
            Không thể tải đánh giá
          </p>
        </CardContent>
      </Card>
    );
  }

  const reviews = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5" />
          Đánh giá ({totalElements})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Chưa có đánh giá"
            description="Hãy là người đầu tiên đánh giá sân này"
          />
        ) : (
          <>
            {reviews.map((review, index) => (
              <div key={review.id}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {review.customerName
                        ? getInitials(review.customerName)
                        : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">
                        {review.customerName || "Người dùng ẩn danh"}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDateTime(review.createdAt!)}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

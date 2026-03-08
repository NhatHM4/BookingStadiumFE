"use client";

import { useState, useCallback } from "react";
import { useStadiums } from "@/hooks/use-stadiums";
import { StadiumCard, StadiumCardSkeleton } from "@/components/stadium/StadiumCard";
import { StadiumFilter } from "@/components/stadium/StadiumFilter";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { MapPin } from "lucide-react";
import type { StadiumFilters } from "@/types/index";

export default function StadiumListPage() {
  const [filters, setFilters] = useState<StadiumFilters>({
    page: 0,
    size: 12,
    sort: "createdAt,desc",
  });

  const { data, isLoading, isError } = useStadiums(filters);

  const handleFilterChange = useCallback(
    (newFilters: Record<string, string>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 0, // Reset page khi thay đổi filter
      }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tìm sân bóng đá</h1>
        <p className="mt-1 text-muted-foreground">
          Tìm kiếm và đặt sân bóng đá gần bạn
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <StadiumFilter
          onFilterChange={handleFilterChange}
          initialFilters={filters as Record<string, string>}
        />
      </div>

      {/* Results count */}
      {data && !isLoading && (
        <p className="mb-4 text-sm text-muted-foreground">
          Tìm thấy {data.totalElements} sân bóng
        </p>
      )}

      {/* Stadium grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <StadiumCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Có lỗi xảy ra"
          description="Không thể tải danh sách sân. Vui lòng thử lại."
        />
      ) : data && data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.content.map((stadium) => (
              <StadiumCard key={stadium.id} stadium={stadium} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={data.number}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={MapPin}
          title="Không tìm thấy sân nào"
          description="Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác."
        />
      )}
    </div>
  );
}

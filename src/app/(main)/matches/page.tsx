"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Swords,
  MapPin,
  Calendar,
  Clock,
  Users,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useOpenMatches } from "@/hooks/use-matches";
import {
  FieldTypeLabel,
  SkillLevelLabel,
  CostSharingLabel,
  MatchStatusLabel,
} from "@/types/enums";
import { formatDate, formatTimeRange, formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { FieldType, SkillLevel } from "@/types/enums";

export default function MatchListPage() {
  const [page, setPage] = useState(0);
  const [fieldType, setFieldType] = useState("");
  const [skillLevel, setSkillLevel] = useState("");

  const { data, isLoading } = useOpenMatches({
    page,
    size: 12,
    ...(fieldType && { fieldType: fieldType as FieldType }),
    ...(skillLevel && { skillLevel: skillLevel as SkillLevel }),
  });

  const matches = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            Tìm đối thủ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Các trận đang tìm đối
          </p>
        </div>
        <Link href="/matches/new">
          <Button>
            <Swords className="h-4 w-4 mr-2" />
            Tạo trận mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={fieldType}
            onValueChange={(v) => {
              setFieldType(v ?? "");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Loại sân" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              {Object.entries(FieldTypeLabel).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select
          value={skillLevel}
          onValueChange={(v) => {
            setSkillLevel(v ?? "");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trình độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả</SelectItem>
            {Object.entries(SkillLevelLabel).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" text="Đang tải..." />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="Chưa có trận nào"
          description="Chưa có trận đang tìm đối. Hãy tạo trận mới!"
          action={
            <Link href="/matches/new">
              <Button>Tạo trận</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {match.hostTeamLogoUrl ? (
                          <img
                            src={match.hostTeamLogoUrl}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <span className="font-semibold">
                          {match.hostTeamName}
                        </span>
                      </div>
                      <StatusBadge status={match.status} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">
                          {match.stadiumName} - {match.fieldName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatDate(match.bookingDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {formatTimeRange(match.startTime, match.endTime)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                        {FieldTypeLabel[match.fieldType]}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded">
                        {SkillLevelLabel[match.requiredSkillLevel]}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-orange-50 text-orange-700 rounded">
                        {CostSharingLabel[match.costSharing]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                      <span className="text-muted-foreground">
                        {match.responseCount} đội đã ứng
                      </span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(match.opponentAmount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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

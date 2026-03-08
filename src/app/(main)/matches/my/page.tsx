"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Swords,
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyMatchRequests, useMyJoinedMatches } from "@/hooks/use-matches";
import {
  FieldTypeLabel,
  SkillLevelLabel,
  CostSharingLabel,
} from "@/types/enums";
import { formatDate, formatTimeRange, formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { MatchRequestResponse } from "@/types/index";
import { cn } from "@/lib/utils";

export default function MyMatchesPage() {
  const [tab, setTab] = useState<"created" | "joined">("created");
  const { data: createdMatches, isLoading: loadingCreated } =
    useMyMatchRequests();
  const { data: joinedMatches, isLoading: loadingJoined } =
    useMyJoinedMatches();

  const isLoading = tab === "created" ? loadingCreated : loadingJoined;
  const matches = tab === "created" ? createdMatches : joinedMatches;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trận đấu của tôi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các trận tìm đối
          </p>
        </div>
        <Link href="/matches/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo trận mới
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            tab === "created"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("created")}
        >
          Trận tôi tạo ({createdMatches?.length ?? 0})
        </button>
        <button
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            tab === "joined"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("joined")}
        >
          Trận tôi tham gia ({joinedMatches?.length ?? 0})
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" text="Đang tải..." />
      ) : !matches || matches.length === 0 ? (
        <EmptyState
          icon={Swords}
          title={
            tab === "created" ? "Chưa tạo trận nào" : "Chưa tham gia trận nào"
          }
          description={
            tab === "created"
              ? "Tạo trận để tìm đối thủ"
              : "Tìm và ứng tuyển các trận đang mở"
          }
          action={
            tab === "created" ? (
              <Link href="/matches/new">
                <Button>Tạo trận</Button>
              </Link>
            ) : (
              <Link href="/matches">
                <Button>Tìm trận</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchRow({ match }: { match: MatchRequestResponse }) {
  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                {match.hostTeamLogoUrl ? (
                  <img
                    src={match.hostTeamLogoUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{match.hostTeamName}</span>
                  {match.opponentTeamName && (
                    <>
                      <Swords className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-semibold">
                        {match.opponentTeamName}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {match.stadiumName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(match.bookingDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeRange(match.startTime, match.endTime)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                  {FieldTypeLabel[match.fieldType]}
                </span>
                <span className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded">
                  {SkillLevelLabel[match.requiredSkillLevel]}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {match.responseCount} ứng tuyển
              </span>
              <StatusBadge status={match.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Swords,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useOpenMatches, useSendMatchResponse } from "@/hooks/use-matches";
import { useMyTeams } from "@/hooks/use-teams";
import {
  CostSharingLabel,
  FieldTypeLabel,
  JoinType,
  MatchStatus,
  SkillLevelLabel,
} from "@/types/enums";
import { formatCurrency, formatDate, formatTimeRange } from "@/lib/utils";
import type { MatchRequestResponse } from "@/types/index";

const MAX_MATCHES_FETCH = 100;
const DEFAULT_VISIBLE = 12;

export function OpenMatchesSection() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isCustomer = session?.user?.role === "CUSTOMER";

  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE);
  const [selectedMatch, setSelectedMatch] = useState<MatchRequestResponse | null>(
    null
  );
  const [selectedTeam, setSelectedTeam] = useState("");
  const [joinType, setJoinType] = useState<JoinType>(JoinType.TEAM);
  const [phoneMode, setPhoneMode] = useState<"SESSION" | "CUSTOM">("SESSION");
  const [contactPhone, setContactPhone] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const { data, isLoading } = useOpenMatches({
    page: 0,
    size: MAX_MATCHES_FETCH,
    sort: "createdAt,desc",
  });
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams(
    isAuthenticated && isCustomer
  );
  const sendResponse = useSendMatchResponse();

  const myTeamIds = useMemo(
    () => new Set((myTeams ?? []).map((team) => team.id)),
    [myTeams]
  );

  const matches = useMemo(() => data?.content ?? [], [data?.content]);
  const filteredMatches = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return matches;

    return matches.filter((match) => {
      const haystack = [
        match.matchCode,
        match.hostTeamName,
        match.stadiumName,
        match.fieldName,
        match.stadiumAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [matches, searchQuery]);

  const visibleMatches = filteredMatches.slice(0, visibleCount);

  const openJoinDialog = (match: MatchRequestResponse) => {
    setSelectedMatch(match);
    setSelectedTeam("");
    setResponseMessage("");
    const defaultJoinType =
      (myTeams?.length ?? 0) > 0 ? JoinType.TEAM : JoinType.INDIVIDUAL;
    setJoinType(defaultJoinType);
    const sessionPhone = session?.user?.phone?.trim() ?? "";
    setPhoneMode(sessionPhone ? "SESSION" : "CUSTOM");
    setContactPhone("");
  };

  const closeJoinDialog = () => {
    setSelectedMatch(null);
    setSelectedTeam("");
    setResponseMessage("");
    setJoinType(JoinType.TEAM);
    setPhoneMode("SESSION");
    setContactPhone("");
  };

  const handleSendResponse = async () => {
    if (!selectedMatch) return;
    if (joinType === JoinType.TEAM && !selectedTeam) {
      toast.error("Vui lòng chọn đội");
      return;
    }
    const sessionPhone = session?.user?.phone?.trim() ?? "";
    const selectedTeamPhone =
      myTeams?.find((team) => String(team.id) === selectedTeam)?.phone?.trim() ?? "";
    const resolvedPhone =
      joinType === JoinType.INDIVIDUAL
        ? phoneMode === "SESSION"
          ? sessionPhone
          : contactPhone.trim()
        : selectedTeamPhone;
    if (
      joinType === JoinType.INDIVIDUAL &&
      !resolvedPhone
    ) {
      toast.error("Bạn cần nhập số điện thoại liên hệ");
      return;
    }

    try {
      await sendResponse.mutateAsync({
        matchId: selectedMatch.id,
        data: {
          joinType,
          ...(joinType === JoinType.TEAM ? { teamId: Number(selectedTeam) } : {}),
          ...(resolvedPhone ? { contactPhone: resolvedPhone } : {}),
          message: responseMessage.trim() || undefined,
        },
      });
      toast.success("Đã gửi yêu cầu nhận kèo");
      closeJoinDialog();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Nhận kèo thất bại");
    }
  };

  const sessionPhone = session?.user?.phone?.trim() ?? "";
  const canUseSessionPhone = !!sessionPhone;

  return (
    <section className="mt-12">
      <Card className="border-sky-100 bg-white/85 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Swords className="h-5 w-5 text-sky-600" />
                Kèo Ráp Đang Mở
              </CardTitle>
            </div>
            <Link href="/matches">
              <Button variant="outline" className="border-sky-200 text-sky-700">
                Xem tất cả kèo
              </Button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(DEFAULT_VISIBLE);
              }}
              placeholder="Tìm theo mã kèo, đội chủ, tên sân..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-slate-600">
              Đang tải danh sách kèo...
            </div>
          ) : filteredMatches.length === 0 ? (
            <EmptyState
              icon={Swords}
              title="Không có kèo phù hợp"
              description="Thử từ khóa khác hoặc quay lại sau để xem kèo mới."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {visibleMatches.map((match) => {
                  const isHost = myTeamIds.has(match.hostTeamId);
                  const canJoin =
                    isAuthenticated &&
                    isCustomer &&
                    match.status === MatchStatus.OPEN &&
                    !isHost;

                  return (
                    <Card key={match.id} className="border-slate-200">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {match.hostTeamLogoUrl ? (
                              <img
                                src={match.hostTeamLogoUrl}
                                alt={match.hostTeamName}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100">
                                <Users className="h-4 w-4 text-sky-700" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">
                                {match.hostTeamName}
                              </p>
                              <p className="text-xs text-slate-500">#{match.matchCode}</p>
                            </div>
                          </div>
                          <StatusBadge status={match.status} />
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="line-clamp-1">
                              {match.stadiumName} - {match.fieldName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{formatDate(match.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>{formatTimeRange(match.startTime, match.endTime)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {FieldTypeLabel[match.fieldType]}
                          </span>
                          <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">
                            {SkillLevelLabel[match.requiredSkillLevel]}
                          </span>
                          <span className="rounded bg-orange-50 px-2 py-0.5 text-xs text-orange-700">
                            {CostSharingLabel[match.costSharing]}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t pt-3 text-sm">
                          <span className="text-slate-500">
                            {match.responseCount} đội đã nhận kèo
                          </span>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(match.opponentAmount)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link href={`/matches/${match.id}`}>
                            <Button size="sm" variant="outline">
                              Xem chi tiết
                            </Button>
                          </Link>

                          {canJoin && (
                            <Button
                              size="sm"
                              onClick={() => openJoinDialog(match)}
                              disabled={teamsLoading}
                            >
                              Nhận kèo ngay
                            </Button>
                          )}

                          {!isAuthenticated && (
                            <Link href="/login">
                              <Button size="sm">Đăng nhập để nhận kèo</Button>
                            </Link>
                          )}

                          {isAuthenticated && !isCustomer && (
                            <Button size="sm" disabled variant="outline">
                              Chỉ tài khoản người chơi nhận kèo
                            </Button>
                          )}

                          {isAuthenticated && isCustomer && isHost && (
                            <Button size="sm" disabled variant="outline">
                              Kèo của đội bạn
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {visibleCount < filteredMatches.length && (
                <div className="mt-5 text-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setVisibleCount((count) => count + DEFAULT_VISIBLE)
                    }
                  >
                    Xem thêm kèo
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && closeJoinDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhận kèo</DialogTitle>
            <DialogDescription>
              {selectedMatch
                ? `Bạn đang nhận kèo #${selectedMatch.matchCode}`
                : "Chọn cách tham gia trận đấu"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hình thức tham gia</Label>
              <Select
                value={joinType}
                onValueChange={(value) => setJoinType(value as JoinType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hình thức..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JoinType.TEAM}>Theo đội</SelectItem>
                  <SelectItem value={JoinType.INDIVIDUAL}>
                    Cá nhân (không cần đội)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {joinType === JoinType.TEAM && (
              <div className="space-y-2">
                <Label>Chọn đội *</Label>
                <Select
                  value={selectedTeam}
                  onValueChange={(value) => setSelectedTeam(value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đội..." />
                  </SelectTrigger>
                  <SelectContent>
                    {myTeams?.map((team) => (
                      <SelectItem key={team.id} value={String(team.id)}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(!myTeams || myTeams.length === 0) && (
                  <p className="text-xs text-muted-foreground">
                    Bạn chưa có đội. Có thể tạo đội mới hoặc tích chọn tham gia cá
                    nhân.
                  </p>
                )}
              </div>
            )}

            {joinType === JoinType.INDIVIDUAL && (
              <div className="space-y-2">
                <Label>Số điện thoại liên hệ *</Label>
                <div className="space-y-2 rounded-md border border-slate-200 p-3">
                  {canUseSessionPhone && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="phoneModeHome"
                        checked={phoneMode === "SESSION"}
                        onChange={() => setPhoneMode("SESSION")}
                      />
                      Dùng số tài khoản: {sessionPhone}
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="phoneModeHome"
                      checked={phoneMode === "CUSTOM"}
                      onChange={() => setPhoneMode("CUSTOM")}
                    />
                    Nhập số khác
                  </label>
                  {phoneMode === "CUSTOM" && (
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      inputMode="tel"
                    />
                  )}
                </div>
              </div>
            )}

            {joinType === JoinType.TEAM && (
              <div className="space-y-2">
                <Label>Số điện thoại liên hệ</Label>
                <Input
                  value={
                    myTeams?.find((team) => String(team.id) === selectedTeam)?.phone ?? ""
                  }
                  readOnly
                  placeholder="Chọn đội để tự động lấy SĐT"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Tin nhắn (tuỳ chọn)</Label>
              <Textarea
                rows={3}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Gửi lời nhắn đến đội chủ nhà..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeJoinDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={
                sendResponse.isPending ||
                (joinType === JoinType.TEAM && !selectedTeam)
              }
            >
              {sendResponse.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận nhận kèo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

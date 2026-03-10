"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Swords,
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  Ban,
  Loader2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useMatchRequest,
  useCancelMatchRequest,
  useSendMatchResponse,
  useAcceptMatchResponse,
  useRejectMatchResponse,
  useWithdrawMatchResponse,
} from "@/hooks/use-matches";
import { useMyTeams } from "@/hooks/use-teams";
import {
  FieldTypeLabel,
  SkillLevelLabel,
  CostSharingLabel,
  MatchStatusLabel,
  MatchResponseStatusLabel,
  MatchStatus,
  MatchResponseStatus,
} from "@/types/enums";
import {
  formatDate,
  formatDateTime,
  formatTimeRange,
  formatCurrency,
} from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const matchId = parseInt(id, 10);
  const { data: session } = useSession();
  const router = useRouter();

  const { data: match, isLoading } = useMatchRequest(matchId);
  const { data: myTeams } = useMyTeams();
  const cancelMatch = useCancelMatchRequest();
  const sendResponse = useSendMatchResponse();
  const acceptResponse = useAcceptMatchResponse();
  const rejectResponse = useRejectMatchResponse();
  const withdrawResponse = useWithdrawMatchResponse();

  const [respondOpen, setRespondOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [joinAsGuest, setJoinAsGuest] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Không tìm thấy trận</p>
      </div>
    );
  }

  // Check if current user's team is host
  const isHost = myTeams?.some((t) => t.id === match.hostTeamId) ?? false;
  const isOpen = match.status === MatchStatus.OPEN;

  // Check if user already responded
  const myResponse = match.responses?.find((r) =>
    myTeams?.some((t) => t.id === r.teamId)
  );

  const handleSendResponse = async () => {
    if (!joinAsGuest && !selectedTeam) {
      toast.error("Chọn đội hoặc tham gia với tư cách cá nhân");
      return;
    }
    try {
      await sendResponse.mutateAsync({
        matchId,
        data: {
          ...(joinAsGuest ? {} : { teamId: parseInt(selectedTeam) }),
          message: responseMessage || undefined,
        },
      });
      toast.success("Đã gửi yêu cầu ghép trận!");
      setRespondOpen(false);
      setResponseMessage("");
      setSelectedTeam("");
      setJoinAsGuest(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gửi yêu cầu thất bại");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMatch.mutateAsync(matchId);
      toast.success("Đã hủy trận!");
      setCancelOpen(false);
    } catch {
      toast.error("Hủy trận thất bại");
    }
  };

  const handleAcceptResponse = async (responseId: number) => {
    try {
      await acceptResponse.mutateAsync({ matchId, responseId });
      toast.success("Đã chấp nhận đối thủ!");
    } catch {
      toast.error("Chấp nhận thất bại");
    }
  };

  const handleRejectResponse = async (responseId: number) => {
    try {
      await rejectResponse.mutateAsync({ matchId, responseId });
      toast.success("Đã từ chối!");
    } catch {
      toast.error("Từ chối thất bại");
    }
  };

  const handleWithdraw = async (responseId: number) => {
    try {
      await withdrawResponse.mutateAsync({ matchId, responseId });
      toast.success("Đã rút yêu cầu!");
    } catch {
      toast.error("Rút yêu cầu thất bại");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/matches"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            Trận #{match.matchCode}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo lúc {formatDateTime(match.createdAt)}
          </p>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Match info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin trận đấu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Sân"
              value={`${match.stadiumName} - ${match.fieldName}`}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Ngày"
              value={formatDate(match.bookingDate)}
            />
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Giờ"
              value={formatTimeRange(match.startTime, match.endTime)}
            />
            {match.contactPhone && (
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Liên hệ"
                value={match.contactPhone}
              />
            )}
            {match.message && (
              <InfoRow
                icon={<MessageSquare className="h-4 w-4" />}
                label="Tin nhắn"
                value={match.message}
              />
            )}
          </CardContent>
        </Card>

        {/* Teams & Cost */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đội & Chi phí</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Host team */}
            <div className="flex items-center gap-3">
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
              <div>
                <p className="font-semibold">{match.hostTeamName}</p>
                <p className="text-xs text-muted-foreground">Đội chủ nhà</p>
              </div>
            </div>

            {/* Opponent */}
            {match.opponentTeamName ? (
              <div className="flex items-center gap-3">
                {match.opponentTeamLogoUrl ? (
                  <img
                    src={match.opponentTeamLogoUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{match.opponentTeamName}</p>
                  <p className="text-xs text-muted-foreground">Đội khách</p>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-muted rounded text-sm text-muted-foreground italic">
                Chưa có đối thủ
              </div>
            )}

            <hr />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền sân</span>
                <span className="font-medium">
                  {formatCurrency(match.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chia phí</span>
                <span>{CostSharingLabel[match.costSharing]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Đối thủ trả
                </span>
                <span className="font-semibold text-primary">
                  {formatCurrency(match.opponentAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                {FieldTypeLabel[match.fieldType]}
              </span>
              <span className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                {SkillLevelLabel[match.requiredSkillLevel]}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responses */}
      {(match.responses?.length > 0 || isHost) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              Đội ứng tuyển ({match.responses?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {match.responses?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có đội nào ứng tuyển
              </p>
            ) : (
              <div className="space-y-3">
                {match.responses?.map((resp) => (
                  <div
                    key={resp.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {resp.teamLogoUrl ? (
                        <img
                          src={resp.teamLogoUrl}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{resp.teamName}</p>
                        {resp.message && (
                          <p className="text-xs text-muted-foreground">
                            {resp.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(resp.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={resp.status} />

                      {/* Host actions on pending responses */}
                      {isHost &&
                        isOpen &&
                        resp.status === MatchResponseStatus.PENDING && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              disabled={acceptResponse.isPending}
                              onClick={() => handleAcceptResponse(resp.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Chấp nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={rejectResponse.isPending}
                              onClick={() => handleRejectResponse(resp.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        )}

                      {/* Withdraw own response */}
                      {!isHost &&
                        resp.status === MatchResponseStatus.PENDING &&
                        myTeams?.some((t) => t.id === resp.teamId) && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={withdrawResponse.isPending}
                            onClick={() => handleWithdraw(resp.id)}
                          >
                            Rút đăng ký
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Respond to match (non-host, open, hasn't responded yet) */}
        {!isHost && isOpen && !myResponse && session && (
          <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Swords className="h-4 w-4 mr-2" />
                  Ứng tuyển đấu
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ứng tuyển ghép trận</DialogTitle>
                <DialogDescription>
                  Chọn đội để tham gia trận đấu
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="joinAsGuest"
                    checked={joinAsGuest}
                    onChange={(e) => {
                      setJoinAsGuest(e.target.checked);
                      if (e.target.checked) setSelectedTeam("");
                    }}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="joinAsGuest" className="cursor-pointer text-sm">
                    Tham gia với tư cách cá nhân (không cần đội)
                  </Label>
                </div>
                {!joinAsGuest && (
                  <div className="space-y-2">
                    <Label>Chọn đội *</Label>
                    <Select
                      value={selectedTeam}
                      onValueChange={(v) => setSelectedTeam(v ?? "")}
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
                        Bạn chưa có đội nào.{" "}
                        <Link href="/teams/new" className="text-primary hover:underline">
                          Tạo đội mới
                        </Link>{" "}
                        hoặc tích chọn tham gia cá nhân.
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Tin nhắn</Label>
                  <Textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Nhắn gì cho đội chủ nhà..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRespondOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  disabled={sendResponse.isPending || (!joinAsGuest && !selectedTeam)}
                  onClick={handleSendResponse}
                >
                  {sendResponse.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Gửi ứng tuyển
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Cancel match (host only) */}
        {isHost && isOpen && (
          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogTrigger
              render={
                <Button variant="destructive">
                  <Ban className="h-4 w-4 mr-2" />
                  Hủy trận
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hủy trận đấu?</DialogTitle>
                <DialogDescription>
                  Trận đấu sẽ bị hủy. Không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  variant="destructive"
                  disabled={cancelMatch.isPending}
                  onClick={handleCancel}
                >
                  {cancelMatch.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Hủy trận
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {!session && (
          <Link href="/login">
            <Button>Đăng nhập để ứng tuyển</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <span className="text-muted-foreground min-w-[60px]">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

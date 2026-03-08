"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Swords,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateMatchRequest } from "@/hooks/use-matches";
import { useMyTeams } from "@/hooks/use-teams";
import { useMyBookings } from "@/hooks/use-bookings";
import { SkillLevelLabel, CostSharingLabel, BookingStatus } from "@/types/enums";
import type { SkillLevel, CostSharing } from "@/types/enums";
import { formatDate, formatTimeRange, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function CreateMatchPage() {
  const router = useRouter();
  const createMatch = useCreateMatchRequest();
  const { data: myTeams } = useMyTeams();
  const { data: bookingsData } = useMyBookings(BookingStatus.CONFIRMED, 0, 50);

  const [teamId, setTeamId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [skillLevel, setSkillLevel] = useState("ANY");
  const [costSharing, setCostSharing] = useState("EQUAL_SPLIT");
  const [hostPercent, setHostPercent] = useState(50);
  const [opponentPercent, setOpponentPercent] = useState(50);
  const [message, setMessage] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const bookings = bookingsData?.content ?? [];
  // Only show bookings that have isMatchRequest enabled or are confirmed
  const availableBookings = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !bookingId) {
      toast.error("Vui lòng chọn đội và booking");
      return;
    }

    try {
      const result = await createMatch.mutateAsync({
        bookingId: parseInt(bookingId),
        teamId: parseInt(teamId),
        requiredSkillLevel: skillLevel as SkillLevel,
        costSharing: costSharing as CostSharing,
        hostSharePercent: costSharing === "CUSTOM" ? hostPercent : undefined,
        opponentSharePercent:
          costSharing === "CUSTOM" ? opponentPercent : undefined,
        message: message || undefined,
        contactPhone: contactPhone || undefined,
      });
      toast.success("Tạo trận thành công!");
      router.push(`/matches/${result.data.id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Tạo trận thất bại");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/matches"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại
      </Link>

      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Swords className="h-6 w-6 text-primary" />
        Tạo trận tìm đối
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chọn đội & sân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Đội của bạn *</Label>
              <Select
                value={teamId}
                onValueChange={(v) => setTeamId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đội..." />
                </SelectTrigger>
                <SelectContent>
                  {myTeams?.map((team) => (
                    <SelectItem key={team.id} value={String(team.id)}>
                      {team.name} ({team.memberCount} TV)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Booking sân đã đặt *</Label>
              <Select
                value={bookingId}
                onValueChange={(v) => setBookingId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn booking..." />
                </SelectTrigger>
                <SelectContent>
                  {availableBookings.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.stadiumName} - {b.fieldName} |{" "}
                      {formatDate(b.bookingDate)}{" "}
                      {formatTimeRange(b.startTime, b.endTime)} |{" "}
                      {formatCurrency(b.totalPrice)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableBookings.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Chưa có booking đã xác nhận.{" "}
                  <Link href="/bookings/new" className="text-primary underline">
                    Đặt sân trước
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cấu hình trận</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trình độ yêu cầu</Label>
                <Select
                  value={skillLevel}
                  onValueChange={(v) => setSkillLevel(v ?? "ANY")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SkillLevelLabel).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chia phí</Label>
                <Select
                  value={costSharing}
                  onValueChange={(v) => setCostSharing(v ?? "EQUAL_SPLIT")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CostSharingLabel).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {costSharing === "CUSTOM" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chủ nhà trả (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={hostPercent}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      setHostPercent(v);
                      setOpponentPercent(100 - v);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Đối thủ trả (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={opponentPercent}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      setOpponentPercent(v);
                      setHostPercent(100 - v);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin thêm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Số điện thoại liên hệ</Label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="VD: 0912345678"
              />
            </div>
            <div className="space-y-2">
              <Label>Tin nhắn cho đối thủ</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mô tả thêm về trận đấu..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createMatch.isPending || !teamId || !bookingId}
          >
            {createMatch.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Swords className="h-4 w-4 mr-2" />
                Tạo trận
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

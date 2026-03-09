"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Shield,
  Users,
  MapPin,
  UserPlus,
  UserMinus,
  Crown,
  LogOut,
  Pencil,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useTeam,
  useInviteMember,
  useRemoveMember,
  useTransferCaptain,
  useLeaveTeam,
} from "@/hooks/use-teams";
import { addMemberSchema, type AddMemberFormData } from "@/lib/validations/team";
import {
  FieldTypeLabel,
  SkillLevelLabel,
  TeamMemberRoleLabel,
  TeamMemberStatusLabel,
  TeamMemberStatus,
  TeamMemberRole,
} from "@/types/enums";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const teamId = parseInt(id, 10);
  const { data: session } = useSession();
  const router = useRouter();
  const { data: team, isLoading } = useTeam(teamId);

  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const transferCaptain = useTransferCaptain();
  const leaveTeam = useLeaveTeam();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "remove" | "transfer" | "leave";
    userId?: number;
    userName?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
  });

  const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;
  const isCaptain = team ? team.captainId === currentUserId : false;

  const activeMembers =
    (team?.members || []).filter(
      (m) =>
        m.status === TeamMemberStatus.ACTIVE ||
        m.status === TeamMemberStatus.PENDING
    );

  const handleInvite = async (data: AddMemberFormData) => {
    try {
      await inviteMember.mutateAsync({ teamId, data: { email: data.email } });
      toast.success("Đã gửi lời mời!");
      reset();
      setInviteOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gửi lời mời thất bại");
    }
  };

  const handleRemove = async (userId: number) => {
    try {
      await removeMember.mutateAsync({ teamId, userId });
      toast.success("Đã loại thành viên!");
      setConfirmAction(null);
    } catch {
      toast.error("Loại thành viên thất bại");
    }
  };

  const handleTransfer = async (userId: number) => {
    try {
      await transferCaptain.mutateAsync({ teamId, userId });
      toast.success("Đã chuyển đội trưởng!");
      setConfirmAction(null);
    } catch {
      toast.error("Chuyển đội trưởng thất bại");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveTeam.mutateAsync(teamId);
      toast.success("Đã rời đội!");
      router.push("/teams");
    } catch {
      toast.error("Rời đội thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Không tìm thấy đội</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/teams"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại
      </Link>

      {/* Team header */}
      <div className="flex items-start gap-4 mb-6">
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={team.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{team.name}</h1>
            {isCaptain && (
              <Link href={`/teams/${teamId}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Sửa
                </Button>
              </Link>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Đội trưởng: {team.captainName}
          </p>
          {team.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {team.description}
            </p>
          )}
        </div>
      </div>

      {/* Team info */}
      <div className="flex flex-wrap gap-2 mb-6">
        {team.preferredFieldType && (
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm">
            ⚽ {FieldTypeLabel[team.preferredFieldType]}
          </span>
        )}
        {team.skillLevel && (
          <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm">
            🏆 {SkillLevelLabel[team.skillLevel]}
          </span>
        )}
        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {team.memberCount} thành viên
        </span>
        {(team.city || team.district) && (
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {[team.district, team.city].filter(Boolean).join(", ")}
          </span>
        )}
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Thành viên ({activeMembers.length})
            </CardTitle>
            {isCaptain && (
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger
                  render={
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Mời thành viên
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mời thành viên</DialogTitle>
                    <DialogDescription>
                      Nhập email người bạn muốn mời vào đội
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={handleSubmit(handleInvite)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...register("email")}
                          placeholder="email@example.com"
                          className="pl-9"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInviteOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={inviteMember.isPending}
                      >
                        {inviteMember.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Gửi lời mời
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {activeMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {member.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {member.userName}
                      </span>
                      {member.role === TeamMemberRole.CAPTAIN && (
                        <Crown className="h-3.5 w-3.5 text-yellow-500" />
                      )}
                      {member.status === TeamMemberStatus.PENDING && (
                        <StatusBadge status={member.status} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.userEmail}
                    </p>
                  </div>
                </div>

                {isCaptain &&
                  member.userId !== currentUserId &&
                  member.status === TeamMemberStatus.ACTIVE && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Chuyển đội trưởng"
                        onClick={() =>
                          setConfirmAction({
                            type: "transfer",
                            userId: member.userId,
                            userName: member.userName,
                          })
                        }
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        title="Loại khỏi đội"
                        onClick={() =>
                          setConfirmAction({
                            type: "remove",
                            userId: member.userId,
                            userName: member.userName,
                          })
                        }
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave team button */}
      {!isCaptain && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="destructive"
            onClick={() => setConfirmAction({ type: "leave" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Rời đội
          </Button>
        </div>
      )}

      {/* Confirm dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "remove"
                ? "Loại thành viên?"
                : confirmAction?.type === "transfer"
                  ? "Chuyển đội trưởng?"
                  : "Rời đội?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "remove"
                ? `${confirmAction.userName} sẽ bị loại khỏi đội.`
                : confirmAction?.type === "transfer"
                  ? `${confirmAction.userName} sẽ trở thành đội trưởng mới.`
                  : "Bạn sẽ không còn là thành viên của đội."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Hủy
            </Button>
            <Button
              variant={confirmAction?.type === "transfer" ? "default" : "destructive"}
              disabled={
                removeMember.isPending ||
                transferCaptain.isPending ||
                leaveTeam.isPending
              }
              onClick={() => {
                if (confirmAction?.type === "remove" && confirmAction.userId) {
                  handleRemove(confirmAction.userId);
                } else if (
                  confirmAction?.type === "transfer" &&
                  confirmAction.userId
                ) {
                  handleTransfer(confirmAction.userId);
                } else if (confirmAction?.type === "leave") {
                  handleLeave();
                }
              }}
            >
              {(removeMember.isPending ||
                transferCaptain.isPending ||
                leaveTeam.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

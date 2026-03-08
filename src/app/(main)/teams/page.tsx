"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Shield,
  MapPin,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMyTeams, useDeleteTeam, useAcceptInvite, useRejectInvite } from "@/hooks/use-teams";
import { FieldTypeLabel, SkillLevelLabel, TeamMemberStatusLabel } from "@/types/enums";
import { TeamMemberStatus } from "@/types/enums";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";

export default function MyTeamsPage() {
  const { data: teams, isLoading } = useMyTeams();
  const deleteTeam = useDeleteTeam();
  const acceptInvite = useAcceptInvite();
  const rejectInvite = useRejectInvite();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Separate pending invites from active teams
  const pendingInvites =
    teams?.flatMap((t) =>
      t.members
        .filter((m) => m.status === TeamMemberStatus.PENDING)
        .map((m) => ({ ...m, teamName: t.name, teamId: t.id }))
    ) ?? [];

  const handleDelete = async (id: number) => {
    try {
      await deleteTeam.mutateAsync(id);
      toast.success("Đã giải tán đội!");
      setDeleteId(null);
    } catch {
      toast.error("Giải tán đội thất bại");
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      await acceptInvite.mutateAsync(inviteId);
      toast.success("Đã chấp nhận lời mời!");
    } catch {
      toast.error("Chấp nhận thất bại");
    }
  };

  const handleRejectInvite = async (inviteId: number) => {
    try {
      await rejectInvite.mutateAsync(inviteId);
      toast.success("Đã từ chối lời mời!");
    } catch {
      toast.error("Từ chối thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Đội của tôi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các đội bóng
          </p>
        </div>
        <Link href="/teams/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo đội mới
          </Button>
        </Link>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Lời mời chờ xác nhận</h2>
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invite.teamName}</p>
                    <p className="text-sm text-muted-foreground">
                      Bạn được mời vào đội
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptInvite(invite.id)}
                      disabled={acceptInvite.isPending}
                    >
                      Chấp nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectInvite(invite.id)}
                      disabled={rejectInvite.isPending}
                    >
                      Từ chối
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Teams list */}
      {!teams || teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có đội nào"
          description="Tạo đội bóng để tìm đối thủ và ghép trận"
          action={
            <Link href="/teams/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo đội mới
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/teams/${team.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {team.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Đội trưởng: {team.captainName}
                      </p>
                    </div>
                  </div>
                  <Dialog
                    open={deleteId === team.id}
                    onOpenChange={(open) => setDeleteId(open ? team.id : null)}
                  >
                    <DialogTrigger
                      render={
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Giải tán đội?</DialogTitle>
                        <DialogDescription>
                          Đội &quot;{team.name}&quot; sẽ bị giải tán. Không thể hoàn tác.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                          Hủy
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={deleteTeam.isPending}
                          onClick={() => handleDelete(team.id)}
                        >
                          {deleteTeam.isPending && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          )}
                          Giải tán
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {team.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {team.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  {team.preferredFieldType && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      {FieldTypeLabel[team.preferredFieldType]}
                    </span>
                  )}
                  {team.skillLevel && (
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                      {SkillLevelLabel[team.skillLevel]}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {team.memberCount} TV
                  </span>
                  {(team.city || team.district) && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[team.district, team.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

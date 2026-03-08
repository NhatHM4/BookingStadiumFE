import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTeam,
  getMyTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  inviteMember,
  removeMember,
  transferCaptain,
  leaveTeam,
  acceptInvite,
  rejectInvite,
} from "@/lib/api/teams";
import type { TeamRequest, AddMemberRequest } from "@/types/index";

// ========================
// Team CRUD Hooks
// ========================

export function useMyTeams() {
  return useQuery({
    queryKey: ["my-teams"],
    queryFn: () => getMyTeams(),
    select: (res) => res.data,
  });
}

export function useTeam(id: number) {
  return useQuery({
    queryKey: ["teams", id],
    queryFn: () => getTeam(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TeamRequest) => createTeam(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-teams"] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TeamRequest }) =>
      updateTeam(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["my-teams"] });
      qc.invalidateQueries({ queryKey: ["teams", id] });
    },
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTeam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-teams"] }),
  });
}

// ========================
// Team Member Hooks
// ========================

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: number;
      data: AddMemberRequest;
    }) => inviteMember(teamId, data),
    onSuccess: (_, { teamId }) =>
      qc.invalidateQueries({ queryKey: ["teams", teamId] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      removeMember(teamId, userId),
    onSuccess: (_, { teamId }) =>
      qc.invalidateQueries({ queryKey: ["teams", teamId] }),
  });
}

export function useTransferCaptain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      transferCaptain(teamId, userId),
    onSuccess: (_, { teamId }) => {
      qc.invalidateQueries({ queryKey: ["teams", teamId] });
      qc.invalidateQueries({ queryKey: ["my-teams"] });
    },
  });
}

export function useLeaveTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) => leaveTeam(teamId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-teams"] }),
  });
}

// ========================
// Invite Hooks
// ========================

export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) => acceptInvite(inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-teams"] });
    },
  });
}

export function useRejectInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) => rejectInvite(inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-teams"] });
    },
  });
}

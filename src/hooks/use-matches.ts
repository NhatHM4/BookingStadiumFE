import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMatchRequest,
  getOpenMatches,
  getMyMatchRequests,
  getMyJoinedMatches,
  getMatchRequest,
  cancelMatchRequest,
  sendMatchResponse,
  acceptMatchResponse,
  rejectMatchResponse,
  withdrawMatchResponse,
  type MatchFilters,
} from "@/lib/api/matches";
import type { MatchRequestRequest, MatchResponseRequest } from "@/types/index";

// ========================
// Match Request Hooks
// ========================

export function useOpenMatches(filters: MatchFilters = {}) {
  return useQuery({
    queryKey: ["open-matches", filters],
    queryFn: () => getOpenMatches(filters),
    select: (res) => res.data,
  });
}

export function useMyMatchRequests() {
  return useQuery({
    queryKey: ["my-match-requests"],
    queryFn: () => getMyMatchRequests(),
    select: (res) => res.data,
  });
}

export function useMyJoinedMatches() {
  return useQuery({
    queryKey: ["my-joined-matches"],
    queryFn: () => getMyJoinedMatches(),
    select: (res) => res.data,
  });
}

export function useMatchRequest(id: number) {
  return useQuery({
    queryKey: ["match-requests", id],
    queryFn: () => getMatchRequest(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateMatchRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MatchRequestRequest) => createMatchRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-match-requests"] });
      qc.invalidateQueries({ queryKey: ["open-matches"] });
    },
  });
}

export function useCancelMatchRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelMatchRequest(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["match-requests", id] });
      qc.invalidateQueries({ queryKey: ["my-match-requests"] });
      qc.invalidateQueries({ queryKey: ["open-matches"] });
    },
  });
}

// ========================
// Match Response Hooks
// ========================

export function useSendMatchResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      data,
    }: {
      matchId: number;
      data: MatchResponseRequest;
    }) => sendMatchResponse(matchId, data),
    onSuccess: (_, { matchId }) => {
      qc.invalidateQueries({ queryKey: ["match-requests", matchId] });
      qc.invalidateQueries({ queryKey: ["my-joined-matches"] });
    },
  });
}

export function useAcceptMatchResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      responseId,
    }: {
      matchId: number;
      responseId: number;
    }) => acceptMatchResponse(matchId, responseId),
    onSuccess: (_, { matchId }) => {
      qc.invalidateQueries({ queryKey: ["match-requests", matchId] });
      qc.invalidateQueries({ queryKey: ["my-match-requests"] });
      qc.invalidateQueries({ queryKey: ["open-matches"] });
    },
  });
}

export function useRejectMatchResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      responseId,
    }: {
      matchId: number;
      responseId: number;
    }) => rejectMatchResponse(matchId, responseId),
    onSuccess: (_, { matchId }) => {
      qc.invalidateQueries({ queryKey: ["match-requests", matchId] });
    },
  });
}

export function useWithdrawMatchResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      matchId,
      responseId,
    }: {
      matchId: number;
      responseId: number;
    }) => withdrawMatchResponse(matchId, responseId),
    onSuccess: (_, { matchId }) => {
      qc.invalidateQueries({ queryKey: ["match-requests", matchId] });
      qc.invalidateQueries({ queryKey: ["my-joined-matches"] });
    },
  });
}

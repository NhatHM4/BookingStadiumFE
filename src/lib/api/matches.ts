import apiClient from "./client";
import type { ApiResponse, PaginatedData } from "@/types/api";
import type {
  MatchRequestResponse,
  MatchRequestRequest,
  MatchResponseResponse,
  MatchResponseRequest,
} from "@/types/index";
import type { FieldType, SkillLevel } from "@/types/enums";

// ========================
// Match Requests
// ========================

export async function createMatchRequest(
  data: MatchRequestRequest
): Promise<ApiResponse<MatchRequestResponse>> {
  const res = await apiClient.post("/match-requests", data);
  return res.data;
}

export interface MatchFilters {
  fieldType?: FieldType;
  skillLevel?: SkillLevel;
  excludeUserId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getOpenMatches(
  filters: MatchFilters = {}
): Promise<ApiResponse<PaginatedData<MatchRequestResponse>>> {
  const params = new URLSearchParams();
  if (filters.fieldType) params.set("fieldType", filters.fieldType);
  if (filters.skillLevel) params.set("skillLevel", filters.skillLevel);
  if (filters.excludeUserId)
    params.set("excludeUserId", String(filters.excludeUserId));
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 10));
  if (filters.sort) params.set("sort", filters.sort);

  const res = await apiClient.get(`/match-requests?${params.toString()}`);
  return res.data;
}

export async function getMyMatchRequests(): Promise<
  ApiResponse<MatchRequestResponse[]>
> {
  const res = await apiClient.get("/match-requests/my");
  return res.data;
}

export async function getMyJoinedMatches(): Promise<
  ApiResponse<MatchRequestResponse[]>
> {
  const res = await apiClient.get("/match-requests/my-matches");
  return res.data;
}

export async function getMatchRequest(
  id: number
): Promise<ApiResponse<MatchRequestResponse>> {
  const res = await apiClient.get(`/match-requests/${id}`);
  return res.data;
}

export async function cancelMatchRequest(
  id: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.put(`/match-requests/${id}/cancel`);
  return res.data;
}

// ========================
// Match Responses
// ========================

export async function sendMatchResponse(
  matchId: number,
  data: MatchResponseRequest
): Promise<ApiResponse<MatchResponseResponse>> {
  const res = await apiClient.post(
    `/match-requests/${matchId}/responses`,
    data
  );
  return res.data;
}

export async function acceptMatchResponse(
  matchId: number,
  responseId: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.put(
    `/match-requests/${matchId}/responses/${responseId}/accept`
  );
  return res.data;
}

export async function rejectMatchResponse(
  matchId: number,
  responseId: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.put(
    `/match-requests/${matchId}/responses/${responseId}/reject`
  );
  return res.data;
}

export async function withdrawMatchResponse(
  matchId: number,
  responseId: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.put(
    `/match-requests/${matchId}/responses/${responseId}/withdraw`
  );
  return res.data;
}

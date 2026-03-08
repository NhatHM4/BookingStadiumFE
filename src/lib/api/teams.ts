import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  TeamResponse,
  TeamMemberResponse,
  TeamRequest,
  AddMemberRequest,
} from "@/types/index";

// ========================
// Team CRUD
// ========================

export async function createTeam(
  data: TeamRequest
): Promise<ApiResponse<TeamResponse>> {
  const res = await apiClient.post("/teams", data);
  return res.data;
}

export async function getMyTeams(): Promise<ApiResponse<TeamResponse[]>> {
  const res = await apiClient.get("/teams/my");
  return res.data;
}

export async function getTeam(
  id: number
): Promise<ApiResponse<TeamResponse>> {
  const res = await apiClient.get(`/teams/${id}`);
  return res.data;
}

export async function updateTeam(
  id: number,
  data: TeamRequest
): Promise<ApiResponse<TeamResponse>> {
  const res = await apiClient.put(`/teams/${id}`, data);
  return res.data;
}

export async function deleteTeam(
  id: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.delete(`/teams/${id}`);
  return res.data;
}

// ========================
// Team Members
// ========================

export async function inviteMember(
  teamId: number,
  data: AddMemberRequest
): Promise<ApiResponse<TeamMemberResponse>> {
  const res = await apiClient.post(`/teams/${teamId}/members`, data);
  return res.data;
}

export async function removeMember(
  teamId: number,
  userId: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.put(`/teams/${teamId}/members/${userId}/remove`);
  return res.data;
}

export async function transferCaptain(
  teamId: number,
  userId: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.put(
    `/teams/${teamId}/members/${userId}/captain`
  );
  return res.data;
}

export async function leaveTeam(
  teamId: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.put(`/teams/${teamId}/leave`);
  return res.data;
}

// ========================
// Team Invites
// ========================

export async function acceptInvite(
  inviteId: number
): Promise<ApiResponse<TeamMemberResponse>> {
  const res = await apiClient.put(`/team-invites/${inviteId}/accept`);
  return res.data;
}

export async function rejectInvite(
  inviteId: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.put(`/team-invites/${inviteId}/reject`);
  return res.data;
}

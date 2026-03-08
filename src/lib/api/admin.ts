import apiClient from "./client";
import type { ApiResponse, PaginatedData } from "@/types/api";
import type {
  UserResponse,
  StadiumResponse,
  DashboardResponse,
} from "@/types/index";
import type { Role } from "@/types/enums";

// ========================
// Admin Dashboard
// ========================

export async function getAdminDashboard(): Promise<ApiResponse<DashboardResponse>> {
  const res = await apiClient.get("/admin/dashboard");
  return res.data;
}

// ========================
// Admin User Management
// ========================

export async function getAdminUsers(
  role?: Role,
  search?: string,
  page = 0,
  size = 10,
  sort = "createdAt,desc"
): Promise<ApiResponse<PaginatedData<UserResponse>>> {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sort", sort);
  const res = await apiClient.get(`/admin/users?${params.toString()}`);
  return res.data;
}

export async function getAdminUser(
  id: number
): Promise<ApiResponse<UserResponse>> {
  const res = await apiClient.get(`/admin/users/${id}`);
  return res.data;
}

export async function toggleUserActive(
  id: number
): Promise<ApiResponse<UserResponse>> {
  const res = await apiClient.put(`/admin/users/${id}/toggle-active`);
  return res.data;
}

// ========================
// Admin Stadium Approval
// ========================

export async function getPendingStadiums(
  page = 0,
  size = 10
): Promise<ApiResponse<PaginatedData<StadiumResponse>>> {
  const res = await apiClient.get(
    `/admin/stadiums/pending?page=${page}&size=${size}`
  );
  return res.data;
}

export async function approveStadium(
  id: number
): Promise<ApiResponse<StadiumResponse>> {
  const res = await apiClient.put(`/admin/stadiums/${id}/approve`);
  return res.data;
}

export async function rejectStadium(
  id: number
): Promise<ApiResponse<StadiumResponse>> {
  const res = await apiClient.put(`/admin/stadiums/${id}/reject`);
  return res.data;
}

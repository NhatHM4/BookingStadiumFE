import apiClient from "./client";
import type { ApiResponse, PaginatedData } from "@/types/api";
import type {
  StadiumResponse,
  StadiumFilters,
  StadiumRequest,
} from "@/types/index";

// ========================
// Public APIs
// ========================

export async function getStadiums(
  filters: StadiumFilters = {}
): Promise<ApiResponse<PaginatedData<StadiumResponse>>> {
  const params = new URLSearchParams();

  if (filters.city) params.append("city", filters.city);
  if (filters.district) params.append("district", filters.district);
  if (filters.name) params.append("name", filters.name);
  if (filters.fieldType) params.append("fieldType", filters.fieldType);
  if (filters.page !== undefined) params.append("page", String(filters.page));
  if (filters.size !== undefined) params.append("size", String(filters.size));
  if (filters.sort) params.append("sort", filters.sort);

  const res = await apiClient.get(`/stadiums?${params.toString()}`);
  return res.data;
}

export async function getStadium(
  id: number
): Promise<ApiResponse<StadiumResponse>> {
  const res = await apiClient.get(`/stadiums/${id}`);
  return res.data;
}

export async function getNearbyStadiums(
  lat: number,
  lng: number,
  radius?: number
): Promise<ApiResponse<StadiumResponse[]>> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  if (radius) params.append("radius", String(radius));

  const res = await apiClient.get(`/stadiums/nearby?${params.toString()}`);
  return res.data;
}

// ========================
// Owner APIs
// ========================

export async function getOwnerStadiums(): Promise<
  ApiResponse<StadiumResponse[]>
> {
  const res = await apiClient.get("/owner/stadiums");
  return res.data;
}

export async function createStadium(
  data: StadiumRequest
): Promise<ApiResponse<StadiumResponse>> {
  const res = await apiClient.post("/stadiums", data);
  return res.data;
}

export async function updateStadium(
  id: number,
  data: StadiumRequest
): Promise<ApiResponse<StadiumResponse>> {
  const res = await apiClient.put(`/stadiums/${id}`, data);
  return res.data;
}

export async function deleteStadium(
  id: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.delete(`/stadiums/${id}`);
  return res.data;
}

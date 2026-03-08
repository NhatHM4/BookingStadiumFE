import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type { FieldResponse, FieldRequest } from "@/types/index";

export async function getFields(
  stadiumId: number
): Promise<ApiResponse<FieldResponse[]>> {
  const res = await apiClient.get(`/stadiums/${stadiumId}/fields`);
  return res.data;
}

export async function createField(
  stadiumId: number,
  data: FieldRequest
): Promise<ApiResponse<FieldResponse>> {
  const res = await apiClient.post(`/stadiums/${stadiumId}/fields`, data);
  return res.data;
}

export async function updateField(
  id: number,
  data: FieldRequest
): Promise<ApiResponse<FieldResponse>> {
  const res = await apiClient.put(`/fields/${id}`, data);
  return res.data;
}

export async function deleteField(
  id: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.delete(`/fields/${id}`);
  return res.data;
}

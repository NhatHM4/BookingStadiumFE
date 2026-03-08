import apiClient from "./client";
import type { ApiResponse } from "@/types/api";

export interface ImageUploadResponse {
  path: string;
  url: string;
}

/**
 * Upload ảnh sân (Owner only)
 * @param file File ảnh (JPG, PNG, max 5MB)
 * @param stadiumId ID sân (optional, null → lưu vào temp)
 */
export async function uploadStadiumImage(
  file: File,
  stadiumId?: number
): Promise<ApiResponse<ImageUploadResponse>> {
  const formData = new FormData();
  formData.append("file", file);
  if (stadiumId) {
    formData.append("stadiumId", String(stadiumId));
  }
  const res = await apiClient.post("/images/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

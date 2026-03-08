import apiClient from "./client";
import type { ApiResponse, PaginatedData } from "@/types/api";
import type { ReviewResponse, ReviewRequest } from "@/types/index";

export async function getStadiumReviews(
  stadiumId: number,
  page = 0,
  size = 10,
  sort = "createdAt,desc"
): Promise<ApiResponse<PaginatedData<ReviewResponse>>> {
  const res = await apiClient.get(
    `/stadiums/${stadiumId}/reviews?page=${page}&size=${size}&sort=${sort}`
  );
  return res.data;
}

export async function getMyReviews(
  page = 0,
  size = 10,
  sort = "createdAt,desc"
): Promise<ApiResponse<PaginatedData<ReviewResponse>>> {
  const res = await apiClient.get(
    `/reviews/my?page=${page}&size=${size}&sort=${sort}`
  );
  return res.data;
}

export async function createReview(
  data: ReviewRequest
): Promise<ApiResponse<ReviewResponse>> {
  const res = await apiClient.post("/reviews", data);
  return res.data;
}

export async function deleteReview(
  id: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.delete(`/reviews/${id}`);
  return res.data;
}

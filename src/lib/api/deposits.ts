import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type { DepositPolicyResponse } from "@/types/index";

export async function getDepositPolicy(
  stadiumId: number
): Promise<ApiResponse<DepositPolicyResponse>> {
  const res = await apiClient.get(`/stadiums/${stadiumId}/deposit-policy`);
  return res.data;
}

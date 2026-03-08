import apiClient from "./client";
import type { ApiResponse, PaginatedData } from "@/types/api";
import type {
  BookingResponse,
  DepositResponse,
  DepositPolicyResponse,
  DepositPolicyRequest,
  RefundRequest,
} from "@/types/index";

// ========================
// Owner Booking APIs
// ========================

export async function getOwnerBookings(
  page = 0,
  size = 10,
  sort = "createdAt,desc"
): Promise<ApiResponse<PaginatedData<BookingResponse>>> {
  const res = await apiClient.get(
    `/owner/bookings?page=${page}&size=${size}&sort=${sort}`
  );
  return res.data;
}

export async function getStadiumBookingsByDate(
  stadiumId: number,
  date: string
): Promise<ApiResponse<BookingResponse[]>> {
  const res = await apiClient.get(
    `/owner/stadiums/${stadiumId}/bookings?date=${date}`
  );
  return res.data;
}

export async function confirmBooking(
  id: number
): Promise<ApiResponse<BookingResponse>> {
  const res = await apiClient.put(`/owner/bookings/${id}/confirm`);
  return res.data;
}

export async function rejectBooking(
  id: number
): Promise<ApiResponse<BookingResponse>> {
  const res = await apiClient.put(`/owner/bookings/${id}/reject`);
  return res.data;
}

export async function completeBooking(
  id: number
): Promise<ApiResponse<BookingResponse>> {
  const res = await apiClient.put(`/owner/bookings/${id}/complete`);
  return res.data;
}

// ========================
// Owner Deposit APIs
// ========================

export async function confirmDeposit(
  id: number
): Promise<ApiResponse<DepositResponse>> {
  const res = await apiClient.put(`/owner/deposits/${id}/confirm`);
  return res.data;
}

export async function rejectDeposit(
  id: number
): Promise<ApiResponse<DepositResponse>> {
  const res = await apiClient.put(`/owner/deposits/${id}/reject`);
  return res.data;
}

export async function refundBooking(
  bookingId: number,
  data?: RefundRequest
): Promise<ApiResponse<DepositResponse>> {
  const res = await apiClient.post(`/owner/bookings/${bookingId}/refund`, data || {});
  return res.data;
}

// ========================
// Deposit Policy API
// ========================

export async function updateDepositPolicy(
  stadiumId: number,
  data: DepositPolicyRequest
): Promise<ApiResponse<DepositPolicyResponse>> {
  const res = await apiClient.put(`/stadiums/${stadiumId}/deposit-policy`, data);
  return res.data;
}

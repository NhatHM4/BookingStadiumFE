import apiClient from "./client";
import type { ApiResponse, PaginatedData } from "@/types/api";
import type {
  BookingResponse,
  BookingRequest,
  DepositResponse,
  DepositRequest,
} from "@/types/index";
import type { BookingStatus } from "@/types/enums";

// ========================
// Customer Booking APIs
// ========================

export async function createBooking(
  data: BookingRequest
): Promise<ApiResponse<BookingResponse>> {
  const res = await apiClient.post("/bookings", data);
  return res.data;
}

export async function getMyBookings(
  status?: BookingStatus,
  page = 0,
  size = 10
): Promise<ApiResponse<PaginatedData<BookingResponse>>> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("size", String(size));
  const res = await apiClient.get(`/bookings/my?${params.toString()}`);
  return res.data;
}

export async function getBooking(
  id: number
): Promise<ApiResponse<BookingResponse>> {
  const res = await apiClient.get(`/bookings/${id}`);
  return res.data;
}

export async function cancelBooking(
  id: number
): Promise<ApiResponse<BookingResponse>> {
  const res = await apiClient.put(`/bookings/${id}/cancel`);
  return res.data;
}

// ========================
// Deposit APIs (Customer)
// ========================

export async function createDeposit(
  bookingId: number,
  data: DepositRequest
): Promise<ApiResponse<DepositResponse>> {
  const res = await apiClient.post(`/bookings/${bookingId}/deposits`, data);
  return res.data;
}

export async function getBookingDeposits(
  bookingId: number
): Promise<ApiResponse<DepositResponse[]>> {
  const res = await apiClient.get(`/bookings/${bookingId}/deposits`);
  return res.data;
}

import apiClient from "./client";
import type { ApiResponse, PaginatedData } from "@/types/api";
import type {
  RecurringBookingResponse,
  RecurringBookingRequest,
  BookingResponse,
} from "@/types/index";
import type { RecurringBookingStatus } from "@/types/enums";

// ========================
// Customer Recurring Booking APIs
// ========================

export async function createRecurringBooking(
  data: RecurringBookingRequest
): Promise<ApiResponse<RecurringBookingResponse>> {
  const res = await apiClient.post("/recurring-bookings", data);
  return res.data;
}

export async function getMyRecurringBookings(
  status?: RecurringBookingStatus,
  page = 0,
  size = 10
): Promise<ApiResponse<PaginatedData<RecurringBookingResponse>>> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("size", String(size));
  const res = await apiClient.get(`/recurring-bookings/my?${params.toString()}`);
  return res.data;
}

export async function getRecurringBooking(
  id: number
): Promise<ApiResponse<RecurringBookingResponse>> {
  const res = await apiClient.get(`/recurring-bookings/${id}`);
  return res.data;
}

export async function cancelRecurringBooking(
  id: number
): Promise<ApiResponse<RecurringBookingResponse>> {
  const res = await apiClient.put(`/recurring-bookings/${id}/cancel`);
  return res.data;
}

export async function cancelSingleSession(
  recurringId: number,
  bookingId: number
): Promise<ApiResponse<BookingResponse>> {
  const res = await apiClient.put(
    `/recurring-bookings/${recurringId}/bookings/${bookingId}/cancel`
  );
  return res.data;
}

// ========================
// Owner Recurring Booking APIs
// ========================

export async function getOwnerRecurringBookings(
  page = 0,
  size = 10
): Promise<ApiResponse<PaginatedData<RecurringBookingResponse>>> {
  const res = await apiClient.get(
    `/owner/recurring-bookings?page=${page}&size=${size}`
  );
  return res.data;
}

export async function confirmRecurringBooking(
  id: number
): Promise<ApiResponse<RecurringBookingResponse>> {
  const res = await apiClient.put(`/owner/recurring-bookings/${id}/confirm`);
  return res.data;
}

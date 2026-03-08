import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  TimeSlotResponse,
  TimeSlotRequest,
  AvailableSlotResponse,
} from "@/types/index";

export async function getTimeSlots(
  fieldId: number
): Promise<ApiResponse<TimeSlotResponse[]>> {
  const res = await apiClient.get(`/fields/${fieldId}/time-slots`);
  return res.data;
}

export async function getAvailableSlots(
  fieldId: number,
  date: string
): Promise<ApiResponse<AvailableSlotResponse[]>> {
  const res = await apiClient.get(
    `/fields/${fieldId}/available-slots?date=${date}`
  );
  return res.data;
}

export async function createTimeSlot(
  fieldId: number,
  data: TimeSlotRequest
): Promise<ApiResponse<TimeSlotResponse>> {
  const res = await apiClient.post(`/fields/${fieldId}/time-slots`, data);
  return res.data;
}

export async function updateTimeSlot(
  id: number,
  data: TimeSlotRequest
): Promise<ApiResponse<TimeSlotResponse>> {
  const res = await apiClient.put(`/time-slots/${id}`, data);
  return res.data;
}

export async function deleteTimeSlot(
  id: number
): Promise<ApiResponse<void>> {
  const res = await apiClient.delete(`/time-slots/${id}`);
  return res.data;
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRecurringBooking,
  getMyRecurringBookings,
  getRecurringBooking,
  cancelRecurringBooking,
  cancelSingleSession,
  getOwnerRecurringBookings,
  confirmRecurringBooking,
} from "@/lib/api/recurring-bookings";
import type { RecurringBookingRequest } from "@/types/index";
import type { RecurringBookingStatus } from "@/types/enums";

// ========================
// Customer Recurring Hooks
// ========================

export function useCreateRecurringBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecurringBookingRequest) => createRecurringBooking(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-recurring"] });
    },
  });
}

export function useMyRecurringBookings(
  status?: RecurringBookingStatus,
  page = 0,
  size = 10
) {
  return useQuery({
    queryKey: ["my-recurring", status, page, size],
    queryFn: () => getMyRecurringBookings(status, page, size),
    select: (res) => res.data,
  });
}

export function useRecurringBooking(id: number) {
  return useQuery({
    queryKey: ["recurring", id],
    queryFn: () => getRecurringBooking(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCancelRecurringBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelRecurringBooking(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["recurring", id] });
      qc.invalidateQueries({ queryKey: ["my-recurring"] });
    },
  });
}

export function useCancelSingleSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      recurringId,
      bookingId,
    }: {
      recurringId: number;
      bookingId: number;
    }) => cancelSingleSession(recurringId, bookingId),
    onSuccess: (_, { recurringId }) => {
      qc.invalidateQueries({ queryKey: ["recurring", recurringId] });
      qc.invalidateQueries({ queryKey: ["my-recurring"] });
    },
  });
}

// ========================
// Owner Recurring Hooks
// ========================

export function useOwnerRecurringBookings(page = 0, size = 10) {
  return useQuery({
    queryKey: ["owner-recurring", page, size],
    queryFn: () => getOwnerRecurringBookings(page, size),
    select: (res) => res.data,
  });
}

export function useConfirmRecurringBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => confirmRecurringBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-recurring"] });
    },
  });
}

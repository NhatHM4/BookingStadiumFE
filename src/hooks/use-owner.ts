import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOwnerStadiums,
  createStadium,
  updateStadium,
  deleteStadium,
} from "@/lib/api/stadiums";
import { createField, updateField, deleteField } from "@/lib/api/fields";
import {
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from "@/lib/api/time-slots";
import {
  getOwnerBookings,
  getStadiumBookingsByDate,
  confirmBooking,
  rejectBooking,
  completeBooking,
  confirmDeposit,
  rejectDeposit,
  refundBooking,
  updateDepositPolicy,
} from "@/lib/api/owner";
import type {
  StadiumRequest,
  FieldRequest,
  TimeSlotRequest,
  DepositPolicyRequest,
  RefundRequest,
} from "@/types/index";

// ========================
// Owner Stadium Hooks
// ========================

export function useOwnerStadiums() {
  return useQuery({
    queryKey: ["owner-stadiums"],
    queryFn: () => getOwnerStadiums(),
    select: (res) => res.data,
  });
}

export function useCreateStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StadiumRequest) => createStadium(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-stadiums"] }),
  });
}

export function useUpdateStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StadiumRequest }) =>
      updateStadium(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-stadiums"] });
      qc.invalidateQueries({ queryKey: ["stadiums"] });
    },
  });
}

export function useDeleteStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStadium(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-stadiums"] }),
  });
}

// ========================
// Field Hooks (Owner)
// ========================

export function useCreateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stadiumId, data }: { stadiumId: number; data: FieldRequest }) =>
      createField(stadiumId, data),
    onSuccess: (_, { stadiumId }) =>
      qc.invalidateQueries({ queryKey: ["fields", stadiumId] }),
  });
}

export function useUpdateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FieldRequest }) =>
      updateField(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fields"] }),
  });
}

export function useDeleteField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteField(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fields"] }),
  });
}

// ========================
// TimeSlot Hooks (Owner)
// ========================

export function useCreateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      fieldId,
      data,
    }: {
      fieldId: number;
      data: TimeSlotRequest;
    }) => createTimeSlot(fieldId, data),
    onSuccess: (_, { fieldId }) =>
      qc.invalidateQueries({ queryKey: ["time-slots", fieldId] }),
  });
}

export function useUpdateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TimeSlotRequest }) =>
      updateTimeSlot(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time-slots"] }),
  });
}

export function useDeleteTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTimeSlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time-slots"] }),
  });
}

// ========================
// Owner Booking Hooks
// ========================

export function useOwnerBookings(page = 0, size = 10) {
  return useQuery({
    queryKey: ["owner-bookings", page, size],
    queryFn: () => getOwnerBookings(page, size),
    select: (res) => res.data,
  });
}

export function useStadiumBookingsByDate(
  stadiumId: number | null,
  date: string | null
) {
  return useQuery({
    queryKey: ["stadium-bookings", stadiumId, date],
    queryFn: () => getStadiumBookingsByDate(stadiumId!, date!),
    select: (res) => res.data,
    enabled: !!stadiumId && !!date,
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => confirmBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      qc.invalidateQueries({ queryKey: ["stadium-bookings"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useRejectBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rejectBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      qc.invalidateQueries({ queryKey: ["stadium-bookings"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCompleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => completeBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      qc.invalidateQueries({ queryKey: ["stadium-bookings"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// ========================
// Owner Deposit Hooks
// ========================

export function useConfirmDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => confirmDeposit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking-deposits"] });
    },
  });
}

export function useRejectDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rejectDeposit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking-deposits"] });
    },
  });
}

export function useRefundBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: number;
      data?: RefundRequest;
    }) => refundBooking(bookingId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      qc.invalidateQueries({ queryKey: ["booking-deposits"] });
    },
  });
}

// ========================
// Deposit Policy Hook
// ========================

export function useUpdateDepositPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      stadiumId,
      data,
    }: {
      stadiumId: number;
      data: DepositPolicyRequest;
    }) => updateDepositPolicy(stadiumId, data),
    onSuccess: (_, { stadiumId }) =>
      qc.invalidateQueries({ queryKey: ["deposit-policy", stadiumId] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  createDeposit,
  getBookingDeposits,
} from "@/lib/api/bookings";
import { createReview, getMyReviews, deleteReview } from "@/lib/api/reviews";
import type { BookingRequest, DepositRequest, ReviewRequest } from "@/types/index";
import type { BookingStatus } from "@/types/enums";

// ========================
// Booking Hooks
// ========================

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookingRequest) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}

export function useMyBookings(status?: BookingStatus, page = 0, size = 10) {
  return useQuery({
    queryKey: ["my-bookings", status, page, size],
    queryFn: () => getMyBookings(status, page, size),
    select: (res) => res.data,
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => getBooking(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}

// ========================
// Deposit Hooks
// ========================

export function useCreateDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: number;
      data: DepositRequest;
    }) => createDeposit(bookingId, data),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["booking-deposits", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}

export function useBookingDeposits(bookingId: number) {
  return useQuery({
    queryKey: ["booking-deposits", bookingId],
    queryFn: () => getBookingDeposits(bookingId),
    select: (res) => res.data,
    enabled: !!bookingId,
  });
}

// ========================
// Review Hooks
// ========================

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewRequest) => createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useMyReviews(page = 0, size = 10) {
  return useQuery({
    queryKey: ["my-reviews", page, size],
    queryFn: () => getMyReviews(page, size),
    select: (res) => res.data,
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

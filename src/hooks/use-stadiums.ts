import { useQuery } from "@tanstack/react-query";
import { getStadiums, getStadium, getNearbyStadiums } from "@/lib/api/stadiums";
import { getFields } from "@/lib/api/fields";
import { getTimeSlots, getAvailableSlots } from "@/lib/api/time-slots";
import { getStadiumReviews } from "@/lib/api/reviews";
import { getDepositPolicy } from "@/lib/api/deposits";
import type { StadiumFilters } from "@/types/index";

export function useStadiums(filters: StadiumFilters = {}) {
  return useQuery({
    queryKey: ["stadiums", filters],
    queryFn: () => getStadiums(filters),
    select: (res) => res.data,
  });
}

export function useStadium(id: number) {
  return useQuery({
    queryKey: ["stadiums", id],
    queryFn: () => getStadium(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useNearbyStadiums(
  lat: number | null,
  lng: number | null,
  radius?: number
) {
  return useQuery({
    queryKey: ["stadiums", "nearby", lat, lng, radius],
    queryFn: () => getNearbyStadiums(lat!, lng!, radius),
    select: (res) => res.data,
    enabled: lat !== null && lng !== null,
  });
}

export function useFields(stadiumId: number) {
  return useQuery({
    queryKey: ["fields", stadiumId],
    queryFn: () => getFields(stadiumId),
    select: (res) => res.data,
    enabled: !!stadiumId,
  });
}

export function useTimeSlots(fieldId: number | null) {
  return useQuery({
    queryKey: ["time-slots", fieldId],
    queryFn: () => getTimeSlots(fieldId!),
    select: (res) => res.data,
    enabled: !!fieldId,
  });
}

export function useAvailableSlots(fieldId: number | null, date: string | null) {
  return useQuery({
    queryKey: ["available-slots", fieldId, date],
    queryFn: () => getAvailableSlots(fieldId!, date!),
    select: (res) => res.data,
    enabled: !!fieldId && !!date,
  });
}

export function useStadiumReviews(
  stadiumId: number,
  page = 0,
  size = 10
) {
  return useQuery({
    queryKey: ["reviews", stadiumId, page, size],
    queryFn: () => getStadiumReviews(stadiumId, page, size),
    select: (res) => res.data,
    enabled: !!stadiumId,
  });
}

export function useDepositPolicy(stadiumId: number) {
  return useQuery({
    queryKey: ["deposit-policy", stadiumId],
    queryFn: () => getDepositPolicy(stadiumId),
    select: (res) => res.data,
    enabled: !!stadiumId,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminUser,
  toggleUserActive,
  getPendingStadiums,
  approveStadium,
  rejectStadium,
} from "@/lib/api/admin";
import type { Role } from "@/types/enums";

// ========================
// Admin Dashboard
// ========================

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getAdminDashboard(),
    select: (res) => res.data,
  });
}

// ========================
// Admin User Hooks
// ========================

export function useAdminUsers(
  role?: Role,
  search?: string,
  page = 0,
  size = 10,
  sort = "createdAt,desc"
) {
  return useQuery({
    queryKey: ["admin-users", role, search, page, size, sort],
    queryFn: () => getAdminUsers(role, search, page, size, sort),
    select: (res) => res.data,
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: ["admin-users", id],
    queryFn: () => getAdminUser(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleUserActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

// ========================
// Admin Stadium Hooks
// ========================

export function usePendingStadiums(page = 0, size = 10) {
  return useQuery({
    queryKey: ["pending-stadiums", page, size],
    queryFn: () => getPendingStadiums(page, size),
    select: (res) => res.data,
  });
}

export function useApproveStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveStadium(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-stadiums"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
}

export function useRejectStadium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rejectStadium(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-stadiums"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
}

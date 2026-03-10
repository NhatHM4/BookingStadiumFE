import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as Vietnamese currency (VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format number with dot separator (e.g., 300.000đ)
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

/**
 * Format date string to Vietnamese locale
 */
export function formatDate(dateStr: string, pattern: string = "dd/MM/yyyy"): string {
  try {
    return format(parseISO(dateStr), pattern, { locale: vi });
  } catch {
    return dateStr;
  }
}

/**
 * Format datetime string
 */
export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch {
    return dateStr;
  }
}

/**
 * Format time (HH:mm)
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

/**
 * Get full image URL from backend static resource path
 * Converts relative paths like "stadiums/1/uuid.jpg" to "http://localhost:8080/uploads/stadiums/1/uuid.jpg"
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // Already a full URL
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Proxy through Next.js to avoid private IP issues with Image Optimization
  const cleanPath = path.startsWith("/") ? path.slice(1) : `uploads/${path}`;
  console.log("getImageUrl:", cleanPath);
  return `/api/${cleanPath}`;
}

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

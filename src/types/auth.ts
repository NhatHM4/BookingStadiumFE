import { AuthProvider, Role } from "./enums";

// ========================
// Request DTOs
// ========================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Role;
}

export interface SocialLoginRequest {
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ========================
// Response DTOs
// ========================

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  authProvider: AuthProvider;
  isActive: boolean;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserResponse;
}

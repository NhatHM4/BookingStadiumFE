import axios from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  JwtResponse,
  LoginRequest,
  RegisterRequest,
  SocialLoginRequest,
} from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function loginApi(
  data: LoginRequest
): Promise<ApiResponse<JwtResponse>> {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data;
}

export async function registerApi(
  data: RegisterRequest
): Promise<ApiResponse<JwtResponse>> {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
}

export async function socialLoginApi(
  data: SocialLoginRequest
): Promise<ApiResponse<JwtResponse>> {
  const res = await axios.post(`${API_URL}/auth/social-login`, data);
  return res.data;
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<ApiResponse<JwtResponse>> {
  const res = await axios.post(`${API_URL}/auth/refresh-token`, {
    refreshToken,
  });
  return res.data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await axios.post(`${API_URL}/auth/logout`, { refreshToken });
}

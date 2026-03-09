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
  try {
    console.log("Calling login API:", `${API_URL}/auth/login`, data);
    const res = await axios.post(`${API_URL}/auth/login`, data);
    return res.data;
  } catch (error: any) {
    console.error("Login API error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message,
    });
    return {
      success: false,
      message: error.response?.data?.message || `Login failed (${error.response?.status || 'Network error'})`,
      data: null as any,
    };
  }
}

export async function registerApi(
  data: RegisterRequest
): Promise<ApiResponse<JwtResponse>> {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    return res.data;
  } catch (error: any) {
    console.error("Register API error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
      data: null as any,
    };
  }
}

export async function socialLoginApi(
  data: SocialLoginRequest
): Promise<ApiResponse<JwtResponse>> {
  try {
    const res = await axios.post(`${API_URL}/auth/social-login`, data);
    return res.data;
  } catch (error: any) {
    console.error("Social login API error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Social login failed",
      data: null as any,
    };
  }
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

import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - BookingStadium",
};

export default function LoginPage() {
  return <LoginForm />;
}

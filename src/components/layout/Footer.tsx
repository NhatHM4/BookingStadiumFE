import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                BS
              </div>
              BookingStadium
            </div>
            <p className="text-sm text-muted-foreground">
              Nền tảng đặt sân bóng đá trực tuyến #1 Việt Nam. Tìm sân, đặt
              sân, ráp kèo dễ dàng.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/stadiums" className="hover:text-foreground transition">
                  Tìm sân
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-foreground transition">
                  Ráp kèo
                </Link>
              </li>
              <li>
                <Link href="/register?role=OWNER" className="hover:text-foreground transition">
                  Đăng ký chủ sân
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-semibold">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Chính sách hoàn tiền
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                TP. Hồ Chí Minh, Việt Nam
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                0901 234 567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@bookingstadium.vn
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BookingStadium. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSearch } from "@/components/home/HeroSearch";
import { OpenMatchesSection } from "@/components/home/OpenMatchesSection";

const quickPoints = [
  "Đặt sân nhanh trong vài chạm",
  "Có thể đặt không cần đăng nhập",
  "Giao diện mượt trên điện thoại",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f8fffe_0%,#eef8ff_55%,#ffffff_100%)]">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(250,204,21,0.18),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(74,222,128,0.16),transparent_35%)]" />

          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                BookingStadium
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                Đặt sân bóng đơn giản,
              </h1>
              <OpenMatchesSection />

              <HeroSearch />

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/stadiums">
                  <Button
                    size="lg"
                    className="h-11 gap-2 rounded-xl bg-sky-600 px-6 text-white shadow-md hover:bg-sky-700"
                  >
                    <MapPin className="h-4 w-4" />
                    Xem danh sách sân
                  </Button>
                </Link>
                <Link href="/stadiums/nearby">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 rounded-xl border-sky-200 bg-white/80 px-6 text-sky-700 hover:bg-sky-50"
                  >
                    Sân gần tôi
                  </Button>
                </Link>
              </div>

              <p className="mt-5 text-sm text-slate-600">
                Có thể{" "}
                <Link
                  href="/bookings/guest"
                  className="font-semibold text-sky-700 underline-offset-4 hover:underline"
                >
                  đặt sân không cần đăng nhập
                </Link>
                .
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {quickPoints.map((point) => (
                <Card key={point} className="border-sky-100 bg-white/80 shadow-sm backdrop-blur">
                  <CardContent className="flex items-center gap-2 px-4 py-4 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {point}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mx-auto mt-8 max-w-3xl border-amber-100 bg-[linear-gradient(120deg,#ffffff_0%,#fff9e8_100%)] shadow-sm">
              <CardContent className="flex flex-col items-start justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-700">
                  Bạn là chủ sân? Đăng ký để quản lý lịch sân và nhận booking trực tuyến.
                </p>
                <Link href="/register?role=OWNER">
                  <Button
                    variant="ghost"
                    className="h-10 gap-2 rounded-xl px-3 text-amber-700 hover:bg-amber-100/60"
                  >
                    Trở thành chủ sân
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-11 rounded-xl bg-emerald-600 px-6 text-white hover:bg-emerald-700"
                >
                  Đăng ký miễn phí
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import { MapPin, CalendarDays, Swords, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSearch } from "@/components/home/HeroSearch";

const features = [
  {
    icon: MapPin,
    title: "Tìm sân nhanh",
    description: "Tìm sân bóng gần bạn theo khu vực, loại sân và giá cả phù hợp.",
  },
  {
    icon: CalendarDays,
    title: "Đặt sân dễ dàng",
    description: "Xem lịch trống, chọn khung giờ và đặt sân chỉ trong vài bước.",
  },
  {
    icon: Swords,
    title: "Ráp kèo thú vị",
    description: "Đăng kèo tìm đối thủ hoặc nhận kèo từ các đội khác.",
  },
  {
    icon: Star,
    title: "Đánh giá sân",
    description: "Xem đánh giá từ người chơi khác để chọn sân chất lượng nhất.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Đặt sân bóng đá{" "}
              <span className="text-primary">online</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Nền tảng đặt sân bóng đá trực tuyến #1 Việt Nam. Tìm sân gần
              bạn, đặt sân nhanh chóng, ráp kèo tìm đối thủ.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/stadiums">
                <Button size="lg" className="gap-2 text-base px-8">
                  <MapPin className="h-5 w-5" />
                  Tìm sân ngay
                </Button>
              </Link>
              <Link href="/stadiums/nearby">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                  Sân gần tôi
                </Button>
              </Link>
              <Link href="/register?role=OWNER">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                  Đăng ký chủ sân
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <HeroSearch />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Tại sao chọn BookingStadium?</h2>
              <p className="mt-3 text-muted-foreground">
                Giải pháp toàn diện cho việc đặt sân bóng đá
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Đặt sân chỉ 3 bước</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Tìm sân",
                  description:
                    "Tìm kiếm sân theo khu vực, loại sân (5/7/11 người) và giá cả.",
                },
                {
                  step: "2",
                  title: "Chọn giờ & Đặt sân",
                  description:
                    "Xem lịch trống, chọn khung giờ phù hợp và xác nhận đặt sân.",
                },
                {
                  step: "3",
                  title: "Đặt cọc & Chơi bóng",
                  description:
                    "Đặt cọc qua chuyển khoản/MoMo/ZaloPay và đến sân đúng giờ.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Bắt đầu đặt sân ngay hôm nay!</h2>
            <p className="mt-4 text-lg opacity-90">
              Hàng trăm sân bóng đang chờ bạn. Đăng ký miễn phí.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8"
                >
                  Đăng ký miễn phí
                </Button>
              </Link>
              <Link href="/stadiums">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Xem danh sách sân
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

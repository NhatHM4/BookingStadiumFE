"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Repeat,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { useState } from "react";

const sidebarNav = [
  {
    title: "Tổng quan",
    href: "/owner",
    icon: LayoutDashboard,
  },
  {
    title: "Sân của tôi",
    href: "/owner/stadiums",
    icon: Building2,
  },
  {
    title: "Đơn đặt sân",
    href: "/owner/bookings",
    icon: CalendarDays,
  },
  {
    title: "Đặt định kỳ",
    href: "/owner/recurring",
    icon: Repeat,
  },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <nav className="space-y-1">
      {sidebarNav.map((item) => {
        const isActive =
          item.href === "/owner"
            ? pathname === "/owner"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-card p-4">
          <h2 className="px-3 text-lg font-semibold mb-4">Quản lý sân</h2>
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Mobile sidebar */}
        <div className="lg:hidden fixed bottom-4 left-4 z-50">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button size="icon" className="rounded-full shadow-lg h-12 w-12">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 pt-12">
              <h2 className="px-3 text-lg font-semibold mb-4">Quản lý sân</h2>
              <SidebarContent pathname={pathname} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

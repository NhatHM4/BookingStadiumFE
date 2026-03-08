"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Menu,
  Trophy,
  CalendarDays,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { UserMenu } from "./UserMenu";
import { useState } from "react";

const publicLinks = [
  { href: "/stadiums", label: "Tìm sân", icon: MapPin },
  { href: "/matches", label: "Ráp kèo", icon: Swords },
];

const customerLinks = [
  { href: "/bookings", label: "Đặt sân", icon: CalendarDays },
  { href: "/teams", label: "Đội bóng", icon: Trophy },
];

export function Header() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = status === "authenticated";
  const role = session?.user?.role;

  const navLinks = [
    ...publicLinks,
    ...(isLoggedIn && role === "CUSTOMER" ? customerLinks : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            BS
          </div>
          <span className="hidden sm:inline-block">BookingStadium</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm" className="gap-2">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden"
              render={<Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>}
            />
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}

                {!isLoggedIn && (
                  <>
                    <hr className="my-2" />
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button className="w-full">Đăng ký</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

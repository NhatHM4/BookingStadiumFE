"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  Trophy,
  Star,
  Settings,
  Shield,
  Swords,
  Repeat,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutApi } from "@/lib/api/auth";

export function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      if (session?.refreshToken) {
        await logoutApi(session.refreshToken);
      }
    } catch {
      // Ignore logout API errors
    }
    await signOut({ callbackUrl: "/" });
  };

  const menuItems = {
    CUSTOMER: [
      { href: "/bookings", label: "Đơn đặt sân", icon: CalendarDays },
      { href: "/recurring-bookings", label: "Đặt định kỳ", icon: Repeat },
      { href: "/teams", label: "Đội bóng", icon: Trophy },
      { href: "/matches/my", label: "Trận đấu", icon: Swords },
      { href: "/reviews", label: "Đánh giá", icon: Star },
    ],
    OWNER: [
      { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
      { href: "/owner/stadiums", label: "Quản lý sân", icon: Settings },
      { href: "/owner/bookings", label: "Đơn đặt sân", icon: CalendarDays },
      { href: "/owner/recurring", label: "Đặt định kỳ", icon: Repeat },
    ],
    ADMIN: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Quản lý users", icon: User },
      { href: "/admin/stadiums", label: "Duyệt sân", icon: Shield },
    ],
  };

  const roleItems = menuItems[user.role as keyof typeof menuItems] || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image || undefined} alt={user.name || ""} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {roleItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

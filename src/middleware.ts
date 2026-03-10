import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Skip middleware for API routes completely
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Public routes - no protection needed
  const publicRoutes = ["/", "/login", "/register", "/stadiums", "/matches", "/bookings/guest"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Auth routes (login, register) - redirect if already logged in
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && isLoggedIn) {
    // Redirect logged-in users away from auth pages
    if (userRole === "OWNER") {
      return NextResponse.redirect(new URL("/owner", req.url));
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Owner routes
  if (pathname.startsWith("/owner")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (userRole !== "OWNER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protected customer routes
  const protectedRoutes = ["/bookings", "/teams", "/reviews", "/recurring-bookings", "/matches/my", "/matches/new"];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|images).*)",
  ],
};

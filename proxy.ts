import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  const { pathname } = request.nextUrl;

  const publicRoutes = [
    "/login"
  ];
  const isRootPath = pathname === "/";

  // Check if pathname is a public route from (public) directory
  // (public)/page.tsx -> / (root)
  // (public)/[uid]/page.tsx -> /[uid] (single segment path)
  const isPublicPageRoute = (path: string): boolean => {
    // Root path is public
    if (path === "/") return true;

    // Single segment paths (e.g., /about, /terms) are public routes from (public)/[uid]
    // Exclude paths that start with known protected prefixes
    const protectedPrefixes = [
      "/requests",
      "/customers",
      "/settings",
      "/api",
      "/_next",
    ];

    // Check if it's a single segment path (matches /[uid] pattern)
    // Pattern: / followed by one or more non-slash characters, then end
    const isSingleSegment = /^\/[^/]+$/.test(path);

    // Don't treat protected routes as public
    const isProtected = protectedPrefixes.some((prefix) =>
      path.startsWith(prefix),
    );

    return isSingleSegment && !isProtected;
  };

  const isPublicRoute =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    isRootPath ||
    isPublicPageRoute(pathname);

  // Redirect authenticated users with completed flow away from public routes
  if (
    token &&
    isPublicRoute
  ) {
    const homeUrl = new URL("/requests", request.url);
    return NextResponse.redirect(homeUrl);
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except these (for assets & API)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|fonts).*)"],
};

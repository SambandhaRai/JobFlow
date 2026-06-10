import { NextRequest, NextResponse } from "next/server";

type CookieUser = {
    role?: "user" | "employer" | "admin";
};

const publicRoutes = ["/login", "/sign-up"];
const adminRoutes = ["/admin"];
const userRoutes = [
    "/discover",
    "/profile",
    "/for-you",
    "/saved",
    "/applications",
    "/notifications",
];

const parseUserCookie = (value?: string): CookieUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as CookieUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as CookieUser;
        } catch {
            return null;
        }
    }
};

const startsWithRoute = (pathname: string, routes: string[]) => (
    routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
);

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value ?? null;
    const user = token ? parseUserCookie(request.cookies.get("user_data")?.value) : null;

    const isPublicRoute = startsWithRoute(pathname, publicRoutes);
    const isAdminRoute = startsWithRoute(pathname, adminRoutes);
    const isUserRoute = startsWithRoute(pathname, userRoutes);
    const isHomeRoute = pathname === "/";

    if (!token && (isAdminRoute || isUserRoute)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && user?.role === "admin") {
        if (isHomeRoute || isPublicRoute || isUserRoute) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    if (token && user?.role === "user") {
        if (isAdminRoute || isPublicRoute || isHomeRoute) {
            return NextResponse.redirect(new URL("/discover", request.url));
        }
    }

    if (isPublicRoute && token && !user) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/admin/:path*",
        "/discover/:path*",
        "/profile/:path*",
        "/for-you/:path*",
        "/saved/:path*",
        "/applications/:path*",
        "/notifications/:path*",
        "/login",
        "/sign-up",
    ],
};

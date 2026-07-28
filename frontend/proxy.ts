import { NextRequest, NextResponse } from "next/server";

type CookieUser = {
    role?: "user" | "employer" | "admin";
};

const publicRoutes = ["/login", "/sign-up", "/employer-login", "/employer-signup"];
const adminRoutes = ["/admin"];
const employerRoutes = ["/employer"];
const userRoutes = [
    "/discover",
    "/profile",
    "/for-you",
    "/saved",
    "/applications",
    "/notifications",
    "/reports",
    "/help",
    // Job details render the signed-in app shell, so they need a session too.
    // Public entry points are "/" and the /companies directory.
    "/jobs",
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
    const { pathname, search } = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value ?? null;
    const user = token ? parseUserCookie(request.cookies.get("user_data")?.value) : null;

    const isPublicRoute = startsWithRoute(pathname, publicRoutes);
    const isAdminRoute = startsWithRoute(pathname, adminRoutes);
    const isEmployerRoute = startsWithRoute(pathname, employerRoutes);
    const isUserRoute = startsWithRoute(pathname, userRoutes);
    const isHomeRoute = pathname === "/";

    if (!token && (isAdminRoute || isEmployerRoute || isUserRoute)) {
        // Employers get their own login; everyone else the job seeker one.
        const loginUrl = new URL(isEmployerRoute ? "/employer-login" : "/login", request.url);
        // Remember the destination so login can return them to it.
        loginUrl.searchParams.set("next", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    if (token && user?.role === "admin") {
        if (isHomeRoute || isPublicRoute || isUserRoute || isEmployerRoute) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    if (token && user?.role === "employer") {
        if (isHomeRoute || isPublicRoute || isUserRoute || isAdminRoute) {
            return NextResponse.redirect(new URL("/employer", request.url));
        }
    }

    if (token && user?.role === "user") {
        if (isAdminRoute || isEmployerRoute || isPublicRoute || isHomeRoute) {
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
        "/employer/:path*",
        "/discover/:path*",
        "/jobs/:path*",
        "/profile/:path*",
        "/for-you/:path*",
        "/saved/:path*",
        "/applications/:path*",
        "/notifications/:path*",
        "/reports/:path*",
        "/help/:path*",
        "/login",
        "/sign-up",
        "/employer-login",
        "/employer-signup",
    ],
};

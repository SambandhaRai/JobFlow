import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import AdminNav from "./_components/AdminNav";
import LogoutButton from "../_components/LogoutButton";
import ThemeToggle from "../_components/ThemeToggle";

export const dynamic = "force-dynamic";

type CookieUser = {
    fullName?: string;
    email?: string;
    role?: string;
};

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

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const user = parseUserCookie(cookieStore.get("user_data")?.value);

    if (!token || user?.role !== "admin") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-ink-200 bg-surface">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold text-ink-900">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cobalt-500 text-xs font-bold text-white">
                            JF
                        </span>
                        JobFlow Admin
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="hidden truncate text-sm text-ink-500 sm:inline">{user?.email ?? "Admin"}</span>
                        <ThemeToggle />
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                <AdminNav />
                <div className="mt-6">{children}</div>
            </main>
        </div>
    );
}

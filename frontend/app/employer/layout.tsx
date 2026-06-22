import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import LogoutButton from "../_components/LogoutButton";
import ThemeToggle from "../_components/ThemeToggle";

export const dynamic = "force-dynamic";

type CookieUser = {
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

export default async function EmployerLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const user = parseUserCookie(cookieStore.get("user_data")?.value);

    if (!token || user?.role !== "employer") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-ink-200 bg-surface">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-6">
                        <Link href="/employer/jobs" className="flex items-center gap-2 font-semibold text-ink-900">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cobalt-500 text-xs font-bold text-white">
                                JF
                            </span>
                            JobFlow Employer
                        </Link>
                        <nav className="hidden items-center gap-4 text-sm sm:flex">
                            <Link href="/employer/jobs" className="text-ink-600 transition-colors hover:text-ink-900">
                                Jobs
                            </Link>
                            <Link href="/employer/company" className="text-ink-600 transition-colors hover:text-ink-900">
                                Company
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden truncate text-sm text-ink-500 sm:inline">{user?.email ?? "Employer"}</span>
                        <ThemeToggle />
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </div>
    );
}

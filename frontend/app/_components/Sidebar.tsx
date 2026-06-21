"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    AlignLeft,
    Bookmark,
    FileText,
    Bell,
    File,
    LogOut,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    UserRound,
} from "lucide-react";
import CompanyAvatar from "./CompanyAvatar";
import { getSavedJobs } from "../../lib/api/user/user";
import { getMyApplications } from "../../lib/api/application/application";
import { navCountsStore, type NavCounts } from "../../lib/stores/navCounts";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { resolveAvatarUrl } from "../../lib/avatar";

const SIDEBAR_STORAGE_KEY = "jobflow-sidebar-collapsed";
const SIDEBAR_EXPANDED_WIDTH = "232px";
const SIDEBAR_COLLAPSED_WIDTH = "76px";

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
}

const JOB_SEARCH_NAV: NavItem[] = [
    { label: "Discover", href: "/discover", icon: <AlignLeft size={16} /> },
    { label: "Saved", href: "/saved", icon: <Bookmark size={16} /> },
    { label: "Applications", href: "/applications", icon: <FileText size={16} /> },
    { label: "Notifications", href: "/notifications", icon: <Bell size={16} /> },
];

const PROFILE_NAV: NavItem[] = [
    { label: "Profile", href: "/profile", icon: <UserRound size={16} /> },
    { label: "Resume", href: "/profile/resume", icon: <File size={16} /> },
];

interface ProfileCompletion {
    percent: number;
    hint: string;
}

interface SidebarUser {
    name: string;
    subtitle: string;
}

interface SidebarProps {
    user: SidebarUser;
    profileCompletion?: ProfileCompletion;
}

function NavLink({
    item,
    active,
    compact,
    count,
}: {
    item: NavItem;
    active: boolean;
    compact: boolean;
    count?: number;
}) {
    const hasCount = typeof count === "number" && count > 0;

    return (
        <Link
            href={item.href}
            title={compact ? item.label : undefined}
            aria-label={compact ? `${item.label}${hasCount ? `, ${count}` : ""}` : undefined}
            className={[
                "relative flex items-center rounded-md text-sm transition-colors duration-150",
                compact ? "mx-auto h-10 w-10 justify-center" : "gap-2.5 px-3 py-2",
                active
                    ? "bg-surface text-ink-900 font-medium shadow-card"
                    : "text-ink-500 hover:bg-surface/70 hover:text-ink-900",
            ].join(" ")}
        >
            <span className={active ? "text-ink-700" : "text-ink-400"}>
                {item.icon}
            </span>
            {!compact && <span className="flex-1">{item.label}</span>}
            {!compact && hasCount && (
                <span
                    className={[
                        "rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                        active ? "bg-cobalt-500 text-white" : "bg-ink-100 text-ink-500",
                    ].join(" ")}
                >
                    {count}
                </span>
            )}
            {compact && hasCount && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cobalt-500 ring-2 ring-cobalt-50" />
            )}
        </Link>
    );
}

export default function Sidebar({ user, profileCompletion }: SidebarProps) {
    const pathname = usePathname();
    const { user: authUser, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const avatarUrl = resolveAvatarUrl(authUser?.profilePicture as string | undefined);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const counts = useSyncExternalStore(
        navCountsStore.subscribe,
        navCountsStore.getSnapshot,
        navCountsStore.getServerSnapshot,
    );

    useEffect(() => {
        let cancelled = false;

        const loadCounts = async () => {
            const [savedResult, applicationsResult] = await Promise.allSettled([
                getSavedJobs(),
                getMyApplications(),
            ]);
            if (cancelled) return;

            const next: NavCounts = {};

            if (savedResult.status === "fulfilled") {
                const data = (savedResult.value as { data?: unknown[] })?.data;
                if (Array.isArray(data)) next.saved = data.length;
            }

            if (applicationsResult.status === "fulfilled") {
                const value = applicationsResult.value as { data?: unknown[]; totalApplications?: number };
                next.applications = value?.totalApplications
                    ?? (Array.isArray(value?.data) ? value.data.length : undefined);
            }

            navCountsStore.set(next);
        };

        void loadCounts();

        return () => {
            cancelled = true;
        };
    }, []);

    const navCountFor = (href: string) => {
        if (href === "/saved") return counts.saved;
        if (href === "/applications") return counts.applications;
        if (href === "/notifications") return unreadCount;
        return undefined;
    };

    useEffect(() => {
        const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
        const storedCollapsed = storedValue === "true";
        const frame = window.requestAnimationFrame(() => {
            setIsCollapsed(storedCollapsed);
        });

        document.documentElement.style.setProperty(
            "--app-sidebar-width",
            storedCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        );

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed((current) => {
            const next = !current;

            window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
            document.documentElement.style.setProperty(
                "--app-sidebar-width",
                next ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
            );

            return next;
        });
    };

    return (
        <aside
            className={[
                "fixed left-0 top-0 z-20 hidden h-full flex-col bg-cobalt-50 transition-[width] duration-200 lg:flex",
                isCollapsed ? "w-[76px]" : "w-sidebar",
            ].join(" ")}
        >
            <div className={["px-4 pt-5 pb-4", isCollapsed ? "space-y-3" : ""].join(" ")}>
                <div className={["flex items-center", isCollapsed ? "justify-center" : "justify-between gap-3"].join(" ")}>
                    <Link href="/" className="flex min-w-0 items-center gap-2" title="JobFlow">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cobalt-500 text-xs font-bold text-white font-display">
                            JF
                        </div>
                        {!isCollapsed && (
                            <span className="truncate font-semibold text-ink-900 font-display text-base tracking-tight">
                                JobFlow
                            </span>
                        )}
                    </Link>
                    {!isCollapsed && (
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-surface/70 hover:text-ink-900"
                            aria-label="Collapse sidebar"
                            title="Collapse sidebar"
                        >
                            <PanelLeftClose size={16} />
                        </button>
                    )}
                </div>

                {isCollapsed && (
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-surface/70 hover:text-ink-900"
                        aria-label="Expand sidebar"
                        title="Expand sidebar"
                    >
                        <PanelLeftOpen size={16} />
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto px-2">
                {!isCollapsed && (
                    <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                        Job Search
                    </p>
                )}
                <ul className="space-y-0.5 mb-5">
                    {JOB_SEARCH_NAV.map((item) => (
                        <li key={item.href}>
                            <NavLink
                                item={item}
                                active={pathname === item.href}
                                compact={isCollapsed}
                                count={navCountFor(item.href)}
                            />
                        </li>
                    ))}
                </ul>

                {!isCollapsed && (
                    <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                        My Profile
                    </p>
                )}
                <ul className="space-y-0.5">
                    {PROFILE_NAV.map((item) => (
                        <li key={item.href}>
                            <NavLink item={item} active={pathname === item.href} compact={isCollapsed} />
                        </li>
                    ))}
                </ul>
            </nav>

            {profileCompletion && !isCollapsed && (
                <div className="mx-4 mb-4 rounded-md bg-surface p-3 shadow-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-ink-700">
                            Profile {profileCompletion.percent}% done
                        </span>
                        <ChevronRight size={14} className="text-ink-400" />
                    </div>
                    <div className="h-1 bg-ink-200 rounded-full mb-2">
                        <div
                            className="h-1 bg-cobalt-500 rounded-full transition-all"
                            style={{ width: `${profileCompletion.percent}%` }}
                        />
                    </div>
                    <p className="text-xs text-ink-500">{profileCompletion.hint}</p>
                </div>
            )}

            <div className={["pb-5 pt-1", isCollapsed ? "px-2" : "px-4"].join(" ")}>
                <div className={["flex items-center", isCollapsed ? "flex-col gap-2" : "gap-2.5"].join(" ")}>
                    <CompanyAvatar name={user.name} size="sm" imageUrl={avatarUrl} className="rounded-full bg-cobalt-500 text-white" />
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-900 truncate leading-tight">
                                {user.name}
                            </p>
                            <p className="text-xs text-ink-500 truncate">{user.subtitle}</p>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => void logout()}
                        title="Log out"
                        aria-label="Log out"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-surface/70 hover:text-danger-700"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

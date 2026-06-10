"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    AlignLeft,
    Star,
    Bookmark,
    FileText,
    Bell,
    File,
    Settings,
    ChevronRight,
} from "lucide-react";
import CompanyAvatar from "./CompanyAvatar";

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    badge?: number;
    badgeDot?: boolean;
}

const JOB_SEARCH_NAV: NavItem[] = [
    { label: "Discover", href: "/discover", icon: <AlignLeft size={16} /> },
    { label: "For you", href: "/for-you", icon: <Star size={16} />, badge: 24 },
    { label: "Saved", href: "/saved", icon: <Bookmark size={16} />, badge: 12 },
    { label: "Applications", href: "/applications", icon: <FileText size={16} />, badge: 8 },
    { label: "Notifications", href: "/notifications", icon: <Bell size={16} />, badgeDot: true, badge: 3 },
];

const PROFILE_NAV: NavItem[] = [
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

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
    return (
        <Link
            href={item.href}
            className={[
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150",
                active
                    ? "bg-surface text-ink-900 font-medium shadow-card"
                    : "text-ink-500 hover:bg-surface/70 hover:text-ink-900",
            ].join(" ")}
        >
            <span className={active ? "text-ink-700" : "text-ink-400"}>
                {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && (
                <span
                    className={[
                        "text-xs font-medium px-1.5 py-0.5 rounded-full min-w-5 text-center",
                        item.badgeDot
                            ? "bg-danger-50 text-danger-700"
                            : active
                                ? "bg-cobalt-100 text-cobalt-700"
                                : "bg-ink-100 text-ink-500",
                    ].join(" ")}
                >
                    {item.badgeDot && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger-500 mr-1 align-middle" />
                    )}
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

export default function Sidebar({ user, profileCompletion }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-20 hidden h-full w-sidebar flex-col bg-cobalt-50 lg:flex">
            {/* Logo */}
            <div className="px-4 pt-5 pb-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cobalt-500 flex items-center justify-center text-white text-xs font-bold font-display">
                        JF
                    </div>
                    <span className="font-semibold text-ink-900 font-display text-base tracking-tight">
                        JobFlow
                    </span>
                </Link>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 px-2 overflow-y-auto">
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                    Job Search
                </p>
                <ul className="space-y-0.5 mb-5">
                    {JOB_SEARCH_NAV.map((item) => (
                        <li key={item.href}>
                            <NavLink item={item} active={pathname === item.href} />
                        </li>
                    ))}
                </ul>

                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                    My Profile
                </p>
                <ul className="space-y-0.5">
                    {PROFILE_NAV.map((item) => (
                        <li key={item.href}>
                            <NavLink item={item} active={pathname === item.href} />
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Profile completion card */}
            {profileCompletion && (
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

            {/* User footer */}
            <div className="flex items-center gap-2.5 px-4 pb-5 pt-1">
                <CompanyAvatar name={user.name} size="sm" className="rounded-full bg-cobalt-500 text-white" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate leading-tight">
                        {user.name}
                    </p>
                    <p className="text-xs text-ink-500 truncate">{user.subtitle}</p>
                </div>
                <button
                    type="button"
                    className="text-ink-400 hover:text-ink-600 transition-colors"
                    aria-label="Settings"
                >
                    <Settings size={15} />
                </button>
            </div>
        </aside>
    );
}

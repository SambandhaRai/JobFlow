"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Globe, LogOut, Search, Settings } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import CompanyAvatar from "./CompanyAvatar";

interface TopBarProps {
    userName: string;
    notificationCount?: number;
    onSearch?: (query: string) => void;
    defaultSearchValue?: string;
}

export default function TopBar({
    userName,
    notificationCount = 0,
    onSearch,
    defaultSearchValue = "",
}: TopBarProps) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();

    useEffect(() => {
        if (!isProfileMenuOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!profileMenuRef.current?.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsProfileMenuOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isProfileMenuOpen]);

    const handleLogout = async () => {
        setIsProfileMenuOpen(false);
        await logout();
    };

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-ink-100 bg-surface px-6">
            {/* Search */}
            <form action="/discover" className="w-full max-w-xl">
                <div className="relative">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                    />
                    <input
                        name="search"
                        type="search"
                        defaultValue={defaultSearchValue}
                        onChange={(e) => onSearch?.(e.target.value)}
                        placeholder="Search by role, skill, or company..."
                        className="w-full h-9 pl-9 pr-12 text-sm text-ink-900 bg-ink-50 border border-ink-200 rounded-md outline-none placeholder:text-ink-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100 transition-colors"
                    />
                </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-3 ml-auto">
                <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition-colors"
                    aria-label="Language"
                >
                    <Globe size={16} />
                    <span className="text-xs font-medium">EN</span>
                </button>

                <button
                    type="button"
                    className="relative text-ink-500 hover:text-ink-800 transition-colors"
                    aria-label={`${notificationCount} notifications`}
                >
                    <Bell size={18} />
                    {notificationCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-surface" />
                    )}
                </button>

                <div ref={profileMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setIsProfileMenuOpen((current) => !current)}
                        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-500"
                        aria-label="Profile menu"
                        aria-expanded={isProfileMenuOpen}
                        aria-haspopup="menu"
                    >
                        <CompanyAvatar name={userName} size="sm" className="rounded-full bg-cobalt-500 text-white" />
                    </button>

                    {isProfileMenuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-lg border border-ink-100 bg-surface py-1 shadow-popover"
                        >
                            <Link
                                href="/profile/setup"
                                role="menuitem"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex min-h-10 items-center gap-2 px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                            >
                                <Settings size={15} className="text-ink-400" />
                                Settings
                            </Link>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleLogout}
                                className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm font-medium text-danger-700 transition-colors hover:bg-danger-50"
                            >
                                <LogOut size={15} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

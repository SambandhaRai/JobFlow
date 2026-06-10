"use client";

import { Search, Globe, Bell } from "lucide-react";
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
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-ink-100 bg-surface px-6">
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

                <button
                    type="button"
                    className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-500"
                    aria-label="Profile menu"
                >
                    <CompanyAvatar name={userName} size="sm" className="rounded-full bg-cobalt-500 text-white" />
                </button>
            </div>
        </header>
    );
}

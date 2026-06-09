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
        <header className="h-14 bg-surface border-b border-ink-200 flex items-center px-5 gap-4 sticky top-0 z-10">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                    />
                    <input
                        type="search"
                        defaultValue={defaultSearchValue}
                        onChange={(e) => onSearch?.(e.target.value)}
                        placeholder="Search by role, skill, or company..."
                        className="w-full h-9 pl-9 pr-12 text-sm text-ink-900 bg-ink-50 border border-ink-200 rounded-md outline-none placeholder:text-ink-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100 transition-colors"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ink-400 font-mono border border-ink-200 rounded px-1 py-0.5 bg-surface">
                        ⌘K
                    </kbd>
                </div>
            </div>

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
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-500"
                    aria-label="Profile menu"
                >
                    <CompanyAvatar name={userName} size="sm" />
                </button>
            </div>
        </header>
    );
}

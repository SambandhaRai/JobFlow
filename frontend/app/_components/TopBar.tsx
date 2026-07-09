"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, Search, Settings, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { resolveAvatarUrl } from "../../lib/avatar";
import CompanyAvatar from "./CompanyAvatar";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

interface TopBarProps {
    userName: string;
    defaultSearchValue?: string;
}

function TopBarContent({
    userName,
    defaultSearchValue = "",
}: TopBarProps) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { user: authUser, logout } = useAuth();
    const avatarUrl = resolveAvatarUrl(authUser?.profilePicture as string | undefined);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(defaultSearchValue);
    const [lastDefaultSearch, setLastDefaultSearch] = useState(defaultSearchValue);

    if (defaultSearchValue !== lastDefaultSearch) {
        setLastDefaultSearch(defaultSearchValue);
        setSearchValue(defaultSearchValue);
    }

    const buildDiscoverHref = (term: string) => {
        const params = new URLSearchParams(pathname === "/discover" ? searchParams.toString() : "");
        const trimmed = term.trim();

        if (trimmed) {
            params.set("search", trimmed);
        } else {
            params.delete("search");
        }
        params.delete("page");

        const query = params.toString();
        return query ? `/discover?${query}` : "/discover";
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.push(buildDiscoverHref(searchValue));
    };

    const handleSearchClear = () => {
        setSearchValue("");
        if (pathname === "/discover" && searchParams.has("search")) {
            router.push(buildDiscoverHref(""));
        }
        searchInputRef.current?.focus();
    };

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
            <form onSubmit={handleSearchSubmit} role="search" className="w-full max-w-xl">
                <div className="relative">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                    />
                    <input
                        ref={searchInputRef}
                        name="search"
                        type="search"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search by role, skill, or company..."
                        className="h-9 w-full rounded-md border border-ink-200 bg-ink-50 pl-9 pr-9 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100 [&::-webkit-search-cancel-button]:appearance-none"
                    />
                    {searchValue && (
                        <button
                            type="button"
                            onClick={handleSearchClear}
                            aria-label="Clear search"
                            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-700"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </form>

            <div className="flex items-center gap-1 ml-auto">

                <ThemeToggle />

                <NotificationBell />

                <div
                    ref={profileMenuRef}
                    className="relative ml-1 flex items-center"
                    onMouseEnter={() => setIsProfileMenuOpen(true)}
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                    onFocus={() => setIsProfileMenuOpen(true)}
                    onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                            setIsProfileMenuOpen(false);
                        }
                    }}
                >
                    <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-500"
                        aria-label="View profile"
                        aria-expanded={isProfileMenuOpen}
                        aria-haspopup="menu"
                    >
                        <CompanyAvatar name={userName} size="sm" imageUrl={avatarUrl} fallbackTone="brand" className="rounded-full" />
                    </Link>

                    {isProfileMenuOpen && (
                        <div className="absolute right-0 top-full z-30 w-48 pt-2">
                            <div
                                role="menu"
                                className="overflow-hidden rounded-lg border border-ink-100 bg-surface py-1 shadow-popover"
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
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default function TopBar(props: TopBarProps) {
    return (
        <Suspense fallback={<header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-ink-100 bg-surface px-6" />}>
            <TopBarContent {...props} />
        </Suspense>
    );
}

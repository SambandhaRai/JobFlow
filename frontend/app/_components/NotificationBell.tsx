"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import { useNotifications } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";
import type { NotificationItem as NotificationData } from "../../lib/api/notification/notification";

const PANEL_LIMIT = 6;

export default function NotificationBell() {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!panelRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleSelect = (notification: NotificationData) => {
        setIsOpen(false);
        if (!notification.isRead) void markRead(notification._id);
    };

    const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);
    const visible = notifications.slice(0, PANEL_LIMIT);

    return (
        <div ref={panelRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="relative text-ink-500 transition-colors hover:text-ink-800"
                aria-label={`${unreadCount} unread notifications`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-surface">
                        {badgeLabel}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-11 z-30 w-80 overflow-hidden rounded-lg border border-ink-100 bg-surface shadow-popover sm:w-96"
                >
                    <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                        <p className="text-sm font-semibold text-ink-900">Notifications</p>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => void markAllRead()}
                                className="inline-flex items-center gap-1 text-xs font-medium text-cobalt-600 transition-colors hover:text-cobalt-700"
                            >
                                <CheckCheck size={13} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {visible.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                            <Bell size={20} className="mx-auto text-ink-300" />
                            <p className="mt-2 text-sm text-ink-500">You&apos;re all caught up</p>
                            <p className="mt-0.5 text-xs text-ink-400">
                                Updates on your applications will show up here.
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-96 divide-y divide-ink-100 overflow-y-auto">
                            {visible.map((notification) => (
                                <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </div>
                    )}

                    <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block border-t border-ink-100 px-4 py-3 text-center text-sm font-medium text-cobalt-600 transition-colors hover:bg-ink-50 hover:text-cobalt-700"
                    >
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );
}

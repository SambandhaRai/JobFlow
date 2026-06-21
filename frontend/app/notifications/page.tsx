"use client";

import { Bell, CheckCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import type { NotificationItem as NotificationData } from "../../lib/api/notification/notification";
import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";
import NotificationItem from "../_components/NotificationItem";

type NotificationGroup = { label: string; items: NotificationData[] };

// Buckets notifications (already newest-first from the API) into familiar
// time sections so the feed is easy to scan.
function groupByDate(items: NotificationData[]): NotificationGroup[] {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;

    const today: NotificationData[] = [];
    const week: NotificationData[] = [];
    const older: NotificationData[] = [];

    for (const item of items) {
        const time = new Date(item.createdAt).getTime();
        if (!Number.isNaN(time) && time >= startOfToday) today.push(item);
        else if (!Number.isNaN(time) && time >= startOfWeek) week.push(item);
        else older.push(item);
    }

    return [
        { label: "Today", items: today },
        { label: "Earlier this week", items: week },
        { label: "Older", items: older },
    ].filter((group) => group.items.length > 0);
}

function SkeletonList() {
    return (
        <div className="mt-5 overflow-hidden rounded-lg border border-ink-100 bg-surface shadow-card">
            <div className="animate-pulse divide-y divide-ink-100">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex gap-3 px-4 py-3.5">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-ink-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-36 rounded bg-ink-100" />
                            <div className="h-3 w-56 rounded bg-ink-50" />
                            <div className="h-2.5 w-16 rounded bg-ink-50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const { notifications, unreadCount, loaded, markRead, markAllRead } = useNotifications();

    const fullName = user?.fullName ?? "Job seeker";
    const groups = groupByDate(notifications);

    const subtitle = !loaded
        ? "Your latest updates"
        : unreadCount > 0
            ? `${unreadCount} unread`
            : "You're all caught up";

    return (
        <div className="min-h-screen bg-background">
            <Sidebar user={{ name: fullName, subtitle: user?.email ?? "Student" }} />

            <div className="min-h-screen transition-[padding] duration-200 lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar userName={fullName} />

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
                                    Notifications
                                </h1>
                                <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>
                            </div>
                            {loaded && unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => void markAllRead()}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
                                >
                                    <CheckCheck size={15} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {!loaded ? (
                            <SkeletonList />
                        ) : notifications.length === 0 ? (
                            <div className="mt-5 rounded-lg border border-ink-100 bg-surface px-6 py-16 text-center shadow-card">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-50 text-cobalt-600">
                                    <Bell size={22} />
                                </div>
                                <h2 className="mt-4 text-base font-semibold text-ink-900">No notifications yet</h2>
                                <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
                                    When an employer views or updates your application, you&apos;ll see it here.
                                </p>
                                <Link
                                    href="/discover"
                                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                                >
                                    <Sparkles size={15} />
                                    Browse verified jobs
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-5 space-y-6">
                                {groups.map((group) => (
                                    <section key={group.label}>
                                        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                                            {group.label}
                                        </h2>
                                        <div className="mt-2 overflow-hidden rounded-lg border border-ink-100 bg-surface shadow-card">
                                            <div className="divide-y divide-ink-100">
                                                {group.items.map((notification) => (
                                                    <NotificationItem
                                                        key={notification._id}
                                                        notification={notification}
                                                        onSelect={(item) => {
                                                            if (!item.isRead) void markRead(item._id);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

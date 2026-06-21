import Link from "next/link";
import { CalendarCheck, Eye, Star, XCircle, type LucideIcon } from "lucide-react";

import { formatRelativeTime } from "../../lib/relative-time";
import type { NotificationItem as NotificationData, NotificationKind } from "../../lib/api/notification/notification";

type Meta = {
    icon: LucideIcon;
    iconClass: string;
};

const META: Record<NotificationKind, Meta> = {
    application_viewed: { icon: Eye, iconClass: "bg-cobalt-50 text-cobalt-600" },
    application_shortlisted: { icon: Star, iconClass: "bg-success-50 text-success-700" },
    application_interview_scheduled: { icon: CalendarCheck, iconClass: "bg-cobalt-50 text-cobalt-600" },
    application_not_selected: { icon: XCircle, iconClass: "bg-ink-100 text-ink-500" },
    application_update: { icon: Eye, iconClass: "bg-ink-100 text-ink-500" },
};

const resolveHref = (notification: NotificationData) => {
    if (notification.applicationId) return "/applications";
    if (notification.jobId) return `/jobs/${notification.jobId}`;
    return "/notifications";
};

interface NotificationItemProps {
    notification: NotificationData;
    onSelect?: (notification: NotificationData) => void;
}

export default function NotificationItem({ notification, onSelect }: NotificationItemProps) {
    const meta = META[notification.type] ?? META.application_update;
    const Icon = meta.icon;

    return (
        <Link
            href={resolveHref(notification)}
            onClick={() => onSelect?.(notification)}
            className={[
                "flex gap-3 px-4 py-3 transition-colors hover:bg-ink-50",
                notification.isRead ? "" : "bg-cobalt-50/40",
            ].join(" ")}
        >
            <span className={["mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.iconClass].join(" ")}>
                <Icon size={15} />
            </span>

            <div className="min-w-0 flex-1">
                <p className={["text-sm text-ink-900", notification.isRead ? "font-medium" : "font-semibold"].join(" ")}>
                    {notification.title}
                </p>
                <p className="mt-0.5 text-sm text-ink-500">{notification.message}</p>
            </div>

            {/* Right meta column: pushes the timestamp to the row's edge so the
                full width is used, and pairs it with the unread indicator. */}
            <div className="flex shrink-0 flex-col items-end gap-1.5 pl-3 text-right">
                <time className="whitespace-nowrap text-xs text-ink-400">
                    {formatRelativeTime(notification.createdAt)}
                </time>
                {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-cobalt-500" aria-label="Unread" />
                )}
            </div>
        </Link>
    );
}

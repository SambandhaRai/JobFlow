import { Clock, Eye, CheckCircle, Calendar, XCircle } from "lucide-react";

export type ApplicationStatus =
    | "submitted"
    | "viewed_by_employer"
    | "shortlisted"
    | "interview_scheduled"
    | "not_selected";

interface StatusConfig {
    label: string;
    icon: React.ReactNode;
    className: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    submitted: {
        label: "Submitted",
        icon: <Clock size={12} />,
        className: "bg-ink-50 text-ink-600 border border-ink-200",
    },
    viewed_by_employer: {
        label: "Viewed by employer",
        icon: <Eye size={12} />,
        className: "bg-cobalt-50 text-cobalt-700 border border-cobalt-200",
    },
    shortlisted: {
        label: "Shortlisted",
        icon: <CheckCircle size={12} />,
        className: "bg-success-50 text-success-700 border border-success-500/30",
    },
    interview_scheduled: {
        label: "Interview scheduled",
        icon: <Calendar size={12} />,
        className: "bg-warning-50 text-warning-700 border border-warning-500/30",
    },
    not_selected: {
        label: "Not selected",
        icon: <XCircle size={12} />,
        className: "bg-danger-50 text-danger-700 border border-danger-500/30",
    },
};

interface StatusBadgeProps {
    status: ApplicationStatus;
    className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                config.className,
                className,
            ].join(" ")}
        >
            {config.icon}
            {config.label}
        </span>
    );
}

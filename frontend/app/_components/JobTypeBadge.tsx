export type JobBadgeVariant =
    | "internship"
    | "full-time"
    | "part-time"
    | "hybrid"
    | "on-site"
    | "remote"
    | "beginner-friendly"
    | "entry-level";

interface BadgeConfig {
    label: string;
    className: string;
}

const BADGE_CONFIG: Record<JobBadgeVariant, BadgeConfig> = {
    "internship": {
        label: "Internship",
        className: "bg-cobalt-50 text-cobalt-700 border border-cobalt-200",
    },
    "full-time": {
        label: "Full-time",
        className: "bg-cobalt-100 text-cobalt-800 border border-cobalt-200",
    },
    "part-time": {
        label: "Part-time",
        className: "bg-warning-50 text-warning-700 border border-warning-500/30",
    },
    "hybrid": {
        label: "Hybrid",
        className: "bg-ink-50 text-ink-600 border border-ink-200",
    },
    "on-site": {
        label: "On-site",
        className: "bg-ink-50 text-ink-600 border border-ink-200",
    },
    "remote": {
        label: "Remote",
        className: "bg-success-50 text-success-700 border border-success-500/30",
    },
    "beginner-friendly": {
        label: "Beginner-friendly",
        className: "bg-success-50 text-success-700 border border-success-500/30",
    },
    "entry-level": {
        label: "Entry-level",
        className: "bg-warning-50 text-warning-700 border border-warning-500/30",
    },
};

interface JobTypeBadgeProps {
    variant: JobBadgeVariant;
    className?: string;
}

export default function JobTypeBadge({ variant, className = "" }: JobTypeBadgeProps) {
    const config = BADGE_CONFIG[variant];

    return (
        <span
            className={[
                "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                config.className,
                className,
            ].join(" ")}
        >
            {config.label}
        </span>
    );
}

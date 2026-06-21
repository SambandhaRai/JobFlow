import Badge, { type BadgeTone } from "./Badge";

export type JobBadgeVariant =
    | "internship"
    | "full-time"
    | "part-time"
    | "hybrid"
    | "on-site"
    | "remote"
    | "beginner-friendly"
    | "entry-level";

const BADGE_CONFIG: Record<JobBadgeVariant, { label: string; tone: BadgeTone }> = {
    "internship": { label: "Internship", tone: "cobalt" },
    "full-time": { label: "Full-time", tone: "cobalt" },
    "part-time": { label: "Part-time", tone: "warning" },
    "hybrid": { label: "Hybrid", tone: "neutral" },
    "on-site": { label: "On-site", tone: "neutral" },
    "remote": { label: "Remote", tone: "success" },
    "beginner-friendly": { label: "Beginner-friendly", tone: "success" },
    "entry-level": { label: "Entry-level", tone: "warning" },
};

interface JobTypeBadgeProps {
    variant: JobBadgeVariant;
    className?: string;
}

export default function JobTypeBadge({ variant, className = "" }: JobTypeBadgeProps) {
    const { label, tone } = BADGE_CONFIG[variant];

    return (
        <Badge tone={tone} className={className}>
            {label}
        </Badge>
    );
}

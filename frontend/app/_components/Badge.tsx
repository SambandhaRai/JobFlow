import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "cobalt" | "success" | "warning" | "danger";

const toneStyles: Record<BadgeTone, string> = {
    neutral: "border-ink-200 bg-ink-50 text-ink-600",
    cobalt: "border-cobalt-100 bg-cobalt-50 text-cobalt-700",
    success: "border-success-500/30 bg-success-50 text-success-700",
    warning: "border-warning-500/30 bg-warning-50 text-warning-700",
    danger: "border-danger-500/30 bg-danger-50 text-danger-700",
};

interface BadgeProps {
    tone?: BadgeTone;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}

export default function Badge({ tone = "neutral", icon, children, className = "" }: BadgeProps) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                toneStyles[tone],
                className,
            ].join(" ")}
        >
            {icon}
            {children}
        </span>
    );
}

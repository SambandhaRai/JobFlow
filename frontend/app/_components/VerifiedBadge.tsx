import { Check } from "lucide-react";

interface VerifiedBadgeProps {
    label?: string;
    className?: string;
}

export default function VerifiedBadge({ label = "Verified", className = "" }: VerifiedBadgeProps) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1 text-xs font-medium text-cobalt-600",
                className,
            ].join(" ")}
        >
            <Check size={12} strokeWidth={2.5} />
            {label}
        </span>
    );
}

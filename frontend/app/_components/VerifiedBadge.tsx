import { BadgeCheck } from "lucide-react";

import Badge from "./Badge";

interface VerifiedBadgeProps {
    label?: string;
    className?: string;
}

export default function VerifiedBadge({ label = "Verified", className = "" }: VerifiedBadgeProps) {
    return (
        <Badge tone="cobalt" icon={<BadgeCheck size={12} />} className={className}>
            {label}
        </Badge>
    );
}

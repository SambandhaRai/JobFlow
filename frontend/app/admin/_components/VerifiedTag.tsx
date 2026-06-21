import { BadgeCheck, Clock } from "lucide-react";

import Badge from "../../_components/Badge";

// Consistent verified/pending trust signal for admin tables — replaces bare
// "Yes" / "No" text so reviewers can scan state at a glance.
export default function VerifiedTag({ verified }: { verified: boolean }) {
    return verified ? (
        <Badge tone="success" icon={<BadgeCheck size={12} />}>Verified</Badge>
    ) : (
        <Badge tone="warning" icon={<Clock size={12} />}>Pending</Badge>
    );
}

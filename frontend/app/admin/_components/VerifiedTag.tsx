import { BadgeCheck, Clock } from "lucide-react";

import Badge from "../../_components/Badge";

export default function VerifiedTag({ verified }: { verified: boolean }) {
    return verified ? (
        <Badge tone="success" icon={<BadgeCheck size={12} />}>Verified</Badge>
    ) : (
        <Badge tone="warning" icon={<Clock size={12} />}>Pending</Badge>
    );
}

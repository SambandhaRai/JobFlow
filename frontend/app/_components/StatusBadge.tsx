import { Clock, Eye, CheckCircle, Calendar, XCircle } from "lucide-react";

import Badge, { type BadgeTone } from "./Badge";

export type ApplicationStatus =
    | "submitted"
    | "viewed_by_employer"
    | "shortlisted"
    | "interview_scheduled"
    | "not_selected";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; icon: React.ReactNode; tone: BadgeTone }> = {
    submitted: { label: "Submitted", icon: <Clock size={12} />, tone: "neutral" },
    viewed_by_employer: { label: "Viewed by employer", icon: <Eye size={12} />, tone: "cobalt" },
    shortlisted: { label: "Shortlisted", icon: <CheckCircle size={12} />, tone: "success" },
    interview_scheduled: { label: "Interview scheduled", icon: <Calendar size={12} />, tone: "warning" },
    not_selected: { label: "Not selected", icon: <XCircle size={12} />, tone: "danger" },
};

interface StatusBadgeProps {
    status: ApplicationStatus;
    className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const { label, icon, tone } = STATUS_CONFIG[status];

    return (
        <Badge tone={tone} icon={icon} className={className}>
            {label}
        </Badge>
    );
}

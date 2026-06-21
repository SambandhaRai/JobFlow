import type { ReactNode } from "react";
import { Clock3, CreditCard, Globe2, GraduationCap } from "lucide-react";

import DetailSection from "./DetailSection";
import type { JobDetails } from "./jobDetailsData";

function GlanceCard({
    icon,
    label,
    value,
    helper,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="rounded-lg border border-ink-100 bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
                {icon}
                {label}
            </div>
            <p className="mt-2 text-base font-semibold text-ink-900">{value}</p>
            <p className="mt-1 text-xs text-ink-400">{helper}</p>
        </div>
    );
}

export default function AtAGlanceSection({ job }: { job: JobDetails }) {
    return (
        <DetailSection title="At a glance">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <GlanceCard
                    icon={<CreditCard size={14} />}
                    label="Salary"
                    value={job.salary}
                    helper={job.salarySubtext}
                />
                <GlanceCard
                    icon={<Clock3 size={14} />}
                    label="Duration"
                    value={job.duration}
                    helper={job.durationSubtext}
                />
                <GlanceCard
                    icon={<GraduationCap size={14} />}
                    label="Experience"
                    value={job.experienceLevelLabel}
                    helper={job.isBeginnerFriendly ? "Beginner-friendly" : "Employer expectation"}
                />
                <GlanceCard
                    icon={<Globe2 size={14} />}
                    label="Mode"
                    value={job.workModeLabel}
                    helper={job.location}
                />
            </div>
        </DetailSection>
    );
}

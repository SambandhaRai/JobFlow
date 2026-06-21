import { BadgeCheck, Code2 } from "lucide-react";

import DetailSection from "./DetailSection";
import type { JobDetails, JobMatch } from "./jobDetailsData";

interface SkillsSectionProps {
    job: JobDetails;
    match: JobMatch;
}

export default function SkillsSection({ job, match }: SkillsSectionProps) {
    return (
        <DetailSection title="Skills">
            {job.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => {
                        const isMatched = match.matchedSkills.includes(skill);

                        return (
                            <span
                                key={skill}
                                className={[
                                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium font-mono",
                                    isMatched
                                        ? "border-cobalt-100 bg-cobalt-50 text-cobalt-600"
                                        : "border-ink-100 bg-ink-50 text-ink-700",
                                ].join(" ")}
                            >
                                <Code2 size={13} />
                                {skill}
                                {isMatched && <BadgeCheck size={13} />}
                            </span>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-ink-400">Skills were not listed for this role.</p>
            )}
        </DetailSection>
    );
}

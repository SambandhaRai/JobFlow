import { ArrowRight, Briefcase, MapPinned } from "lucide-react";

import CompanyAvatar from "../../_components/CompanyAvatar";
import SkillTag from "../../_components/SkillTag";
import VerifiedBadge from "../../_components/VerifiedBadge";

export interface FeaturedJob {
    company: string;
    title: string;
    location: string;
    workMode: string;
    jobType: string;
    duration?: string;
    skills: string[];
    salary: string;
    postedAgo: string;
}

interface FeaturedJobCardProps {
    job: FeaturedJob;
}

export default function FeaturedJobCard({ job }: FeaturedJobCardProps) {
    return (
        <div className="bg-surface border border-ink-100 rounded-lg p-5 hover:shadow-popover transition-shadow group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <CompanyAvatar name={job.company} size="md" />
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-sm font-semibold text-ink-900">{job.title}</p>
                            <VerifiedBadge label="Verified" />
                        </div>
                        <p className="text-xs text-ink-500">{job.company}</p>
                    </div>
                </div>
                <span className="text-xs text-ink-400 shrink-0">{job.postedAgo}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 mb-3">
                <span className="flex items-center gap-1">
                    <MapPinned size={11} />
                    {job.location} / {job.workMode}
                </span>
                <span className="flex items-center gap-1">
                    <Briefcase size={11} />
                    {job.jobType}
                    {job.duration ? ` / ${job.duration}` : ""}
                </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
                {job.skills.map((skill) => (
                    <SkillTag key={skill} label={skill} />
                ))}
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-800">{job.salary}</span>
                <button
                    type="button"
                    className="text-xs font-medium text-cobalt-500 hover:text-cobalt-700 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
                >
                    Quick apply
                    <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
}

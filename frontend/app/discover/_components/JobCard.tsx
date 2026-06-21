import Link from "next/link";
import { BriefcaseBusiness, ChevronRight, CreditCard, MapPin, Sparkles } from "lucide-react";

import Badge from "../../_components/Badge";
import CompanyAvatar from "../../_components/CompanyAvatar";
import VerifiedBadge from "../../_components/VerifiedBadge";
import SaveJobButton from "./SaveJobButton";
import type { Job } from "./discoverData";

interface JobCardProps {
    job: Job;
    isSaved?: boolean;
    onToggleSaved?: (saved: boolean) => void;
}

export default function JobCard({ job, isSaved = false, onToggleSaved }: JobCardProps) {
    const hiringTypeLabel = {
        company: "Company",
        "small-business": "Small business",
        individual: "Individual",
    }[job.hiringType];

    return (
        <article className="group relative rounded-lg border border-ink-100 bg-surface p-4 shadow-card transition-all hover:border-cobalt-100 hover:shadow-popover sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row">
                <CompanyAvatar name={job.company} size="lg" imageUrl={job.companyLogo} className="mt-1" />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                                <h2 className="min-w-0 text-lg font-semibold leading-snug tracking-tight text-ink-900">
                                    <Link
                                        href={`/jobs/${job.id}`}
                                        className="transition-colors after:absolute after:inset-0 after:rounded-lg group-hover:text-cobalt-700"
                                    >
                                        {job.title}
                                    </Link>
                                </h2>

                                {(job.isVerified || job.isBeginnerFriendly) && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {job.isVerified && <VerifiedBadge />}
                                        {job.isBeginnerFriendly && (
                                            <Badge tone="success" icon={<Sparkles size={12} />}>
                                                Beginner-friendly
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
                                <span>{job.company}</span>
                                <span aria-hidden="true">·</span>
                                <span>{hiringTypeLabel}</span>
                                <span aria-hidden="true">·</span>
                                <span>{job.category}</span>
                                {job.isHiringVerified && (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <Badge tone="cobalt">Verified hiring profile</Badge>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
                            <span className="text-xs text-ink-400">{job.postedAt}</span>
                            <SaveJobButton
                                jobId={job.id}
                                title={job.title}
                                initialSaved={isSaved}
                                onToggleSaved={onToggleSaved}
                                className="relative z-10"
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid gap-2 rounded-md bg-ink-50 p-3 text-sm text-ink-600 sm:grid-cols-3">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <MapPin size={14} className="shrink-0 text-ink-300" />
                            <span className="truncate">{job.location} · {job.workMode}</span>
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <BriefcaseBusiness size={14} className="shrink-0 text-ink-300" />
                            <span className="truncate">{job.type}{job.duration ? ` · ${job.duration}` : ""}</span>
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <CreditCard size={14} className="shrink-0 text-ink-300" />
                            <span className="truncate">{job.compensation}</span>
                        </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
                        {job.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {job.skills.slice(0, 4).map((skill) => (
                                    <span
                                        key={skill}
                                        className={[
                                            "rounded-md border px-2.5 py-1 text-xs font-medium font-mono",
                                            skill === job.highlightedSkill
                                                ? "border-cobalt-100 bg-cobalt-50 text-cobalt-600"
                                                : "border-ink-100 bg-ink-50 text-ink-700",
                                        ].join(" ")}
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {job.skills.length > 4 && (
                                    <span className="rounded-md border border-ink-100 bg-surface px-2.5 py-1 text-xs font-medium text-ink-500">
                                        +{job.skills.length - 4} more
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-ink-400">Skills not listed</p>
                        )}

                        <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-cobalt-600">
                            View details
                            <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

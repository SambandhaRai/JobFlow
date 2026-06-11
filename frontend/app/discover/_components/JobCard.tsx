import Link from "next/link";
import { Bookmark, BriefcaseBusiness, ChevronRight, CreditCard, MapPin, Sparkles } from "lucide-react";

import CompanyAvatar from "../../_components/CompanyAvatar";
import VerifiedBadge from "../../_components/VerifiedBadge";
import type { Job } from "./discoverData";

interface JobCardProps {
    job: Job;
}

export default function JobCard({ job }: JobCardProps) {
    const hiringTypeLabel = {
        company: "Company",
        "small-business": "Small business",
        individual: "Individual",
    }[job.hiringType];

    return (
        <article className="rounded-lg border border-ink-100 bg-surface p-4 shadow-card transition-colors hover:border-ink-200 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row">
                <CompanyAvatar name={job.company} size="lg" className="mt-1" />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                                <h2 className="min-w-0 text-lg font-semibold leading-snug tracking-tight text-ink-900">
                                    {job.title}
                                </h2>

                                {(job.isVerified || job.isBeginnerFriendly) && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {job.isVerified && <VerifiedBadge />}
                                        {job.isBeginnerFriendly && (
                                            <span className="inline-flex items-center gap-1 rounded-md border border-success-500/20 bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">
                                                <Sparkles size={12} />
                                                Beginner-friendly
                                            </span>
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
                                        <span className="inline-flex items-center rounded-md border border-cobalt-100 bg-cobalt-50 px-2 py-0.5 text-xs font-medium text-cobalt-600">
                                            Verified hiring profile
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
                            <span className="text-xs text-ink-400">{job.postedAt}</span>
                            <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-100 text-ink-400 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50 hover:text-cobalt-600"
                                aria-label={`Save ${job.title}`}
                            >
                                <Bookmark size={16} />
                            </button>
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

                    <div className="mt-4 border-t border-ink-100 pt-4">
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
                    </div>

                    <div className="mt-4 flex justify-start">
                        <Link
                            href={`/jobs/${job.id}`}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cobalt-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cobalt-600 sm:w-auto"
                        >
                            View details
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}

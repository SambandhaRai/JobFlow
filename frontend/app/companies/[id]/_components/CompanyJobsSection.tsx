import Link from "next/link";
import { BriefcaseBusiness, ChevronRight, MapPin, Sparkles } from "lucide-react";

import Badge from "../../../_components/Badge";
import VerifiedBadge from "../../../_components/VerifiedBadge";
import type { CompanyJob } from "./companyDetailsData";

interface CompanyJobsSectionProps {
    companyName: string;
    jobs: CompanyJob[];
    totalJobs: number;
}

export default function CompanyJobsSection({ companyName, jobs, totalJobs }: CompanyJobsSectionProps) {
    return (
        <section className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-ink-900">Open roles</h2>
                {totalJobs > 0 && (
                    <span className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-500">
                        {totalJobs} {totalJobs === 1 ? "role" : "roles"}
                    </span>
                )}
            </div>

            {jobs.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-ink-200 bg-ink-50/50 px-5 py-8 text-center">
                    <p className="text-sm text-ink-500">
                        {companyName} has no open roles right now.
                    </p>
                    <p className="mt-1 text-sm text-ink-400">Check back soon for new openings.</p>
                </div>
            ) : (
                <ul className="mt-4 space-y-3">
                    {jobs.map((job) => (
                        <li key={job.id}>
                            <Link
                                href={`/jobs/${job.id}`}
                                className="group flex items-center gap-4 rounded-lg border border-ink-100 p-4 transition-all hover:border-cobalt-100 hover:bg-cobalt-50/30 hover:shadow-card"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                                        <h3 className="truncate text-base font-semibold text-ink-900 transition-colors group-hover:text-cobalt-700">
                                            {job.title}
                                        </h3>
                                        {job.isVerified && <VerifiedBadge />}
                                        {job.isBeginnerFriendly && (
                                            <Badge tone="success" icon={<Sparkles size={12} />}>
                                                Beginner-friendly
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-ink-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin size={14} className="text-ink-400" />
                                            {job.location} · {job.workModeLabel}
                                        </span>
                                        <span className="text-ink-200" aria-hidden="true">|</span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <BriefcaseBusiness size={14} className="text-ink-400" />
                                            {job.jobTypeLabel}
                                        </span>
                                        <span className="text-ink-200" aria-hidden="true">|</span>
                                        <span className="text-ink-400">{job.postedAt}</span>
                                    </div>
                                </div>
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-400 transition-colors group-hover:bg-cobalt-100 group-hover:text-cobalt-600">
                                    <ChevronRight
                                        size={16}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

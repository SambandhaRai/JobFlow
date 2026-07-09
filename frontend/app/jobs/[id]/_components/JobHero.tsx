import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, Clock3, CreditCard, MapPin, Sparkles } from "lucide-react";

import Badge from "../../../_components/Badge";
import CompanyAvatar from "../../../_components/CompanyAvatar";
import JobDetailActions from "./JobDetailActions";
import type { ApplicantDefaults, ApplicantResume, ApplyJob, JobDetails } from "./jobDetailsData";

interface JobHeroProps {
    job: JobDetails;
    isSaved: boolean;
    hasApplied: boolean;
    applyJob: ApplyJob;
    applicantDefaults: ApplicantDefaults;
    resumes: ApplicantResume[];
}

export default function JobHero({
    job,
    isSaved,
    hasApplied,
    applyJob,
    applicantDefaults,
    resumes,
}: JobHeroProps) {
    const companyHref = job.companyId ? `/companies/${job.companyId}` : null;

    return (
        <section className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                {companyHref ? (
                    <Link href={companyHref} className="shrink-0 transition-opacity hover:opacity-80">
                        <CompanyAvatar name={job.company} size="xl" imageUrl={job.companyLogo} className="rounded-lg" />
                    </Link>
                ) : (
                    <CompanyAvatar name={job.company} size="xl" imageUrl={job.companyLogo} className="rounded-lg" />
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                {job.isBeginnerFriendly && (
                                    <Badge tone="success" icon={<Sparkles size={12} />}>
                                        Beginner-friendly
                                    </Badge>
                                )}
                                <Badge tone="cobalt">{job.jobTypeLabel}</Badge>
                                <Badge>{job.workModeLabel}</Badge>
                            </div>

                            <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-3xl">
                                {job.title}
                            </h1>

                            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
                                {companyHref ? (
                                    <Link
                                        href={companyHref}
                                        className="font-medium text-cobalt-600 transition-colors hover:text-cobalt-700 hover:underline"
                                    >
                                        {job.company}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-ink-700">{job.company}</span>
                                )}
                                {job.isHiringVerified && (
                                    <>
                                        <span aria-hidden="true">/</span>
                                        <Badge tone="cobalt">Verified hiring profile</Badge>
                                    </>
                                )}
                                <span aria-hidden="true">/</span>
                                <span>{job.hiringTypeLabel}</span>
                            </div>
                        </div>

                        <p className="inline-flex items-center gap-1.5 text-sm text-ink-400">
                            <Clock3 size={14} />
                            {job.postedAt}
                        </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-500">
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin size={15} className="text-ink-400" />
                            {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <BriefcaseBusiness size={15} className="text-ink-400" />
                            {job.duration}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CreditCard size={15} className="text-ink-400" />
                            {job.salary}
                        </span>
                        {job.deadline && (
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={15} className="text-ink-400" />
                                Apply by {job.deadline}
                            </span>
                        )}
                    </div>

                    <div className="mt-6">
                        <JobDetailActions
                            title={job.title}
                            company={job.company}
                            isInitiallySaved={isSaved}
                            hasApplied={hasApplied}
                            applyJob={applyJob}
                            applicantDefaults={applicantDefaults}
                            resumes={resumes}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

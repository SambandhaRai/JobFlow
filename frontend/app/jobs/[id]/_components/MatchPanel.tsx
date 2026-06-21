import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Mail, MapPin, Phone, ShieldCheck, Zap } from "lucide-react";

import CompanyAvatar from "../../../_components/CompanyAvatar";
import AppliedButton from "./AppliedButton";
import QuickApplyButton from "./QuickApplyButton";
import {
    toApplyJob,
    type ApplicantDefaults,
    type ApplicantResume,
    type JobDetails,
    type JobMatch,
} from "./jobDetailsData";

const normalizeExternalUrl = (value: string) => (
    /^https?:\/\//i.test(value) ? value : `https://${value}`
);

interface MatchPanelProps {
    job: JobDetails;
    match: JobMatch;
    applicantDefaults: ApplicantDefaults;
    resumes: ApplicantResume[];
    hasApplied: boolean;
}

export default function MatchPanel({
    job,
    match,
    applicantDefaults,
    resumes,
    hasApplied,
}: MatchPanelProps) {
    const topMatchedSkills = match.matchedSkills.slice(0, 3);
    const topMissingSkills = match.missingSkills.slice(0, 2);
    const companyHref = job.companyId ? `/companies/${job.companyId}` : null;

    return (
        <aside className="space-y-4">
            <section className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-ink-700">You match this role</p>
                        <p className="mt-1 text-xs text-ink-400">Based on your profile skills and resume.</p>
                    </div>
                    <p className="text-lg font-semibold text-success-700">{match.percent}%</p>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                        className="h-full rounded-full bg-success-500"
                        style={{ width: `${match.percent}%` }}
                    />
                </div>

                <div className="mt-5 space-y-3 text-sm">
                    {topMatchedSkills.length > 0 ? (
                        topMatchedSkills.map((skill) => (
                            <div key={skill} className="flex items-center gap-2 text-ink-700">
                                <CheckCircle2 size={15} className="text-success-700" />
                                <span>{skill}</span>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center gap-2 text-ink-500">
                            <AlertCircle size={15} className="text-ink-400" />
                            <span>Add matching skills to improve your score.</span>
                        </div>
                    )}

                    {match.hasResume ? (
                        <div className="flex items-center gap-2 text-ink-700">
                            <CheckCircle2 size={15} className="text-success-700" />
                            <span>Resume on file</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-ink-500">
                            <AlertCircle size={15} className="text-ink-400" />
                            <span>Add a resume before applying</span>
                        </div>
                    )}

                    {topMissingSkills.length > 0 && (
                        <div className="flex items-start gap-2 text-ink-500">
                            <AlertCircle size={15} className="mt-0.5 text-ink-400" />
                            <span>Add {topMissingSkills.join(", ")} to strengthen this match.</span>
                        </div>
                    )}
                </div>

                {hasApplied ? (
                    <AppliedButton className="mt-5 h-10 w-full px-4" />
                ) : (
                    <QuickApplyButton
                        job={toApplyJob(job)}
                        defaults={applicantDefaults}
                        resumes={resumes}
                        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cobalt-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                    >
                        <Zap size={15} />
                        Quick apply
                    </QuickApplyButton>
                )}
            </section>

            <section className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card">
                <div className="flex items-start gap-3">
                    {companyHref ? (
                        <Link href={companyHref} className="shrink-0 transition-opacity hover:opacity-80">
                            <CompanyAvatar name={job.company} size="md" />
                        </Link>
                    ) : (
                        <CompanyAvatar name={job.company} size="md" />
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                {companyHref ? (
                                    <Link
                                        href={companyHref}
                                        className="block truncate text-base font-semibold text-ink-900 transition-colors hover:text-cobalt-700"
                                    >
                                        {job.company}
                                    </Link>
                                ) : (
                                    <h2 className="truncate text-base font-semibold text-ink-900">{job.company}</h2>
                                )}
                                <p className="mt-1 text-xs text-ink-500">{job.hiringTypeLabel}</p>
                            </div>
                            {job.isHiringVerified && (
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                                    <ShieldCheck size={16} />
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-5 space-y-3 border-y border-ink-100 py-4 text-sm text-ink-600">
                    {job.hiringEmail && (
                        <a href={`mailto:${job.hiringEmail}`} className="flex items-center gap-2 transition-colors hover:text-cobalt-600">
                            <Mail size={15} className="text-ink-400" />
                            <span className="truncate">{job.hiringEmail}</span>
                        </a>
                    )}
                    {job.hiringPhone && (
                        <a href={`tel:${job.hiringPhone}`} className="flex items-center gap-2 transition-colors hover:text-cobalt-600">
                            <Phone size={15} className="text-ink-400" />
                            <span>{job.hiringPhone}</span>
                        </a>
                    )}
                    {job.hiringWebsite && (
                        <a
                            href={normalizeExternalUrl(job.hiringWebsite)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 transition-colors hover:text-cobalt-600"
                        >
                            <ExternalLink size={15} className="text-ink-400" />
                            <span className="truncate">{job.hiringWebsite}</span>
                        </a>
                    )}
                    <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-ink-400" />
                        <span>{job.hiringLocation || job.location}</span>
                    </div>
                </div>

                {companyHref ? (
                    <Link
                        href={companyHref}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cobalt-600 hover:text-cobalt-700"
                    >
                        View company profile
                        <ArrowRight size={14} />
                    </Link>
                ) : (
                    <Link
                        href={`/discover?search=${encodeURIComponent(job.company)}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cobalt-600 hover:text-cobalt-700"
                    >
                        See more from this hiring profile
                        <ExternalLink size={14} />
                    </Link>
                )}
            </section>
        </aside>
    );
}

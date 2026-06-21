import { cookies } from "next/headers";
import Link from "next/link";
import { AlertCircle, Briefcase, Plus } from "lucide-react";

import EmployerTable from "../_components/EmployerTable";
import JobRowActions from "../_components/JobRowActions";
import { fetchEmployerJobs, formatDate } from "../_components/employerData";

export const dynamic = "force-dynamic";

export default async function EmployerJobsPage() {
    const token = (await cookies()).get("auth_token")?.value ?? null;
    const { jobs, error } = await fetchEmployerJobs(token);

    return (
        <section>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-lg font-semibold text-ink-900">
                        My jobs <span className="font-normal text-ink-400">({jobs.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-ink-500">
                        Manage your listings and review applicants. New posts go live after a quick admin review.
                    </p>
                </div>
                <Link
                    href="/employer/jobs/new"
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-cobalt-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                >
                    <Plus size={16} />
                    Post a job
                </Link>
            </div>

            {error && (
                <div className="mt-4 flex gap-2 rounded-md border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {!error && jobs.length === 0 ? (
                <div className="mt-6 rounded-lg border border-ink-200 bg-surface px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                        <Briefcase size={22} />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-ink-900">No jobs posted yet</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
                        Post your first role to start receiving applications from verified student talent.
                    </p>
                    <Link
                        href="/employer/jobs/new"
                        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                    >
                        <Plus size={16} />
                        Post a job
                    </Link>
                </div>
            ) : (
            <div className="mt-4">
                <EmployerTable
                    headers={["Title", "Type", "Location", "Status", "Posted", "Actions"]}
                    empty="You haven't posted any jobs yet."
                    rows={jobs.map((job) => [
                        job.title ?? "—",
                        job.jobType ?? "—",
                        job.location ?? "—",
                        job.isVerified ? (
                            <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">
                                Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700">
                                Pending review
                            </span>
                        ),
                        formatDate(job.createdAt ?? job.postedAt),
                        <div key="actions" className="flex items-center gap-2">
                            <Link
                                href={`/employer/jobs/${job._id}/applications`}
                                className="rounded-md border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-cobalt-200 hover:bg-cobalt-50 hover:text-cobalt-700"
                            >
                                Applications
                            </Link>
                            <JobRowActions jobId={job._id ?? ""} />
                        </div>,
                    ])}
                />
            </div>
            )}
        </section>
    );
}

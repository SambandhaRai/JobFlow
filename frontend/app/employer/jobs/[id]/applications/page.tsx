import { cookies } from "next/headers";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import StatusBadge, { type ApplicationStatus } from "../../../../_components/StatusBadge";
import EmployerTable from "../../../_components/EmployerTable";
import ApplicationStatusSelect from "../../../_components/ApplicationStatusSelect";
import { fetchJobApplications, formatDate, resumePreviewUrl } from "../../../_components/employerData";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JobApplicationsPage({ params }: PageProps) {
    const { id } = await params;
    const token = (await cookies()).get("auth_token")?.value ?? null;
    const { job, applications, error } = await fetchJobApplications(id, token);

    return (
        <section>
            <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-cobalt-600 hover:text-cobalt-700">
                <ArrowLeft size={15} />
                Back to my jobs
            </Link>

            <h1 className="mt-3 text-lg font-semibold text-ink-900">
                Applications · {job?.title ?? "Job"}{" "}
                <span className="font-normal text-ink-400">({applications.length})</span>
            </h1>
            <p className="mt-1 text-sm text-ink-500">
                Review applicants and set a status — the applicant is notified the moment it changes.
            </p>

            {error && (
                <div className="mt-3 flex gap-2 rounded-md border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="mt-4">
                <EmployerTable
                    headers={["Applicant", "Email", "Phone", "Applied", "Resume", "Current", "Set status"]}
                    empty="No applications yet."
                    rows={applications.map((application) => {
                        const status = (application.status ?? "submitted") as ApplicationStatus;
                        return [
                            application.fullName ?? "—",
                            application.email ?? "—",
                            application.phone ?? "—",
                            formatDate(application.appliedAt ?? application.createdAt),
                            application.resumeUrl ? (
                                <a
                                    href={resumePreviewUrl(application.resumeUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-cobalt-600 hover:text-cobalt-700"
                                >
                                    View
                                </a>
                            ) : "—",
                            <StatusBadge key="badge" status={status} />,
                            <ApplicationStatusSelect key="select" applicationId={application._id ?? ""} status={status} />,
                        ];
                    })}
                />
            </div>
        </section>
    );
}

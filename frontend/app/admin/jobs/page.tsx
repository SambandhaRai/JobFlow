import { cookies } from "next/headers";

import AdminSection from "../_components/AdminSection";
import AdminTable from "../_components/AdminTable";
import JobActions from "../_components/JobActions";
import { fetchAdminJobs, formatDate } from "../_components/adminData";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
    const token = (await cookies()).get("auth_token")?.value ?? null;
    const { items, total, error } = await fetchAdminJobs(token);

    return (
        <AdminSection title="Jobs" count={total} error={error}>
            <AdminTable
                headers={["Title", "Hiring", "Location", "Type", "Verified", "Posted", "Actions"]}
                empty="No jobs."
                rows={items.map((job) => [
                    job.title ?? "—",
                    job.hiringName ?? job.company ?? "—",
                    job.location ?? "—",
                    job.jobType ?? "—",
                    job.isVerified ? "Yes" : "No",
                    formatDate(job.createdAt),
                    <JobActions key="a" jobId={job._id ?? ""} isVerified={Boolean(job.isVerified)} />,
                ])}
            />
        </AdminSection>
    );
}

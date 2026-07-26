import { cookies } from "next/headers";

import AdminSection from "../_components/AdminSection";
import AdminTable from "../_components/AdminTable";
import ReportActions from "../_components/ReportActions";
import ReportStatusTag from "../_components/ReportStatusTag";
import { fetchAdminReports, formatDate, reportField, reportReasonLabel } from "../_components/adminData";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
    const token = (await cookies()).get("auth_token")?.value ?? null;
    const { items, total, error } = await fetchAdminReports(token);

    return (
        <AdminSection title="Reports" count={total} error={error}>
            <AdminTable
                headers={["Job", "Reported by", "Reason", "Message", "Status", "Date", "Actions"]}
                empty="No reports."
                rows={items.map((report) => [
                    reportField(report.jobId, "title"),
                    reportField(report.reporterId, "fullName"),
                    reportReasonLabel(report.reason),
                    report.message ? report.message : "—",
                    <ReportStatusTag key="s" status={report.status} />,
                    formatDate(report.createdAt),
                    <ReportActions key="a" reportId={report._id ?? ""} status={report.status} />,
                ])}
            />
        </AdminSection>
    );
}

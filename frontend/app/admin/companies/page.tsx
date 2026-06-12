import { cookies } from "next/headers";

import AdminSection from "../_components/AdminSection";
import AdminTable from "../_components/AdminTable";
import CompanyActions from "../_components/CompanyActions";
import { fetchAdminCompanies, formatDate } from "../_components/adminData";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
    const token = (await cookies()).get("auth_token")?.value ?? null;
    const { items, total, error } = await fetchAdminCompanies(token);

    return (
        <AdminSection title="Companies" count={total} error={error}>
            <AdminTable
                headers={["Name", "Industry", "Location", "Email", "Verified", "Created", "Actions"]}
                empty="No companies."
                rows={items.map((company) => [
                    company.name ?? "—",
                    company.industry ?? "—",
                    company.location ?? "—",
                    company.email ?? "—",
                    company.isVerified ? "Yes" : "No",
                    formatDate(company.createdAt),
                    <CompanyActions key="a" companyId={company._id ?? ""} isVerified={Boolean(company.isVerified)} />,
                ])}
            />
        </AdminSection>
    );
}

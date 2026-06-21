import { cookies } from "next/headers";

import AdminSection from "../_components/AdminSection";
import AdminTable from "../_components/AdminTable";
import EmployerActions from "../_components/EmployerActions";
import VerifiedTag from "../_components/VerifiedTag";
import { fetchAdminEmployers, formatDate } from "../_components/adminData";

export const dynamic = "force-dynamic";

export default async function AdminEmployersPage() {
    const token = (await cookies()).get("auth_token")?.value ?? null;
    const { items, total, error } = await fetchAdminEmployers(token);

    return (
        <AdminSection title="Employers" count={total} error={error}>
            <AdminTable
                headers={["Name", "Email", "Phone", "Verified", "Joined", "Actions"]}
                empty="No employers."
                rows={items.map((employer) => [
                    employer.fullName ?? "—",
                    employer.email ?? "—",
                    employer.phone ?? "—",
                    <VerifiedTag key="v" verified={Boolean(employer.isVerified)} />,
                    formatDate(employer.createdAt),
                    <EmployerActions key="a" userId={employer._id ?? ""} isVerified={Boolean(employer.isVerified)} />,
                ])}
            />
        </AdminSection>
    );
}

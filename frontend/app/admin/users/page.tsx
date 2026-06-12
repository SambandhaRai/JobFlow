import { cookies } from "next/headers";

import AdminSection from "../_components/AdminSection";
import AdminTable from "../_components/AdminTable";
import UserActions from "../_components/UserActions";
import { fetchAdminUsers, formatDate } from "../_components/adminData";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const token = (await cookies()).get("auth_token")?.value ?? null;
    const { items, total, error } = await fetchAdminUsers(token);

    return (
        <AdminSection title="Job seekers" count={total} error={error}>
            <AdminTable
                headers={["Name", "Email", "Phone", "Joined", "Actions"]}
                empty="No users."
                rows={items.map((user) => [
                    user.fullName ?? "—",
                    user.email ?? "—",
                    user.phone ?? "—",
                    formatDate(user.createdAt),
                    <UserActions
                        key="a"
                        userId={user._id ?? ""}
                        fullName={user.fullName ?? ""}
                        phone={user.phone ?? ""}
                    />,
                ])}
            />
        </AdminSection>
    );
}

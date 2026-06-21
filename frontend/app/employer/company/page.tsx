import { cookies } from "next/headers";
import { AlertCircle } from "lucide-react";

import CompanyManager from "../_components/CompanyManager";
import { fetchMyCompanies } from "../_components/employerData";

export const dynamic = "force-dynamic";

export default async function EmployerCompanyPage() {
    const token = (await cookies()).get("auth_token")?.value ?? null;
    const { companies, error } = await fetchMyCompanies(token);

    return (
        <section>
            <div>
                <h1 className="text-lg font-semibold text-ink-900">Company profile</h1>
                <p className="mt-1 text-sm text-ink-500">
                    Update your company details and logo. Your logo appears on your company page and job listings.
                </p>
            </div>

            {error && (
                <div className="mt-4 flex gap-2 rounded-md border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="mt-5">
                <CompanyManager initialCompanies={companies} />
            </div>
        </section>
    );
}

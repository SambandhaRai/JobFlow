import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import BackButton from "../../_components/BackButton";
import ScrollToTop from "../../_components/ScrollToTop";
import DetailSection from "../../jobs/[id]/_components/DetailSection";
import DetailShell from "../../jobs/[id]/_components/DetailShell";
import type { JobDetailsUser } from "../../jobs/[id]/_components/jobDetailsData";
import CompanyErrorState from "./_components/CompanyErrorState";
import CompanyHero from "./_components/CompanyHero";
import CompanyJobsSection from "./_components/CompanyJobsSection";
import { fetchCompanyDetailsData, isNotFoundError } from "./_components/companyDetailsData";

export const dynamic = "force-dynamic";

interface CompanyDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

const parseUserCookie = (value?: string): JobDetailsUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as JobDetailsUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as JobDetailsUser;
        } catch {
            return null;
        }
    }
};

export default async function CompanyDetailsPage({ params }: CompanyDetailsPageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const cookieUser = parseUserCookie(cookieStore.get("user_data")?.value);

    let data;
    try {
        data = await fetchCompanyDetailsData(id, token);
    } catch (error) {
        if (isNotFoundError(error)) notFound();

        const message = error instanceof Error ? error.message : "The backend did not return this company.";
        return (
            <DetailShell user={cookieUser}>
                <CompanyErrorState message={message} />
            </DetailShell>
        );
    }

    const { company, jobs, totalJobs } = data;
    const user = data.user ?? cookieUser;

    return (
        <DetailShell user={user}>
            <ScrollToTop trigger={company.id} />
            <main className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <BackButton fallbackHref="/discover" />
                    <span className="h-4 w-px bg-ink-200" aria-hidden="true" />
                    <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-400">
                        <span>Companies</span>
                        <span>/</span>
                        <span className="text-ink-700">{company.name}</span>
                    </nav>
                </div>

                <div className="mt-5 space-y-5">
                    <CompanyHero company={company} />

                    {company.description && (
                        <DetailSection title={`About ${company.name}`}>
                            <div className="space-y-4 text-sm leading-relaxed text-ink-600">
                                {company.description.split(/\n{2,}|\r?\n/).map((paragraph, index) => {
                                    const trimmed = paragraph.trim();
                                    if (!trimmed) return null;
                                    return <p key={index}>{trimmed}</p>;
                                })}
                            </div>
                        </DetailSection>
                    )}

                    {company.contacts.length > 0 && (
                        <DetailSection title="Who you'll talk to">
                            <ul className="space-y-4">
                                {company.contacts.map((contact, index) => (
                                    <li key={index} className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-ink-900">
                                            {contact.name}
                                            {contact.role && (
                                                <span className="font-normal text-ink-500"> · {contact.role}</span>
                                            )}
                                        </span>
                                        <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                                            {contact.email && (
                                                <a
                                                    href={`mailto:${contact.email}`}
                                                    className="transition-colors hover:text-cobalt-600"
                                                >
                                                    {contact.email}
                                                </a>
                                            )}
                                            {contact.phone && (
                                                <a
                                                    href={`tel:${contact.phone}`}
                                                    className="transition-colors hover:text-cobalt-600"
                                                >
                                                    {contact.phone}
                                                </a>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </DetailSection>
                    )}

                    <CompanyJobsSection companyName={company.name} jobs={jobs} totalJobs={totalJobs} />
                </div>
            </main>
        </DetailShell>
    );
}

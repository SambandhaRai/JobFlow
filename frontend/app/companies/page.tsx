import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowRight, BadgeCheck, Building2, SearchX } from "lucide-react";

import Footer from "../(public)/_components/Footer";
import Navbar from "../(public)/_components/Navbar";
import CompaniesFilters from "./_components/CompaniesFilters";
import CompaniesPagination from "./_components/CompaniesPagination";
import CompanyCard from "./_components/CompanyCard";
import {
    COMPANIES_PER_PAGE,
    fetchCompaniesData,
    parsePageParam,
    type SearchParams,
} from "./_components/companiesData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Companies hiring on JobFlow",
    description:
        "Browse every company registered on JobFlow, see what they do and find the ones with open entry-level roles in Nepal.",
};

interface CompaniesPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
    const resolvedSearchParams = await searchParams;
    const currentPage = parsePageParam(resolvedSearchParams.page);
    const { companies, totalCompanies, facets, error } = await fetchCompaniesData(resolvedSearchParams);

    const totalPages = Math.max(1, Math.ceil(totalCompanies / COMPANIES_PER_PAGE));
    const verifiedCount = companies.filter((company) => company.isVerified).length;
    const openRoles = companies.reduce((total, company) => total + company.openJobs, 0);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <header className="border-b border-ink-100 bg-surface">
                <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cobalt-50 px-2.5 py-1 text-xs font-medium text-cobalt-700">
                        <Building2 size={13} aria-hidden="true" />
                        Company directory
                    </span>

                    <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                        Every company hiring on JobFlow
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base">
                        Explore the teams building in Nepal, learn what they do, and jump straight
                        into the roles they have open right now.
                    </p>

                    <dl className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-ink-400">Companies</dt>
                            <dd className="mt-0.5 text-xl font-semibold text-ink-900">{totalCompanies}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-ink-400">Open roles on this page</dt>
                            <dd className="mt-0.5 text-xl font-semibold text-ink-900">{openRoles}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1 text-xs uppercase tracking-wide text-ink-400">
                                <BadgeCheck size={12} aria-hidden="true" />
                                Verified on this page
                            </dt>
                            <dd className="mt-0.5 text-xl font-semibold text-ink-900">{verifiedCount}</dd>
                        </div>
                    </dl>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <CompaniesFilters searchParams={resolvedSearchParams} facets={facets} />

                {error ? (
                    <div className="mt-8 flex flex-col items-center gap-2 rounded-lg border border-danger-500/30 bg-danger-50 px-6 py-14 text-center">
                        <AlertCircle size={22} className="text-danger-500" aria-hidden="true" />
                        <p className="text-sm font-medium text-danger-700">Could not load companies</p>
                        <p className="max-w-sm text-sm text-ink-600">{error}</p>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="mt-8 flex flex-col items-center gap-2 rounded-lg border border-ink-100 bg-surface px-6 py-16 text-center shadow-card">
                        <SearchX size={22} className="text-ink-400" aria-hidden="true" />
                        <p className="text-sm font-medium text-ink-900">No companies match those filters</p>
                        <p className="max-w-sm text-sm text-ink-500">
                            Try a different industry or location, or clear your filters to see everyone.
                        </p>
                        <Link
                            href="/companies"
                            className="mt-2 text-sm font-medium text-cobalt-500 transition-colors hover:text-cobalt-700"
                        >
                            Clear filters
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="mt-6 text-sm text-ink-500">
                            Showing <span className="font-medium text-ink-800">{companies.length}</span> of{" "}
                            <span className="font-medium text-ink-800">{totalCompanies}</span> companies
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {companies.map((company) => (
                                <CompanyCard key={company.id} company={company} />
                            ))}
                        </div>

                        <div className="mt-6">
                            <CompaniesPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                searchParams={resolvedSearchParams}
                            />
                        </div>
                    </>
                )}

                <section className="mt-10 flex flex-col gap-4 rounded-xl border border-ink-100 bg-surface px-6 py-7 shadow-card sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                            Hiring for your own team?
                        </h2>
                        <p className="mt-1 max-w-md text-sm text-ink-500">
                            Add your company to this directory and start reaching entry-level talent across Nepal.
                        </p>
                    </div>
                    <Link
                        href="/employer-signup"
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-cobalt-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cobalt-600 active:bg-cobalt-700"
                    >
                        List your company
                        <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
}

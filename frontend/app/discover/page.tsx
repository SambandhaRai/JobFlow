import Link from "next/link";
import { AlertCircle, SearchX, SlidersHorizontal } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";
import DiscoverFilters from "./_components/DiscoverFilters";
import DiscoverPagination from "./_components/DiscoverPagination";
import FilterChips from "./_components/FilterChips";
import JobCard from "./_components/JobCard";
import WelcomeBanner from "./_components/WelcomeBanner";
import {
    JOBS_PER_DISCOVER_PAGE,
    fetchDiscoverData,
    getActiveFilters,
    getSavedJobIds,
    parsePositiveIntegerParam,
    type DiscoverUser,
    type SearchParams,
} from "./_components/discoverData";

export const dynamic = "force-dynamic";

interface DiscoverPageProps {
    searchParams: Promise<SearchParams>;
}

const parseUserCookie = (value?: string): DiscoverUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as DiscoverUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as DiscoverUser;
        } catch {
            return null;
        }
    }
};

const getFirstName = (fullName?: string) => {
    const firstName = fullName?.trim().split(/\s+/)[0];
    return firstName || "there";
};

const getParamValues = (value: string | string[] | undefined) => (
    (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean)
);

const getDiscoverPageHref = (searchParams: SearchParams, page: number) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (key === "page") return;
        getParamValues(value).forEach((item) => params.append(key, item));
    });

    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    return query ? `/discover?${query}` : "/discover";
};

const getProfileCompletion = (user: DiscoverUser | null) => {
    if (!user) {
        return {
            percent: 30,
            hint: "Complete your profile to unlock better matches.",
        };
    }

    const hasEducation = Array.isArray(user.educations) && user.educations.length > 0;
    const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;
    const hasResume = Array.isArray(user.resumes) && user.resumes.length > 0;
    const completed = [Boolean(user.fullName), hasEducation, hasSkills, hasResume].filter(Boolean).length;
    const percent = Math.max(25, Math.round((completed / 4) * 100));

    return {
        percent,
        hint: hasResume
            ? "Your profile is ready for stronger matches."
            : "Add 1 resume to qualify for more roles.",
    };
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
    const resolvedSearchParams = await searchParams;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const cookieUser = parseUserCookie(cookieStore.get("user_data")?.value);
    const {
        jobs,
        totalJobs,
        user: fetchedUser,
        error,
    } = await fetchDiscoverData({ token, searchParams: resolvedSearchParams });
    const user = fetchedUser ?? cookieUser;
    const savedJobIds = new Set(getSavedJobIds(user));
    const activeFilters = getActiveFilters(resolvedSearchParams);
    const fullName = user?.fullName ?? "Job seeker";
    const currentPage = parsePositiveIntegerParam(resolvedSearchParams.page);
    const totalPages = Math.max(1, Math.ceil(totalJobs / JOBS_PER_DISCOVER_PAGE));
    const firstResult = totalJobs === 0 ? 0 : ((currentPage - 1) * JOBS_PER_DISCOVER_PAGE) + 1;
    const lastResult = Math.min(currentPage * JOBS_PER_DISCOVER_PAGE, totalJobs);

    if (!error && totalJobs > 0 && currentPage > totalPages) {
        redirect(getDiscoverPageHref(resolvedSearchParams, totalPages));
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={{ name: fullName, subtitle: user?.email ?? "Student" }}
                profileCompletion={getProfileCompletion(user)}
            />

            <div className="min-h-screen transition-[padding] duration-200 lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar
                    userName={fullName}
                    notificationCount={1}
                    defaultSearchValue={
                        Array.isArray(resolvedSearchParams.search)
                            ? resolvedSearchParams.search[0]
                            : resolvedSearchParams.search ?? ""
                    }
                />

                <main className="grid gap-5 px-4 py-5 transition-[grid-template-columns] duration-200 sm:px-6 sm:py-6 xl:grid-cols-[var(--discover-filter-width,260px)_minmax(0,1fr)]">
                    <div className="hidden xl:block">
                        <DiscoverFilters searchParams={resolvedSearchParams} variant="rail" />
                    </div>

                    <section className="min-w-0 space-y-5">
                        <WelcomeBanner
                            firstName={getFirstName(fullName)}
                        />

                        <details className="rounded-lg border border-ink-100 bg-surface shadow-card xl:hidden">
                            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-ink-900">
                                <span className="inline-flex items-center gap-2">
                                    <SlidersHorizontal size={16} className="text-cobalt-600" />
                                    Filters
                                </span>
                                <span className="text-xs font-medium text-ink-500">
                                    {activeFilters.length} active
                                </span>
                            </summary>
                            <div className="border-t border-ink-100 p-3">
                                <DiscoverFilters searchParams={resolvedSearchParams} />
                            </div>
                        </details>

                        <div className="rounded-lg border border-ink-100 bg-surface p-4 shadow-card">
                            <h1 className="text-xl font-semibold tracking-tight text-ink-900">
                                Discover jobs
                            </h1>
                            <p className="mt-1 text-sm text-ink-500">
                                {totalJobs > 0
                                    ? `Showing ${firstResult}-${lastResult} of ${totalJobs.toLocaleString("en-US")} verified roles.`
                                    : "Showing verified roles that match your current search."}
                            </p>

                            {activeFilters.length > 0 && (
                                <div className="mt-4">
                                    <FilterChips filters={activeFilters} searchParams={resolvedSearchParams} />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex gap-3 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Could not load jobs from the backend.</p>
                                    <p className="mt-1 text-danger-700/80">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {jobs.length > 0 ? (
                                <>
                                    {jobs.map((job) => (
                                        <JobCard key={job.id} job={job} isSaved={savedJobIds.has(job.id)} />
                                    ))}

                                    <DiscoverPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        searchParams={resolvedSearchParams}
                                    />
                                </>
                            ) : (
                                <div className="rounded-lg border border-ink-100 bg-surface px-5 py-12 text-center shadow-card">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-ink-50 text-ink-400">
                                        <SearchX size={22} />
                                    </div>
                                    <h2 className="mt-4 text-lg font-semibold text-ink-900">No jobs found</h2>
                                    <p className="mt-2 text-sm text-ink-500">
                                        Try clearing filters or searching for a different role.
                                    </p>
                                    <Link
                                        href="/discover"
                                        className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-cobalt-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                                    >
                                        Clear filters
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

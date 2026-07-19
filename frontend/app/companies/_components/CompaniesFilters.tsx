"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { createCompaniesHref, getFirstParam, type CompanyFacets, type SearchParams } from "./companiesData";

interface CompaniesFiltersProps {
    searchParams: SearchParams;
    facets: CompanyFacets;
}

const selectClass = "h-10 w-full appearance-none rounded-md border border-ink-200 bg-surface bg-[length:16px] bg-[right_0.7rem_center] bg-no-repeat pl-3 pr-9 text-sm text-ink-700 transition-colors hover:border-ink-300 focus:border-cobalt-500 sm:w-44";

// Inlined chevron keeps the native select styleable without extra markup.
const selectChevron = {
    backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A92A0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};

export default function CompaniesFilters({ searchParams, facets }: CompaniesFiltersProps) {
    const router = useRouter();

    const search = getFirstParam(searchParams.q) ?? "";
    const industry = getFirstParam(searchParams.industry) ?? "";
    const location = getFirstParam(searchParams.location) ?? "";
    const hasFilters = Boolean(search || industry || location);

    const applyFilter = (key: string, value: string) => {
        router.push(createCompaniesHref(searchParams, { [key]: value || undefined }));
    };

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("q");
        applyFilter("q", typeof value === "string" ? value.trim() : "");
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={onSubmit} className="relative flex-1">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                    aria-hidden="true"
                />
                <input
                    key={search}
                    type="search"
                    name="q"
                    defaultValue={search}
                    placeholder="Search companies by name, industry or location"
                    aria-label="Search companies"
                    className="h-10 w-full rounded-md border border-ink-200 bg-surface pl-9 pr-3 text-sm text-ink-800 transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-cobalt-500"
                />
            </form>

            <select
                value={industry}
                onChange={(event) => applyFilter("industry", event.target.value)}
                aria-label="Filter by industry"
                className={selectClass}
                style={selectChevron}
            >
                <option value="">All industries</option>
                {facets.industries.map((item) => (
                    <option key={item} value={item}>{item}</option>
                ))}
            </select>

            <select
                value={location}
                onChange={(event) => applyFilter("location", event.target.value)}
                aria-label="Filter by location"
                className={selectClass}
                style={selectChevron}
            >
                <option value="">All locations</option>
                {facets.locations.map((item) => (
                    <option key={item} value={item}>{item}</option>
                ))}
            </select>

            {hasFilters && (
                <button
                    type="button"
                    onClick={() => router.push("/companies")}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
                >
                    <X size={14} aria-hidden="true" />
                    Clear
                </button>
            )}
        </div>
    );
}

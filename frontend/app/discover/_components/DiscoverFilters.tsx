"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, SlidersHorizontal } from "lucide-react";

import {
    categoryOptions,
    experienceOptions,
    getActiveFilters,
    jobTypeOptions,
    locationOptions,
    salaryOptions,
    workModeOptions,
    type FilterOption,
    type SearchParams,
} from "./discoverData";

interface DiscoverFiltersProps {
    searchParams: SearchParams;
    variant?: "panel" | "rail";
}

const FILTER_STORAGE_KEY = "jobflow-discover-filters-collapsed";
const FILTER_EXPANDED_WIDTH = "260px";
const FILTER_COLLAPSED_WIDTH = "64px";

const getFirstParam = (value: string | string[] | undefined) => (
    Array.isArray(value) ? value[0] : value
);

const getParamValues = (value: string | string[] | undefined) => (
    (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean)
);

const copySearchParams = (searchParams: SearchParams) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (key === "page") return;

        getParamValues(value).forEach((item) => {
            params.append(key, item);
        });
    });

    return params;
};

const createFilterHref = (
    searchParams: SearchParams,
    values: Record<string, string | number | undefined>,
) => {
    const params = copySearchParams(searchParams);

    const entries = Object.entries(values);
    const isSelected = entries.every(([key, value]) => {
        const currentValue = params.get(key);
        if (value === undefined) return currentValue === null || currentValue === "";
        return currentValue === String(value);
    });

    entries.forEach(([key, value]) => {
        if (isSelected || value === undefined) {
            params.delete(key);
            return;
        }

        params.set(key, String(value));
    });

    const query = params.toString();
    return query ? `/discover?${query}` : "/discover";
};

const createMultiFilterHref = (
    searchParams: SearchParams,
    key: string,
    value: string,
) => {
    const params = copySearchParams(searchParams);
    const selectedValues = getParamValues(searchParams[key]);
    const nextValues = selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value];

    params.delete(key);
    nextValues.forEach((item) => params.append(key, item));

    const query = params.toString();
    return query ? `/discover?${query}` : "/discover";
};

const createToggleMoreHref = (searchParams: SearchParams, showMoreFilters: boolean) => {
    const params = copySearchParams(searchParams);
    params.delete("moreFilters");

    if (!showMoreFilters) params.set("moreFilters", "true");

    const query = params.toString();
    return query ? `/discover?${query}` : "/discover";
};

function FilterLink<TValue extends string>({
    option,
    queryKey,
    searchParams,
}: {
    option: FilterOption<TValue>;
    queryKey: string;
    searchParams: SearchParams;
}) {
    const checked = getParamValues(searchParams[queryKey]).includes(option.value);

    return (
        <Link
            href={createMultiFilterHref(searchParams, queryKey, option.value)}
            className={[
                "flex min-h-9 items-center gap-3 rounded-md px-2 text-sm transition-colors",
                checked
                    ? "bg-cobalt-50 text-cobalt-700"
                    : "text-ink-700 hover:bg-ink-50",
            ].join(" ")}
        >
            <span
                className={[
                    "flex h-4 w-4 items-center justify-center rounded border",
                    checked
                        ? "border-cobalt-500 bg-cobalt-500"
                        : "border-ink-200 bg-surface",
                ].join(" ")}
            >
                {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            {option.label}
        </Link>
    );
}

function FilterSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="border-t border-ink-100 pt-5 first:border-t-0 first:pt-0">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">{title}</h2>
            <div className="space-y-1">{children}</div>
        </section>
    );
}

export default function DiscoverFilters({ searchParams, variant = "panel" }: DiscoverFiltersProps) {
    const isRail = variant === "rail";
    const [isCollapsed, setIsCollapsed] = useState(false);
    const selectedMinSalary = getFirstParam(searchParams.minSalary);
    const selectedMaxSalary = getFirstParam(searchParams.maxSalary);
    const activeFilterCount = getActiveFilters(searchParams).length;
    const showMoreFilters = getFirstParam(searchParams.moreFilters) === "true" ||
        Boolean(
            selectedMinSalary ||
            selectedMaxSalary ||
            getFirstParam(searchParams.location) ||
            getFirstParam(searchParams.category),
        );

    useEffect(() => {
        if (!isRail) return;

        const storedValue = window.localStorage.getItem(FILTER_STORAGE_KEY);
        const storedCollapsed = storedValue === "true";
        const frame = window.requestAnimationFrame(() => {
            setIsCollapsed(storedCollapsed);
        });

        document.documentElement.style.setProperty(
            "--discover-filter-width",
            storedCollapsed ? FILTER_COLLAPSED_WIDTH : FILTER_EXPANDED_WIDTH,
        );

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [isRail]);

    const toggleFilters = () => {
        setIsCollapsed((current) => {
            const next = !current;

            window.localStorage.setItem(FILTER_STORAGE_KEY, String(next));
            document.documentElement.style.setProperty(
                "--discover-filter-width",
                next ? FILTER_COLLAPSED_WIDTH : FILTER_EXPANDED_WIDTH,
            );

            return next;
        });
    };

    if (isRail && isCollapsed) {
        return (
            <aside className="sticky top-20 flex min-h-16 flex-col items-center gap-3 rounded-lg border border-ink-100 bg-surface p-2 shadow-card">
                <button
                    type="button"
                    onClick={toggleFilters}
                    className="relative flex h-10 w-10 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-cobalt-50 hover:text-cobalt-700"
                    aria-label="Expand filters"
                    title="Expand filters"
                    aria-expanded={false}
                >
                    <SlidersHorizontal size={17} />
                    {activeFilterCount > 0 && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cobalt-500 ring-2 ring-surface" />
                    )}
                </button>
                <button
                    type="button"
                    onClick={toggleFilters}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                    aria-label="Expand filter rail"
                    title="Expand filter rail"
                    aria-expanded={false}
                >
                    <PanelLeftOpen size={15} />
                </button>
            </aside>
        );
    }

    return (
        <aside
            className={[
                "rounded-lg border border-ink-100 bg-surface p-4 shadow-card",
                isRail ? "sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden" : "",
            ].join(" ")}
        >
            <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                        <SlidersHorizontal size={16} />
                    </span>
                    <h2 className="text-sm font-semibold text-ink-900">Filters</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/discover" className="text-xs font-medium text-cobalt-500 hover:text-cobalt-700">
                        Reset
                    </Link>
                    {isRail && (
                        <button
                            type="button"
                            onClick={toggleFilters}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                            aria-label="Collapse filters"
                            title="Collapse filters"
                            aria-expanded
                        >
                            <PanelLeftClose size={15} />
                        </button>
                    )}
                </div>
            </div>

            <div className={["space-y-5", isRail ? "min-h-0 overflow-y-auto pr-1" : ""].join(" ")}>
                <FilterSection title="Job type">
                    {jobTypeOptions.map((option) => (
                        <FilterLink key={option.value} option={option} queryKey="jobType" searchParams={searchParams} />
                    ))}
                </FilterSection>

                <FilterSection title="Experience level">
                    {experienceOptions.map((option) => (
                        <FilterLink
                            key={option.value}
                            option={option}
                            queryKey="experienceLevel"
                            searchParams={searchParams}
                        />
                    ))}
                </FilterSection>

                <FilterSection title="Work mode">
                    {workModeOptions.map((option) => (
                        <FilterLink
                            key={option.value}
                            option={option}
                            queryKey="workMode"
                            searchParams={searchParams}
                        />
                    ))}
                </FilterSection>

                {showMoreFilters && (
                    <>
                        <FilterSection title="Salary">
                            {salaryOptions.map((option) => {
                                const checked = String(option.minSalary ?? "") === (selectedMinSalary ?? "") &&
                                    String(option.maxSalary ?? "") === (selectedMaxSalary ?? "");

                                return (
                                    <Link
                                        key={option.label}
                                        href={createFilterHref(searchParams, {
                                            minSalary: option.minSalary,
                                            maxSalary: option.maxSalary,
                                        })}
                                        className={[
                                            "flex min-h-9 items-center gap-3 rounded-md px-2 text-sm transition-colors",
                                            checked
                                                ? "bg-cobalt-50 text-cobalt-700"
                                                : "text-ink-700 hover:bg-ink-50",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={[
                                                "flex h-4 w-4 items-center justify-center rounded border",
                                                checked
                                                    ? "border-cobalt-500 bg-cobalt-500"
                                                    : "border-ink-200 bg-surface",
                                            ].join(" ")}
                                        >
                                            {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                        </span>
                                        {option.label}
                                    </Link>
                                );
                            })}
                        </FilterSection>

                        <FilterSection title="Location">
                            {locationOptions.map((option) => (
                                <FilterLink
                                    key={option.value}
                                    option={option}
                                    queryKey="location"
                                    searchParams={searchParams}
                                />
                            ))}
                        </FilterSection>

                        <FilterSection title="Job category">
                            {categoryOptions.map((option) => (
                                <FilterLink
                                    key={option.value}
                                    option={option}
                                    queryKey="category"
                                    searchParams={searchParams}
                                />
                            ))}
                        </FilterSection>
                    </>
                )}
            </div>

            <div className={["shrink-0", isRail ? "mt-4 border-t border-ink-100 pt-3" : "mt-5"].join(" ")}>
                <Link
                    href={createToggleMoreHref(searchParams, showMoreFilters)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-cobalt-100 bg-cobalt-50 px-3 py-2.5 text-cobalt-700 transition-colors hover:border-cobalt-200 hover:bg-cobalt-100"
                >
                    <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                            {showMoreFilters ? "Less Filters" : "More Filters"}
                        </span>
                        <span className="block truncate text-xs font-medium text-cobalt-600">
                            {showMoreFilters ? "Hide salary, location, category" : "Salary, location, category"}
                        </span>
                    </span>
                    <ChevronDown
                        size={16}
                        className={[
                            "shrink-0 transition-transform",
                            showMoreFilters ? "rotate-180" : "",
                        ].join(" ")}
                    />
                </Link>
            </div>
        </aside>
    );
}

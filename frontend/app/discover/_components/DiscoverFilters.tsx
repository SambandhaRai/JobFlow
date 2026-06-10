import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import {
    categoryOptions,
    experienceOptions,
    jobTypeOptions,
    locationOptions,
    salaryOptions,
    workModeOptions,
    type FilterOption,
    type SearchParams,
} from "./discoverData";

interface DiscoverFiltersProps {
    searchParams: SearchParams;
}

const getFirstParam = (value: string | string[] | undefined) => (
    Array.isArray(value) ? value[0] : value
);

const createFilterHref = (
    searchParams: SearchParams,
    values: Record<string, string | number | undefined>,
) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([paramKey, paramValue]) => {
        const firstValue = getFirstParam(paramValue);
        if (firstValue && paramKey !== "page") params.set(paramKey, firstValue);
    });

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

const createToggleMoreHref = (searchParams: SearchParams, showMoreFilters: boolean) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        const firstValue = getFirstParam(value);
        if (firstValue && key !== "moreFilters") params.set(key, firstValue);
    });

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
    const checked = getFirstParam(searchParams[queryKey]) === option.value;

    return (
        <Link
            href={createFilterHref(searchParams, { [queryKey]: option.value })}
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
    children: React.ReactNode;
}) {
    return (
        <section className="border-t border-ink-100 pt-5 first:border-t-0 first:pt-0">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">{title}</h2>
            <div className="space-y-1">{children}</div>
        </section>
    );
}

export default function DiscoverFilters({ searchParams }: DiscoverFiltersProps) {
    const selectedMinSalary = getFirstParam(searchParams.minSalary);
    const selectedMaxSalary = getFirstParam(searchParams.maxSalary);
    const showMoreFilters = getFirstParam(searchParams.moreFilters) === "true" ||
        Boolean(
            selectedMinSalary ||
            selectedMaxSalary ||
            getFirstParam(searchParams.location) ||
            getFirstParam(searchParams.category),
        );

    return (
        <aside className="rounded-lg border border-ink-100 bg-surface p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                        <SlidersHorizontal size={16} />
                    </span>
                    <h2 className="text-sm font-semibold text-ink-900">Filters</h2>
                </div>
                <Link href="/discover" className="text-xs font-medium text-cobalt-500 hover:text-cobalt-700">
                    Reset
                </Link>
            </div>

            <div className="space-y-5">
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

                <Link
                    href={createToggleMoreHref(searchParams, showMoreFilters)}
                    className="mt-8 flex w-full items-center justify-between text-sm font-medium text-ink-900"
                >
                    {showMoreFilters ? "Less Filters" : "More Filters"}
                    <ChevronDown
                        size={16}
                        className={[
                            "text-ink-500 transition-transform",
                            showMoreFilters ? "rotate-180" : "",
                        ].join(" ")}
                    />
                </Link>
            </div>
        </aside>
    );
}

import { X } from "lucide-react";
import Link from "next/link";

import type { ActiveFilter } from "./discoverData";

interface FilterChipsProps {
    filters: ActiveFilter[];
    searchParams: Record<string, string | string[] | undefined>;
}

const getFirstParam = (value: string | string[] | undefined) => (
    Array.isArray(value) ? value[0] : value
);

const getRemoveHref = (
    searchParams: Record<string, string | string[] | undefined>,
    filter: ActiveFilter,
) => {
    const params = new URLSearchParams();
    const keysToRemove = new Set(filter.keys ?? [filter.key]);

    Object.entries(searchParams).forEach(([key, value]) => {
        const firstValue = getFirstParam(value);
        if (firstValue && key !== "page" && !keysToRemove.has(key)) params.set(key, firstValue);
    });

    const query = params.toString();
    return query ? `/discover?${query}` : "/discover";
};

export default function FilterChips({ filters, searchParams }: FilterChipsProps) {
    if (filters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
                <Link
                    key={filter.key}
                    href={getRemoveHref(searchParams, filter)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-cobalt-100 bg-cobalt-50 px-3 text-sm font-medium text-cobalt-600"
                >
                    {filter.label}
                    <X size={13} />
                </Link>
            ))}
            <Link href="/discover" className="ml-1 text-sm text-ink-500 hover:text-ink-800">
                Clear all
            </Link>
        </div>
    );
}

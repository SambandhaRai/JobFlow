import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { SearchParams } from "./discoverData";

interface DiscoverPaginationProps {
    currentPage: number;
    totalPages: number;
    searchParams: SearchParams;
}

const getFirstParam = (value: string | string[] | undefined) => (
    Array.isArray(value) ? value[0] : value
);

const getPageHref = (searchParams: SearchParams, page: number) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        const firstValue = getFirstParam(value);
        if (firstValue && key !== "page") params.set(key, firstValue);
    });

    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    return query ? `/discover?${query}` : "/discover";
};

const getVisiblePages = (currentPage: number, totalPages: number) => {
    const pageSet = new Set([1, totalPages]);

    for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
        if (page >= 1 && page <= totalPages) pageSet.add(page);
    }

    return Array.from(pageSet).sort((a, b) => a - b);
};

function PageLink({
    page,
    currentPage,
    searchParams,
}: {
    page: number;
    currentPage: number;
    searchParams: SearchParams;
}) {
    const isCurrent = page === currentPage;

    return (
        <Link
            href={getPageHref(searchParams, page)}
            aria-current={isCurrent ? "page" : undefined}
            className={[
                "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
                isCurrent
                    ? "border-cobalt-500 bg-cobalt-500 text-white"
                    : "border-ink-100 bg-surface text-ink-700 hover:border-cobalt-100 hover:bg-cobalt-50 hover:text-cobalt-700",
            ].join(" ")}
        >
            {page}
        </Link>
    );
}

export default function DiscoverPagination({
    currentPage,
    totalPages,
    searchParams,
}: DiscoverPaginationProps) {
    if (totalPages <= 1) return null;

    const pages = getVisiblePages(currentPage, totalPages);

    return (
        <nav
            className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-surface px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between"
            aria-label="Job results pagination"
        >
            <p className="text-sm text-ink-500">
                Page <span className="font-semibold text-ink-900">{currentPage}</span> of{" "}
                <span className="font-semibold text-ink-900">{totalPages}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
                {currentPage > 1 ? (
                    <Link
                        href={getPageHref(searchParams, currentPage - 1)}
                        className="inline-flex h-9 items-center gap-1 rounded-md border border-ink-100 bg-surface px-3 text-sm font-medium text-ink-700 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50 hover:text-cobalt-700"
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </Link>
                ) : (
                    <span className="inline-flex h-9 items-center gap-1 rounded-md border border-ink-100 bg-ink-50 px-3 text-sm font-medium text-ink-300">
                        <ChevronLeft size={16} />
                        Previous
                    </span>
                )}

                <div className="flex items-center gap-2">
                    {pages.map((page, index) => {
                        const previousPage = pages[index - 1];
                        const hasGap = previousPage && page - previousPage > 1;

                        return (
                            <span key={page} className="flex items-center gap-2">
                                {hasGap && <span className="text-sm text-ink-400">...</span>}
                                <PageLink page={page} currentPage={currentPage} searchParams={searchParams} />
                            </span>
                        );
                    })}
                </div>

                {currentPage < totalPages ? (
                    <Link
                        href={getPageHref(searchParams, currentPage + 1)}
                        className="inline-flex h-9 items-center gap-1 rounded-md border border-ink-100 bg-surface px-3 text-sm font-medium text-ink-700 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50 hover:text-cobalt-700"
                    >
                        Next
                        <ChevronRight size={16} />
                    </Link>
                ) : (
                    <span className="inline-flex h-9 items-center gap-1 rounded-md border border-ink-100 bg-ink-50 px-3 text-sm font-medium text-ink-300">
                        Next
                        <ChevronRight size={16} />
                    </span>
                )}
            </div>
        </nav>
    );
}

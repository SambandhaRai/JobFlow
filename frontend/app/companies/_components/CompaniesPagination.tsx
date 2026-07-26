import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { createCompaniesHref, type SearchParams } from "./companiesData";

interface CompaniesPaginationProps {
    currentPage: number;
    totalPages: number;
    searchParams: SearchParams;
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
    const pageSet = new Set([1, totalPages]);

    for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
        if (page >= 1 && page <= totalPages) pageSet.add(page);
    }

    return Array.from(pageSet).sort((a, b) => a - b);
};

const stepClass = "inline-flex h-9 items-center gap-1 rounded-md border border-ink-100 bg-surface px-3 text-sm font-medium text-ink-700 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50 hover:text-cobalt-700";
const stepDisabledClass = "inline-flex h-9 items-center gap-1 rounded-md border border-ink-100 bg-ink-50 px-3 text-sm font-medium text-ink-300";

export default function CompaniesPagination({
    currentPage,
    totalPages,
    searchParams,
}: CompaniesPaginationProps) {
    if (totalPages <= 1) return null;

    const pages = getVisiblePages(currentPage, totalPages);

    return (
        <nav
            className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-surface px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between"
            aria-label="Companies pagination"
        >
            <p className="text-sm text-ink-500">
                Page <span className="font-semibold text-ink-900">{currentPage}</span> of{" "}
                <span className="font-semibold text-ink-900">{totalPages}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
                {currentPage > 1 ? (
                    <Link href={createCompaniesHref(searchParams, { page: currentPage - 1 })} className={stepClass}>
                        <ChevronLeft size={16} aria-hidden="true" />
                        Previous
                    </Link>
                ) : (
                    <span className={stepDisabledClass}>
                        <ChevronLeft size={16} aria-hidden="true" />
                        Previous
                    </span>
                )}

                <div className="flex items-center gap-2">
                    {pages.map((page, index) => {
                        const previousPage = pages[index - 1];
                        const hasGap = previousPage && page - previousPage > 1;
                        const isCurrent = page === currentPage;

                        return (
                            <span key={page} className="flex items-center gap-2">
                                {hasGap && <span className="text-sm text-ink-400">...</span>}
                                <Link
                                    href={createCompaniesHref(searchParams, { page })}
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
                            </span>
                        );
                    })}
                </div>

                {currentPage < totalPages ? (
                    <Link href={createCompaniesHref(searchParams, { page: currentPage + 1 })} className={stepClass}>
                        Next
                        <ChevronRight size={16} aria-hidden="true" />
                    </Link>
                ) : (
                    <span className={stepDisabledClass}>
                        Next
                        <ChevronRight size={16} aria-hidden="true" />
                    </span>
                )}
            </div>
        </nav>
    );
}

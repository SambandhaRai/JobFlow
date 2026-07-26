import Link from "next/link";
import { ArrowUpRight, Briefcase, Building2, MapPin } from "lucide-react";

import CompanyAvatar from "../../_components/CompanyAvatar";
import VerifiedBadge from "../../_components/VerifiedBadge";
import type { PublicCompany } from "./companiesData";

interface CompanyCardProps {
    company: PublicCompany;
}

export default function CompanyCard({ company }: CompanyCardProps) {
    return (
        <Link
            href={`/companies/${company.id}`}
            className="group flex h-full flex-col rounded-lg border border-ink-100 bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-cobalt-200 hover:shadow-popover"
        >
            <div className="flex items-start gap-3">
                <CompanyAvatar name={company.name} imageUrl={company.logoUrl} size="lg" />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-1.5">
                        <h2 className="truncate text-base font-semibold tracking-tight text-ink-900 transition-colors group-hover:text-cobalt-600">
                            {company.name}
                        </h2>
                        <ArrowUpRight
                            size={15}
                            className="mt-0.5 shrink-0 text-ink-300 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden="true"
                        />
                    </div>

                    {company.industry && (
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-500">
                            <Building2 size={13} className="shrink-0 text-ink-400" aria-hidden="true" />
                            {company.industry}
                        </p>
                    )}
                </div>
            </div>

            {company.description && (
                <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-ink-600">
                    {company.description}
                </p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-xs text-ink-500">
                {company.location && (
                    <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-ink-400" aria-hidden="true" />
                        {company.location}
                    </span>
                )}

                <span className="flex items-center gap-1.5">
                    <Briefcase size={13} className="text-ink-400" aria-hidden="true" />
                    {company.openJobs === 0
                        ? "No open roles"
                        : `${company.openJobs} open role${company.openJobs === 1 ? "" : "s"}`}
                </span>

                {company.isVerified && <VerifiedBadge className="ml-auto" />}
            </div>
        </Link>
    );
}

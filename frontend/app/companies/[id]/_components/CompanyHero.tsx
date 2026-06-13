import { Globe, Mail, MapPin, Phone } from "lucide-react";

import CompanyAvatar from "../../../_components/CompanyAvatar";
import VerifiedBadge from "../../../_components/VerifiedBadge";
import type { CompanyDetails } from "./companyDetailsData";

export default function CompanyHero({ company }: { company: CompanyDetails }) {
    return (
        <section className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                {company.logoUrl ? (
                    // logoUrl is a free-text field that can point to any host, so a plain
                    // <img> avoids next/image's allowed-domains restriction.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-lg border border-ink-100 object-cover"
                    />
                ) : (
                    <CompanyAvatar name={company.name} size="xl" className="rounded-lg" />
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-3xl">
                            {company.name}
                        </h1>
                        {company.isVerified && <VerifiedBadge label="Verified company" />}
                    </div>

                    {(company.industry || company.location || company.memberSince) && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
                            {company.industry && <span>{company.industry}</span>}
                            {company.industry && company.location && <span aria-hidden="true">/</span>}
                            {company.location && (
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin size={15} className="text-ink-400" />
                                    {company.location}
                                </span>
                            )}
                            {company.memberSince && (
                                <>
                                    <span aria-hidden="true">/</span>
                                    <span>On JobFlow since {company.memberSince}</span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                        {company.website && (
                            <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-medium text-cobalt-500 transition-colors hover:text-cobalt-700"
                            >
                                <Globe size={15} />
                                {company.websiteLabel ?? "Website"}
                            </a>
                        )}
                        {company.email && (
                            <a
                                href={`mailto:${company.email}`}
                                className="inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:text-ink-800"
                            >
                                <Mail size={15} className="text-ink-400" />
                                {company.email}
                            </a>
                        )}
                        {company.phone && (
                            <a
                                href={`tel:${company.phone}`}
                                className="inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:text-ink-800"
                            >
                                <Phone size={15} className="text-ink-400" />
                                {company.phone}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

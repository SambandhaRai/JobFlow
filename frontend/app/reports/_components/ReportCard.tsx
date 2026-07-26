import Link from "next/link";
import { CheckCircle2, Clock, MinusCircle } from "lucide-react";

import CompanyAvatar from "../../_components/CompanyAvatar";
import Badge, { type BadgeTone } from "../../_components/Badge";
import { STATUS_COPY, type ReportItem, type ReportStatus } from "./reportsData";

const STATUS_STYLES: Record<ReportStatus, { tone: BadgeTone; icon: typeof Clock }> = {
    open: { tone: "warning", icon: Clock },
    reviewed: { tone: "success", icon: CheckCircle2 },
    dismissed: { tone: "neutral", icon: MinusCircle },
};

export default function ReportCard({ report }: { report: ReportItem }) {
    const { tone, icon: Icon } = STATUS_STYLES[report.status];
    const copy = STATUS_COPY[report.status];

    return (
        <li className="rounded-lg border border-ink-100 bg-surface p-4 shadow-card">
            <div className="flex items-start gap-3">
                <CompanyAvatar name={report.company} imageUrl={report.companyLogo} size="md" />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                        <div className="min-w-0">
                            {report.jobId ? (
                                <Link
                                    href={`/jobs/${report.jobId}`}
                                    className="truncate text-sm font-semibold text-ink-900 transition-colors hover:text-cobalt-600"
                                >
                                    {report.role}
                                </Link>
                            ) : (
                                <span className="truncate text-sm font-semibold text-ink-500">{report.role}</span>
                            )}
                            <p className="mt-0.5 truncate text-sm text-ink-500">
                                {report.company}
                                {report.location ? ` · ${report.location}` : ""}
                            </p>
                        </div>

                        <Badge tone={tone} icon={<Icon size={12} />}>
                            {copy.label}
                        </Badge>
                    </div>

                    <p className="mt-3 text-sm text-ink-700">
                        <span className="text-ink-400">Reason:</span> {report.reasonLabel}
                    </p>

                    {report.message && (
                        <p className="mt-1.5 border-l-2 border-ink-100 pl-3 text-sm italic text-ink-500">
                            {report.message}
                        </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                        <span>Submitted {report.submittedLabel}</span>
                        {report.updatedLabel && <span>Updated {report.updatedLabel}</span>}
                    </div>

                    <p className="mt-2.5 rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-600">
                        {copy.blurb}
                    </p>
                </div>
            </div>
        </li>
    );
}

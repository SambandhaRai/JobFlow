import { ArrowRight } from "lucide-react";

import CompanyAvatar from "../../_components/CompanyAvatar";
import VerifiedBadge from "../../_components/VerifiedBadge";

interface FloatingJobCardProps {
    company: string;
    title: string;
    tags: string[];
    salary: string;
    className?: string;
}

export default function FloatingJobCard({
    company,
    title,
    tags,
    salary,
    className = "",
}: FloatingJobCardProps) {
    return (
        <div
            className={[
                "bg-surface rounded-lg border border-ink-100 p-3.5 w-64 shadow-popover",
                className,
            ].join(" ")}
        >
            <div className="flex items-center gap-2.5 mb-2">
                <CompanyAvatar name={company} size="sm" />
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-ink-900 truncate">{title}</p>
                        <VerifiedBadge label="" />
                    </div>
                    <p className="text-xs text-ink-500 truncate">{company}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-2.5">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-ink-50 text-ink-600 border border-ink-100"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-800">{salary}</span>
                <button
                    type="button"
                    className="text-xs font-medium text-cobalt-500 hover:text-cobalt-700 flex items-center gap-0.5 transition-colors"
                >
                    Quick apply
                    <ArrowRight size={11} />
                </button>
            </div>
        </div>
    );
}

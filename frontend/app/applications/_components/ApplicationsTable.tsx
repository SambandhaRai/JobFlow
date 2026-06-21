"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

import CompanyAvatar from "../../_components/CompanyAvatar";
import StatusBadge, { type ApplicationStatus } from "../../_components/StatusBadge";
import type { ApplicationItem } from "./applicationsData";

interface ApplicationsTableProps {
    applications: ApplicationItem[];
}

type TabKey = "all" | "active" | "shortlisted" | "interviews" | "closed";

const TAB_MATCHERS: Record<TabKey, (status: ApplicationStatus) => boolean> = {
    all: () => true,
    active: (status) => status !== "not_selected",
    shortlisted: (status) => status === "shortlisted",
    interviews: (status) => status === "interview_scheduled",
    closed: (status) => status === "not_selected",
};

const TABS: Array<{ key: TabKey; label: string }> = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "interviews", label: "Interviews" },
    { key: "closed", label: "Closed" },
];

const GRID_COLS = "md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_auto_minmax(0,1fr)_auto]";

export default function ApplicationsTable({ applications }: ApplicationsTableProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("all");

    const counts = useMemo(() => {
        return TABS.reduce<Record<TabKey, number>>((acc, tab) => {
            acc[tab.key] = applications.filter((item) => TAB_MATCHERS[tab.key](item.status)).length;
            return acc;
        }, { all: 0, active: 0, shortlisted: 0, interviews: 0, closed: 0 });
    }, [applications]);

    const filtered = useMemo(
        () => applications.filter((item) => TAB_MATCHERS[activeTab](item.status)),
        [applications, activeTab],
    );

    return (
        <div>
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-x-1 border-b border-ink-100">
                {TABS.map((tab) => {
                    const isActive = tab.key === activeTab;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={[
                                "relative inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive ? "text-cobalt-700" : "text-ink-500 hover:text-ink-800",
                            ].join(" ")}
                        >
                            {tab.label}
                            <span
                                className={[
                                    "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                                    isActive ? "bg-cobalt-500 text-white" : "bg-ink-100 text-ink-500",
                                ].join(" ")}
                            >
                                {counts[tab.key]}
                            </span>
                            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-cobalt-500" />}
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="mt-4 overflow-hidden rounded-lg border border-ink-100 bg-surface shadow-card">
                {/* Header (desktop only) */}
                <div className={`hidden border-b border-ink-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-400 md:grid md:items-center md:gap-4 ${GRID_COLS}`}>
                    <span>Role</span>
                    <span>Applied</span>
                    <span>Status</span>
                    <span>Last update</span>
                    <span className="justify-self-end" aria-hidden="true" />
                </div>

                {filtered.length > 0 ? (
                    <div className="divide-y divide-ink-100">
                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className={`group/row relative grid grid-cols-1 gap-2 px-4 py-4 transition-colors hover:bg-ink-50/60 md:items-center md:gap-4 md:px-5 ${GRID_COLS}`}
                            >
                                {/* Role */}
                                <div className="flex min-w-0 items-center gap-3">
                                    <CompanyAvatar name={item.company} size="md" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink-900">
                                            {item.jobId ? (
                                                <Link
                                                    href={`/jobs/${item.jobId}`}
                                                    className="transition-colors after:absolute after:inset-0 group-hover/row:text-cobalt-700"
                                                >
                                                    {item.role}
                                                </Link>
                                            ) : (
                                                item.role
                                            )}
                                        </p>
                                        <p className="truncate text-xs text-ink-500">{item.company}</p>
                                    </div>
                                </div>

                                {/* Applied */}
                                <div className="flex items-center gap-2 text-sm text-ink-600">
                                    <span className="text-xs font-medium uppercase tracking-wide text-ink-400 md:hidden">Applied</span>
                                    {item.appliedLabel}
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium uppercase tracking-wide text-ink-400 md:hidden">Status</span>
                                    <StatusBadge status={item.status} />
                                </div>

                                {/* Last update */}
                                <div className="flex items-center gap-2 text-sm text-ink-600">
                                    <span className="text-xs font-medium uppercase tracking-wide text-ink-400 md:hidden">Updated</span>
                                    {item.updatedLabel}
                                </div>

                                {/* View */}
                                <div className="md:justify-self-end">
                                    {item.jobId && (
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-cobalt-600">
                                            View
                                            <ArrowRight size={14} className="transition-transform group-hover/row:translate-x-0.5" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-12 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-ink-50 text-ink-400">
                            <Inbox size={20} />
                        </div>
                        <p className="mt-3 text-sm font-medium text-ink-900">Nothing here yet</p>
                        <p className="mt-1 text-sm text-ink-500">
                            No applications in this tab. Check another tab or keep applying.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

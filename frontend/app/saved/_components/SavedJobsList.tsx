"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, Sparkles } from "lucide-react";

import JobCard from "../../discover/_components/JobCard";
import type { Job } from "../../discover/_components/discoverData";

interface SavedJobsListProps {
    jobs: Job[];
}

export default function SavedJobsList({ jobs }: SavedJobsListProps) {
    const router = useRouter();
    const [items, setItems] = useState<Job[]>(jobs);

    const handleToggleSaved = (jobId: string, saved: boolean) => {
        if (saved) return;
        setItems((current) => current.filter((job) => job.id !== jobId));
        router.refresh();
    };

    if (items.length === 0) {
        return (
            <div className="mt-6 rounded-lg border border-ink-100 bg-surface px-5 py-14 text-center shadow-card">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                    <Bookmark size={22} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-ink-900">No saved jobs yet</h2>
                <p className="mt-2 text-sm text-ink-500">
                    Tap the bookmark on any role to keep it here, so you can come back and apply when you&apos;re ready.
                </p>
                <Link
                    href="/discover"
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                >
                    <Sparkles size={15} />
                    Browse verified jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-4">
            {items.map((job) => (
                <JobCard
                    key={job.id}
                    job={job}
                    isSaved
                    onToggleSaved={(saved) => handleToggleSaved(job.id, saved)}
                />
            ))}
        </div>
    );
}

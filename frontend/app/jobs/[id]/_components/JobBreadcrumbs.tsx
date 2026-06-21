import Link from "next/link";

import BackButton from "../../../_components/BackButton";
import type { JobDetails } from "./jobDetailsData";

export default function JobBreadcrumbs({ job }: { job: JobDetails }) {
    const categoryHref = `/discover?category=${encodeURIComponent(job.category)}`;

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <BackButton fallbackHref="/discover" />
            <span className="h-4 w-px bg-ink-200" aria-hidden="true" />
            <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-400">
                <Link href="/discover" className="transition-colors hover:text-cobalt-600">
                    Discover
                </Link>
                <span>/</span>
                <Link href={categoryHref} className="transition-colors hover:text-cobalt-600">
                    {job.category}
                </Link>
                <span>/</span>
                <span className="text-ink-700">{job.title}</span>
            </nav>
        </div>
    );
}

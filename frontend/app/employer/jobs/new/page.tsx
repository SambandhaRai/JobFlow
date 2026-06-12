import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CreateJobForm from "../../_components/CreateJobForm";

export const dynamic = "force-dynamic";

export default function NewJobPage() {
    return (
        <section>
            <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-cobalt-600 hover:text-cobalt-700">
                <ArrowLeft size={15} />
                Back to my jobs
            </Link>

            <h1 className="mt-3 text-lg font-semibold text-ink-900">Post a job</h1>
            <p className="mt-1 text-sm text-ink-500">
                New jobs are reviewed by an admin before they go live.
            </p>

            <div className="mt-5">
                <CreateJobForm />
            </div>
        </section>
    );
}

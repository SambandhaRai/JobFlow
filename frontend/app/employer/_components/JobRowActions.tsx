"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { deleteJob } from "../../../lib/api/job/job";

interface JobRowActionsProps {
    jobId: string;
}

export default function JobRowActions({ jobId }: JobRowActionsProps) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Delete this job? This can't be undone.")) return;
        setBusy(true);
        try {
            await deleteJob(jobId);
            toast.success("Job deleted");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not delete job");
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="rounded-md border border-danger-500/30 px-2.5 py-1 text-xs font-medium text-danger-700 transition-colors hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            Delete
        </button>
    );
}

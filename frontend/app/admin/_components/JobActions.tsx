"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { deleteJob, verifyJob } from "../../../lib/api/admin/job";
import AdminButton from "./AdminButton";

interface JobActionsProps {
    jobId: string;
    isVerified: boolean;
}

export default function JobActions({ jobId, isVerified }: JobActionsProps) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const handleVerify = async () => {
        setBusy(true);
        try {
            await verifyJob(jobId);
            toast.success("Job verified");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not verify job");
        } finally {
            setBusy(false);
        }
    };

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
        <div className="flex gap-2">
            {!isVerified && (
                <AdminButton tone="verify" onClick={handleVerify} disabled={busy}>
                    Verify
                </AdminButton>
            )}
            <AdminButton tone="delete" onClick={handleDelete} disabled={busy}>
                Delete
            </AdminButton>
        </div>
    );
}

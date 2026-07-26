"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { updateReportStatus } from "../../../lib/api/report/report";
import AdminButton from "./AdminButton";

interface ReportActionsProps {
    reportId: string;
    status?: string;
}

export default function ReportActions({ reportId, status }: ReportActionsProps) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const apply = async (next: "reviewed" | "dismissed", label: string) => {
        setBusy(true);
        try {
            await updateReportStatus(reportId, next);
            toast.success(`Report ${label}`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update report");
        } finally {
            setBusy(false);
        }
    };

    // Once resolved there is nothing left to action, and the reporter has
    // already been notified of the outcome.
    if (status === "reviewed" || status === "dismissed") {
        return <span className="text-xs text-ink-400">Resolved</span>;
    }

    return (
        <div className="flex gap-2">
            <AdminButton tone="verify" onClick={() => apply("reviewed", "reviewed")} disabled={busy}>
                Review
            </AdminButton>
            <AdminButton tone="delete" onClick={() => apply("dismissed", "dismissed")} disabled={busy}>
                Dismiss
            </AdminButton>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { updateApplicationStatus } from "../../../lib/api/application/application";
import type { ApplicationStatus } from "../../../lib/api/endpoints";

const OPTIONS: Array<{ value: ApplicationStatus; label: string }> = [
    { value: "submitted", label: "Submitted" },
    { value: "viewed_by_employer", label: "Viewed by employer" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interview_scheduled", label: "Interview scheduled" },
    { value: "not_selected", label: "Not selected" },
];

interface ApplicationStatusSelectProps {
    applicationId: string;
    status: ApplicationStatus;
}

export default function ApplicationStatusSelect({ applicationId, status }: ApplicationStatusSelectProps) {
    const router = useRouter();
    const [value, setValue] = useState<ApplicationStatus>(status);
    const [busy, setBusy] = useState(false);

    const handleChange = async (next: ApplicationStatus) => {
        const previous = value;
        setValue(next);
        setBusy(true);
        try {
            await updateApplicationStatus(applicationId, { status: next });
            toast.success("Status updated");
            router.refresh();
        } catch (error) {
            setValue(previous);
            toast.error(error instanceof Error ? error.message : "Could not update status");
        } finally {
            setBusy(false);
        }
    };

    return (
        <select
            value={value}
            disabled={busy}
            onChange={(event) => handleChange(event.target.value as ApplicationStatus)}
            className="h-8 rounded-md border border-ink-200 bg-surface px-2 text-xs text-ink-800 outline-none transition-colors focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100 disabled:opacity-50"
        >
            {OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    );
}

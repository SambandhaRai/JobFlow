"use client";

import { useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { saveJob, unsaveJob } from "../../../lib/api/user/user";
import { navCountsStore } from "../../../lib/stores/navCounts";

interface SaveJobButtonProps {
    jobId: string;
    title: string;
    initialSaved?: boolean;
    className?: string;
    onToggleSaved?: (saved: boolean) => void;
}

export default function SaveJobButton({
    jobId,
    title,
    initialSaved = false,
    className = "",
    onToggleSaved,
}: SaveJobButtonProps) {
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [isSaving, setIsSaving] = useState(false);

    const handleClick = async () => {
        setIsSaving(true);
        try {
            if (isSaved) {
                await unsaveJob(jobId);
                setIsSaved(false);
                onToggleSaved?.(false);
                navCountsStore.adjustSaved(-1);
                toast.success("Removed from saved jobs");
            } else {
                await saveJob(jobId);
                setIsSaved(true);
                onToggleSaved?.(true);
                navCountsStore.adjustSaved(1);
                toast.success("Saved for later");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update saved jobs");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isSaving}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Remove ${title} from saved jobs` : `Save ${title}`}
            className={[
                "flex h-9 w-9 items-center justify-center rounded-md border transition-colors disabled:opacity-60",
                isSaved
                    ? "border-cobalt-100 bg-cobalt-50 text-cobalt-600"
                    : "border-ink-100 text-ink-400 hover:border-cobalt-100 hover:bg-cobalt-50 hover:text-cobalt-600",
                className,
            ].join(" ")}
        >
            {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
            )}
        </button>
    );
}

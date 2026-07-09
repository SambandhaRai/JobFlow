"use client";

import { useState } from "react";
import { Bookmark, Flag, Loader2, Send, Share2 } from "lucide-react";
import { toast } from "react-toastify";

import { saveJob, unsaveJob } from "../../../../lib/api/user/user";
import { navCountsStore } from "../../../../lib/stores/navCounts";
import { createReport } from "../../../../lib/api/report/report";
import AppliedButton from "./AppliedButton";
import ApplyButton from "./ApplyButton";
import type { ApplicantDefaults, ApplicantResume, ApplyJob } from "./jobDetailsData";

interface JobDetailActionsProps {
    title: string;
    company: string;
    isInitiallySaved: boolean;
    hasApplied: boolean;
    applyJob: ApplyJob;
    applicantDefaults: ApplicantDefaults;
    resumes: ApplicantResume[];
}

export default function JobDetailActions({
    title,
    company,
    isInitiallySaved,
    hasApplied,
    applyJob,
    applicantDefaults,
    resumes,
}: JobDetailActionsProps) {
    const [isSaved, setIsSaved] = useState(isInitiallySaved);
    const [isSaving, setIsSaving] = useState(false);
    const [isReporting, setIsReporting] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);

        try {
            if (isSaved) {
                await unsaveJob(applyJob.id);
                setIsSaved(false);
                navCountsStore.adjustSaved(-1);
                toast.success("Removed from saved jobs");
            } else {
                await saveJob(applyJob.id);
                setIsSaved(true);
                navCountsStore.adjustSaved(1);
                toast.success("Saved for later");
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Could not update saved jobs";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({ title, text: `${title} at ${company}`, url });
                return;
            }

            await navigator.clipboard.writeText(url);
            toast.success("Job link copied");
        } catch {
            toast.error("Could not share this job");
        }
    };

    const handleReport = async () => {
        const message = window.prompt("Why are you reporting this listing? (optional)");
        if (message === null) return;

        setIsReporting(true);
        try {
            await createReport({
                jobId: applyJob.id,
                reason: "other",
                message: message.trim() || undefined,
            });
            toast.success("Listing reported — our team will review it.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not submit report");
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
                {hasApplied ? (
                    <AppliedButton className="h-10 px-5" />
                ) : (
                    <ApplyButton
                        job={applyJob}
                        defaults={applicantDefaults}
                        resumes={resumes}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                    >
                        <Send size={15} />
                        Apply Now
                    </ApplyButton>
                )}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-ink-100 bg-surface px-4 text-sm font-medium text-ink-800 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />}
                    {isSaved ? "Saved" : "Save"}
                </button>
                <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-ink-100 bg-surface px-4 text-sm font-medium text-ink-800 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50"
                >
                    <Share2 size={15} />
                    Share
                </button>
            </div>

            <button
                type="button"
                onClick={handleReport}
                disabled={isReporting}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium text-danger-700 transition-colors hover:bg-danger-50 disabled:opacity-50 sm:self-center"
            >
                <Flag size={14} />
                {isReporting ? "Reporting…" : "Report listing"}
            </button>
        </div>
    );
}

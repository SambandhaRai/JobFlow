"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Info, Loader2, PencilLine, X } from "lucide-react";
import { toast } from "react-toastify";

import CompanyAvatar from "../../../_components/CompanyAvatar";
import VerifiedBadge from "../../../_components/VerifiedBadge";
import ApplyModal from "./ApplyModal";
import { applyToJob } from "../../../../lib/api/application/application";
import { navCountsStore } from "../../../../lib/stores/navCounts";
import { isValidPhone } from "../../../../lib/validation/phone";
import type { ApplicantDefaults, ApplicantResume, ApplyJob } from "./jobDetailsData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

interface QuickApplyButtonProps {
    job: ApplyJob;
    defaults: ApplicantDefaults;
    resumes: ApplicantResume[];
    className?: string;
    children: ReactNode;
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const resumePreviewUrl = (fileUrl: string) => (
    /^https?:\/\//i.test(fileUrl) ? fileUrl : `${API_BASE_URL}/uploads/${fileUrl}`
);

// "a resume" · "a resume and your phone" · "a resume, your name, and your phone"
const formatList = (items: string[]) => {
    if (items.length <= 1) return items[0] ?? "";
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

export default function QuickApplyButton({ job, defaults, resumes, className, children }: QuickApplyButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);            // confirm dialog
    const [showFullFlow, setShowFullFlow] = useState(false); // full 3-step fallback
    const [submitting, setSubmitting] = useState(false);

    const defaultResume = resumes.find((resume) => resume.isDefault) ?? resumes[0] ?? null;
    const fullName = defaults.fullName.trim();
    const email = defaults.email.trim();
    const phone = defaults.phone.trim();

    const nameOk = fullName.length >= 2;
    const emailOk = isValidEmail(email);
    const phoneOk = isValidPhone(phone);

    // What's missing for a one-click submit. If anything is, we send the user
    // into the full form instead of letting the backend reject the request.
    const missing: string[] = [];
    if (!defaultResume) missing.push("a resume");
    if (!nameOk) missing.push("your full name");
    if (!emailOk) missing.push("a valid email");
    if (!phoneOk) missing.push("a phone number");
    const canQuickApply = missing.length === 0;

    const closeConfirm = useCallback(() => {
        if (submitting) return;
        setOpen(false);
    }, [submitting]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeConfirm();
        };
        document.addEventListener("keydown", onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, closeConfirm]);

    const openFullFlow = () => {
        setOpen(false);
        setShowFullFlow(true);
    };

    const handleSubmit = async () => {
        if (!canQuickApply || !defaultResume) return;

        setSubmitting(true);
        try {
            await applyToJob({
                jobId: job.id,
                resumeUrl: defaultResume.fileUrl,
                fullName,
                email,
                phone,
            });
            navCountsStore.adjustApplications(1);
            toast.success("Application sent 🎉");
            setOpen(false);
            // Re-fetch so the page swaps Quick apply → "Already applied".
            router.refresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Could not submit your application";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const subtitle = [job.company, job.location, job.salary].filter(Boolean).join(" · ");

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className}>
                {children}
            </button>

            {open && typeof document !== "undefined" && createPortal(
                <div
                    className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-ink-900/45 p-4 sm:items-center sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Quick apply to ${job.title}`}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeConfirm();
                    }}
                >
                    <div className="my-auto flex w-full max-w-128 flex-col overflow-hidden rounded-xl bg-surface shadow-modal">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 px-6 pt-6">
                            <div className="flex min-w-0 items-center gap-3">
                                <CompanyAvatar name={job.company} size="lg" className="rounded-lg" />
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-lg font-semibold text-ink-900">{job.title}</h2>
                                        {job.isVerified && <VerifiedBadge label="Verified" />}
                                    </div>
                                    <p className="mt-0.5 truncate text-sm text-ink-500">{subtitle}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeConfirm}
                                disabled={submitting}
                                className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700 disabled:opacity-50"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            <h3 className="text-base font-semibold text-ink-900">
                                {canQuickApply ? "Review and send" : "Almost there"}
                            </h3>
                            <p className="mt-1 text-sm text-ink-500">
                                {canQuickApply
                                    ? "We'll submit your application with the details below."
                                    : `Add ${formatList(missing)} to apply — we'll take you to the full form.`}
                            </p>

                            <dl className="mt-4 divide-y divide-ink-100 rounded-lg border border-ink-100 bg-ink-50/50">
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                                        <FileText size={16} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Resume</dt>
                                        {defaultResume ? (
                                            <dd className="flex flex-wrap items-center gap-x-2 text-sm text-ink-900">
                                                <span className="truncate font-medium">{defaultResume.fileName}</span>
                                                {defaultResume.isDefault && (
                                                    <span className="rounded bg-cobalt-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cobalt-700">
                                                        Default
                                                    </span>
                                                )}
                                                <span className="text-xs text-ink-500">{formatFileSize(defaultResume.fileSize)}</span>
                                            </dd>
                                        ) : (
                                            <dd className="text-sm font-medium text-danger-700">No resume on file</dd>
                                        )}
                                    </div>
                                    {defaultResume && (
                                        <a
                                            href={resumePreviewUrl(defaultResume.fileUrl)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="shrink-0 text-sm font-medium text-ink-500 transition-colors hover:text-cobalt-600"
                                        >
                                            Preview
                                        </a>
                                    )}
                                </div>

                                <div className="px-4 py-3">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Sent as</dt>
                                    <dd className="mt-1 space-y-0.5 text-sm">
                                        <p className={nameOk ? "text-ink-900" : "text-danger-700"}>
                                            {fullName || "Add your name in your profile"}
                                        </p>
                                        <p className={emailOk ? "text-ink-600" : "text-danger-700"}>
                                            {email || "Add your email in your profile"}
                                        </p>
                                        <p className={phoneOk ? "text-ink-600" : "text-danger-700"}>
                                            {phone || "Add your phone in your profile"}
                                        </p>
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-4 flex items-start gap-2 rounded-lg border border-cobalt-100 bg-cobalt-50 px-4 py-3 text-sm text-cobalt-700">
                                <Info size={16} className="mt-0.5 shrink-0" />
                                <p>You&apos;ll get a notification for every status change — viewed, shortlisted, or not selected.</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={openFullFlow}
                                disabled={submitting}
                                className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-ink-600 transition-colors hover:text-cobalt-600 disabled:opacity-50"
                            >
                                <PencilLine size={15} />
                                {canQuickApply ? "Change resume or details" : "Review all details"}
                            </button>

                            {canQuickApply ? (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="inline-flex h-10 items-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600 disabled:cursor-not-allowed disabled:bg-cobalt-300"
                                >
                                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                    {submitting ? "Submitting…" : "Submit application"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={openFullFlow}
                                    className="inline-flex h-10 items-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                                >
                                    Review &amp; complete
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {showFullFlow && (
                <ApplyModal
                    job={job}
                    defaults={defaults}
                    resumes={resumes}
                    onClose={() => setShowFullFlow(false)}
                />
            )}
        </>
    );
}

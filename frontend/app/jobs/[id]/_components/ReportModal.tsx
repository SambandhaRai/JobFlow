"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    AlertTriangle,
    Ban,
    Clock,
    Copy,
    CreditCard,
    Loader2,
    MoreHorizontal,
    Shield,
    X,
} from "lucide-react";
import { toast } from "react-toastify";

import CompanyAvatar from "../../../_components/CompanyAvatar";
import VerifiedBadge from "../../../_components/VerifiedBadge";
import {
    AlreadyReportedError,
    createReport,
    type ReportReason,
} from "../../../../lib/api/report/report";

const MAX_DETAILS = 300;

type ReasonOption = {
    value: ReportReason;
    label: string;
    description: string;
    icon: typeof AlertTriangle;
    /** Tailwind classes for the icon chip, one tone per severity family. */
    tone: string;
};

const REASONS: ReasonOption[] = [
    {
        value: "scam",
        label: "Suspicious or fake listing",
        description: "Looks like a scam, the company doesn't exist, or the role isn't real.",
        icon: Ban,
        tone: "bg-danger-50 text-danger-700",
    },
    {
        value: "misleading",
        label: "Salary or job details are misleading",
        description: "Pay, hours, or responsibilities don't match what was posted.",
        icon: AlertTriangle,
        tone: "bg-warning-50 text-warning-700",
    },
    {
        value: "payment_request",
        label: "Employer asked for payment",
        description: "You were asked to pay a fee, deposit, or buy training to be hired.",
        icon: CreditCard,
        tone: "bg-warning-50 text-warning-700",
    },
    {
        value: "inappropriate",
        label: "Inappropriate or unsafe content",
        description: "Harassment, discrimination, or anything that feels unsafe.",
        icon: Shield,
        tone: "bg-danger-50 text-danger-700",
    },
    {
        value: "duplicate",
        label: "Duplicate listing",
        description: "This exact role is already posted elsewhere on JobFlow.",
        icon: Copy,
        tone: "bg-cobalt-50 text-cobalt-700",
    },
    {
        value: "other",
        label: "Something else",
        description: "Tell us what's off in the details box below.",
        icon: MoreHorizontal,
        tone: "bg-ink-50 text-ink-600",
    },
];

interface ReportModalProps {
    jobId: string;
    title: string;
    company: string;
    location?: string;
    logoUrl?: string;
    isVerifiedEmployer?: boolean;
    onClose: () => void;
    onReported: () => void;
}

export default function ReportModal({
    jobId,
    title,
    company,
    location,
    logoUrl,
    isVerifiedEmployer = false,
    onClose,
    onReported,
}: ReportModalProps) {
    const [reason, setReason] = useState<ReportReason | null>(null);
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const dialogRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    useEffect(() => setIsMounted(true), []);

    // "Something else" carries no information on its own, so it needs a note.
    const needsDetails = reason === "other";
    const trimmedDetails = details.trim();
    const canSubmit = reason !== null && (!needsDetails || trimmedDetails.length > 0) && !isSubmitting;

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        onClose();
    }, [isSubmitting, onClose]);

    // Lock background scroll and restore focus to the trigger on close.
    useEffect(() => {
        previouslyFocused.current = document.activeElement as HTMLElement;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = overflow;
            previouslyFocused.current?.focus?.();
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
                return;
            }

            if (event.key !== "Tab" || !dialogRef.current) return;

            // Keep focus inside the dialog while it is open.
            const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [handleClose]);

    const handleSubmit = async () => {
        if (!reason) {
            setError("Choose what's wrong with this listing.");
            return;
        }

        if (needsDetails && !trimmedDetails) {
            setError("Add a short note so we know what to look at.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createReport({
                jobId,
                reason,
                message: trimmedDetails || undefined,
            });
            toast.success("Report submitted — our team will review it.");
            onReported();
            onClose();
        } catch (err) {
            if (err instanceof AlreadyReportedError) {
                // Not a failure worth a red banner: the outcome they wanted holds.
                toast.info("You've already reported this listing.");
                onReported();
                onClose();
                return;
            }

            setError(err instanceof Error ? err.message : "Could not submit report");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/50 p-4 py-10 backdrop-blur-[2px]"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) handleClose();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-modal-title"
                className="w-full max-w-2xl overflow-hidden rounded-xl bg-surface shadow-modal"
            >
                <header className="flex items-start gap-3 border-b border-ink-100 px-5 py-4">
                    <CompanyAvatar name={company} imageUrl={logoUrl} size="md" />

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h2 className="truncate text-sm font-semibold text-ink-900">{title}</h2>
                            {isVerifiedEmployer && <VerifiedBadge label="Verified employer" />}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-ink-500">
                            {company}
                            {location ? ` · ${location}` : ""}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close report dialog"
                        className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="px-5 py-5">
                    <h3 id="report-modal-title" className="text-lg font-semibold tracking-tight text-ink-900">
                        Report this listing
                    </h3>
                    <p className="mt-1 text-sm text-ink-500">
                        Help us keep JobFlow safe for students. Reports are reviewed by our team within 24 hours.
                    </p>

                    <fieldset className="mt-5">
                        <legend className="text-xs font-medium uppercase tracking-wide text-ink-400">
                            What&apos;s wrong with this listing?
                        </legend>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {REASONS.map((option) => {
                                const Icon = option.icon;
                                const isSelected = reason === option.value;

                                return (
                                    <label
                                        key={option.value}
                                        className={[
                                            "flex cursor-pointer gap-3 rounded-lg border p-3.5 transition-colors",
                                            isSelected
                                                ? "border-cobalt-500 bg-cobalt-50/40"
                                                : "border-ink-100 bg-surface hover:border-ink-200 hover:bg-ink-50/50",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${option.tone}`}
                                            aria-hidden="true"
                                        >
                                            <Icon size={14} />
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-start justify-between gap-2">
                                                <span className="text-sm font-medium text-ink-900">
                                                    {option.label}
                                                </span>
                                                <input
                                                    type="radio"
                                                    name="report-reason"
                                                    value={option.value}
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setReason(option.value);
                                                        setError(null);
                                                    }}
                                                    className="mt-0.5 h-4 w-4 shrink-0 accent-cobalt-500"
                                                />
                                            </span>
                                            <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                                                {option.description}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    <div className="mt-5">
                        <div className="flex items-baseline justify-between gap-2">
                            <label htmlFor="report-details" className="text-sm font-medium text-ink-800">
                                Add more details{" "}
                                <span className="font-normal text-ink-400">
                                    {needsDetails ? "(required)" : "(optional)"}
                                </span>
                            </label>
                            <span
                                className={`text-xs tabular-nums ${
                                    details.length >= MAX_DETAILS ? "text-danger-700" : "text-ink-400"
                                }`}
                            >
                                {details.length} / {MAX_DETAILS}
                            </span>
                        </div>

                        <textarea
                            id="report-details"
                            rows={3}
                            value={details}
                            maxLength={MAX_DETAILS}
                            onChange={(event) => {
                                setDetails(event.target.value);
                                setError(null);
                            }}
                            placeholder="Tell us what looked suspicious or unclear..."
                            className="mt-1.5 w-full resize-none rounded-md border border-ink-200 bg-surface px-3 py-2.5 text-sm text-ink-800 transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-cobalt-500"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="mt-3 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
                            {error}
                        </p>
                    )}

                    <div className="mt-4 flex gap-2.5 rounded-lg bg-cobalt-50/60 px-4 py-3">
                        <Shield size={15} className="mt-0.5 shrink-0 text-cobalt-600" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-medium text-ink-900">Your report is private</p>
                            <p className="mt-0.5 text-sm text-ink-500">
                                The employer will not see your name or that you reported them.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="flex flex-col gap-3 border-t border-ink-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-1.5 text-sm text-ink-500">
                        <Clock size={14} aria-hidden="true" />
                        Reviewed within 24 hours
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-ink-200 px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cobalt-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cobalt-600 active:bg-cobalt-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Submitting…
                                </>
                            ) : (
                                "Submit report"
                            )}
                        </button>
                    </div>
                </footer>
            </div>
        </div>,
        document.body,
    );
}

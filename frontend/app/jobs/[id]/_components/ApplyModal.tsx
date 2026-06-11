"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    FileText,
    Info,
    Lightbulb,
    Loader2,
    Share2,
    UploadCloud,
    X,
} from "lucide-react";
import { toast } from "react-toastify";

import CompanyAvatar from "../../../_components/CompanyAvatar";
import StepIndicator from "../../../_components/StepIndicator";
import VerifiedBadge from "../../../_components/VerifiedBadge";
import { addResume } from "../../../../lib/api/user/user";
import { applyToJob } from "../../../../lib/api/application/application";
import {
    mapApplicantResume,
    type ApplicantDefaults,
    type ApplicantResume,
    type ApplyJob,
} from "./jobDetailsData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const STEPS = [
    { label: "Resume" },
    { label: "Review & confirm" },
    { label: "Submit" },
];

const MAX_APPLICATION_NOTE = 300;
const ACCEPTED_FILES = ".pdf,.doc,.docx";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

interface ApplyModalProps {
    job: ApplyJob;
    defaults: ApplicantDefaults;
    resumes: ApplicantResume[];
    onClose: () => void;
}

type FormErrors = Partial<Record<"fullName" | "email" | "phone" | "resume", string>>;

const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatUploadedDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const resumePreviewUrl = (fileUrl: string) => (
    /^https?:\/\//i.test(fileUrl) ? fileUrl : `${API_BASE_URL}/uploads/${fileUrl}`
);

function ScoreTag({ score }: { score: number }) {
    const tone = score >= 8 ? "text-success-700" : "text-warning-700";
    return (
        <span className={`inline-flex items-center gap-1 font-medium ${tone}`}>
            <CheckCircle2 size={13} />
            Score {score.toFixed(1)} / 10
        </span>
    );
}

export default function ApplyModal({ job, defaults, resumes: initialResumes, onClose }: ApplyModalProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const [resumes, setResumes] = useState<ApplicantResume[]>(initialResumes);
    const [selectedResumeId, setSelectedResumeId] = useState<string>(
        initialResumes.find((resume) => resume.isDefault)?.id ?? initialResumes[0]?.id ?? "",
    );

    const [fullName, setFullName] = useState(defaults.fullName);
    const [email, setEmail] = useState(defaults.email);
    const [phone, setPhone] = useState(defaults.phone);
    const [applicationNote, setApplicationNote] = useState("");

    const [errors, setErrors] = useState<FormErrors>({});
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [applicationId, setApplicationId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedResume = useMemo(
        () => resumes.find((resume) => resume.id === selectedResumeId) ?? null,
        [resumes, selectedResumeId],
    );

    // Close the modal, and only then refresh the page if an application was
    // submitted — so the page swapping Apply → "Already applied" doesn't unmount
    // the modal before the success step is shown.
    const closeModal = useCallback(() => {
        onClose();
        if (applicationId) router.refresh();
    }, [onClose, applicationId, router]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !submitting && !uploading) closeModal();
        };
        document.addEventListener("keydown", onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [closeModal, submitting, uploading]);

    const subtitle = [job.company, job.location, job.salary].filter(Boolean).join(" · ");

    const handleUpload = async (file: File) => {
        if (file.size > MAX_FILE_BYTES) {
            toast.error("Resume must be 5 MB or smaller");
            return;
        }

        const previousIds = new Set(resumes.map((resume) => resume.id));
        const form = new FormData();
        form.append("resume", file);

        setUploading(true);
        try {
            const response = await addResume(form);
            const updatedResumes = Array.isArray(response?.data?.resumes)
                ? (response.data.resumes as unknown[])
                    .map(mapApplicantResume)
                    .filter((resume): resume is ApplicantResume => resume !== null)
                    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
                : [];

            if (updatedResumes.length > 0) {
                setResumes(updatedResumes);
                const added = updatedResumes.find((resume) => !previousIds.has(resume.id));
                setSelectedResumeId((added ?? updatedResumes[0]).id);
            }

            setErrors((current) => ({ ...current, resume: undefined }));
            toast.success("Resume uploaded");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Could not upload resume";
            toast.error(message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) void handleUpload(file);
    };

    const goToReview = () => {
        if (!selectedResume) {
            setErrors((current) => ({ ...current, resume: "Pick or upload a resume to continue." }));
            return;
        }
        setStep(2);
    };

    const validateDetails = (): boolean => {
        const nextErrors: FormErrors = {};
        if (fullName.trim().length < 2) nextErrors.fullName = "Enter your full name.";
        if (!isValidEmail(email.trim())) nextErrors.email = "Enter a valid email.";

        const trimmedPhone = phone.trim();
        if (trimmedPhone.length < 10 || trimmedPhone.length > 15) {
            nextErrors.phone = "Phone must be 10–15 characters.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!selectedResume) {
            setStep(1);
            setErrors((current) => ({ ...current, resume: "Pick or upload a resume to continue." }));
            return;
        }
        if (!validateDetails()) return;

        setSubmitting(true);
        setSubmitError(null);
        try {
            const response = await applyToJob({
                jobId: job.id,
                resumeUrl: selectedResume.fileUrl,
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                applicationNote: applicationNote.trim() || undefined,
            });

            const created = response?.data as { _id?: string; id?: string } | undefined;
            setApplicationId(created?._id ?? created?.id ?? null);
            setStep(3);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Could not submit your application";
            setSubmitError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: job.title, text: `${job.title} at ${job.company}`, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            toast.success("Job link copied");
        } catch {
            // The user dismissed the share sheet — nothing to report.
        }
    };

    if (typeof document === "undefined") return null;

    const overlay = (
        <div
            className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-ink-900/45 p-4 sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`Apply to ${job.title}`}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting && !uploading) closeModal();
            }}
        >
            <div className="my-auto flex w-full max-w-180 flex-col overflow-hidden rounded-xl bg-surface shadow-modal">
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
                        onClick={closeModal}
                        disabled={submitting || uploading}
                        className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700 disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Steps */}
                <div className="border-b border-ink-100 px-6 py-5">
                    <StepIndicator steps={STEPS} currentStep={step} />
                </div>

                {/* Body */}
                <div className="max-h-[calc(100vh-15rem)] overflow-y-auto px-6 py-6">
                    {step === 1 && (
                        <StepResume
                            resumes={resumes}
                            selectedResumeId={selectedResumeId}
                            onSelect={(id) => {
                                setSelectedResumeId(id);
                                setErrors((current) => ({ ...current, resume: undefined }));
                            }}
                            error={errors.resume}
                            uploading={uploading}
                            fileInputRef={fileInputRef}
                            onFileInputChange={onFileInputChange}
                            onBrowse={() => fileInputRef.current?.click()}
                            selectedResume={selectedResume}
                            company={job.company}
                        />
                    )}

                    {step === 2 && (
                        <StepReview
                            selectedResume={selectedResume}
                            onChangeResume={() => setStep(1)}
                            company={job.company}
                            fullName={fullName}
                            email={email}
                            phone={phone}
                            applicationNote={applicationNote}
                            errors={errors}
                            submitError={submitError}
                            onFullNameChange={setFullName}
                            onEmailChange={setEmail}
                            onPhoneChange={setPhone}
                            onApplicationNoteChange={setApplicationNote}
                        />
                    )}

                    {step === 3 && (
                        <StepDone
                            job={job}
                            applicationId={applicationId}
                            email={email}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-6 py-4">
                    {step === 1 && (
                        <>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50"
                            >
                                <ArrowLeft size={15} />
                                Cancel
                            </button>
                            <div className="flex items-center gap-4">
                                <span className="hidden text-sm text-ink-400 sm:inline">Step 1 of 3</span>
                                <button
                                    type="button"
                                    onClick={goToReview}
                                    disabled={!selectedResume}
                                    className="inline-flex h-10 items-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600 disabled:cursor-not-allowed disabled:bg-cobalt-300"
                                >
                                    Continue
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                disabled={submitting}
                                className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-50"
                            >
                                <ArrowLeft size={15} />
                                Back to resume
                            </button>
                            <div className="flex items-center gap-4">
                                <span className="hidden text-sm text-ink-400 sm:inline">One click and you&apos;re done</span>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="inline-flex h-10 items-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600 disabled:cursor-not-allowed disabled:bg-cobalt-300"
                                >
                                    {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                                    {submitting ? "Submitting…" : "Submit application"}
                                    {!submitting && <ArrowRight size={15} />}
                                </button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <p className="truncate text-sm text-ink-400">
                                {email ? `A confirmation was sent to ${email}` : "Your application is on its way."}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="inline-flex h-10 items-center gap-2 rounded-md border border-ink-200 bg-surface px-4 text-sm font-medium text-ink-800 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50"
                                >
                                    <Share2 size={15} />
                                    Share
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="inline-flex h-10 items-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                                >
                                    Done
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(overlay, document.body);
}

/* ---------------- Step 1: Resume ---------------- */

function StepResume({
    resumes,
    selectedResumeId,
    onSelect,
    error,
    uploading,
    fileInputRef,
    onFileInputChange,
    onBrowse,
    selectedResume,
    company,
}: {
    resumes: ApplicantResume[];
    selectedResumeId: string;
    onSelect: (id: string) => void;
    error?: string;
    uploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBrowse: () => void;
    selectedResume: ApplicantResume | null;
    company: string;
}) {
    return (
        <div>
            <h3 className="text-xl font-semibold tracking-tight text-ink-900">Pick a resume to send</h3>
            <p className="mt-1 text-sm text-ink-500">We&apos;ll attach this file and use it to pre-fill the next step.</p>

            {resumes.length > 0 && (
                <>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-400">Your resumes</p>
                    <div className="mt-3 space-y-3">
                        {resumes.map((resume) => {
                            const isSelected = resume.id === selectedResumeId;
                            const uploadedDate = formatUploadedDate(resume.uploadedAt);

                            return (
                                <label
                                    key={resume.id}
                                    className={[
                                        "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                                        isSelected
                                            ? "border-cobalt-300 bg-cobalt-50 ring-1 ring-cobalt-200"
                                            : "border-ink-100 bg-surface hover:border-cobalt-100",
                                    ].join(" ")}
                                >
                                    <input
                                        type="radio"
                                        name="resume"
                                        value={resume.id}
                                        checked={isSelected}
                                        onChange={() => onSelect(resume.id)}
                                        className="h-4 w-4 shrink-0 accent-cobalt-500"
                                    />
                                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                                        <FileText size={16} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex flex-wrap items-center gap-2">
                                            <span className="truncate text-sm font-medium text-ink-900">{resume.fileName}</span>
                                            {resume.isDefault && (
                                                <span className="rounded bg-cobalt-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cobalt-700">
                                                    Default
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-500">
                                            <span>{formatFileSize(resume.fileSize)}</span>
                                            {uploadedDate && (
                                                <>
                                                    <span aria-hidden="true">·</span>
                                                    <span>uploaded {uploadedDate}</span>
                                                </>
                                            )}
                                            {typeof resume.score === "number" && (
                                                <>
                                                    <span aria-hidden="true">·</span>
                                                    <ScoreTag score={resume.score} />
                                                </>
                                            )}
                                        </span>
                                    </span>
                                    <a
                                        href={resumePreviewUrl(resume.fileUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(event) => event.stopPropagation()}
                                        className="shrink-0 text-sm font-medium text-ink-500 transition-colors hover:text-cobalt-600"
                                    >
                                        Preview
                                    </a>
                                </label>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Upload */}
            <div className="mt-4 rounded-lg border border-dashed border-ink-200 bg-ink-50/50 px-6 py-7 text-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILES}
                    onChange={onFileInputChange}
                    className="hidden"
                />
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-md bg-surface text-ink-500 shadow-card">
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                </span>
                <p className="mt-3 text-sm font-medium text-ink-900">Upload a new resume</p>
                <p className="mt-0.5 text-xs text-ink-500">Drag &amp; drop or browse your files</p>
                <button
                    type="button"
                    onClick={onBrowse}
                    disabled={uploading}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-ink-200 bg-surface px-4 text-sm font-medium text-ink-800 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50 disabled:opacity-50"
                >
                    <FileText size={14} />
                    {uploading ? "Uploading…" : "Choose file"}
                </button>
                <p className="mt-3 text-xs text-ink-400">PDF, DOC, DOCX up to 5 MB</p>
            </div>

            {error && <p className="mt-3 text-sm text-danger-700">{error}</p>}

            {selectedResume && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-success-500/20 bg-success-50 px-4 py-3 text-sm text-success-700">
                    <Lightbulb size={16} className="mt-0.5 shrink-0" />
                    <p>
                        {typeof selectedResume.score === "number" && selectedResume.score >= 8
                            ? `${selectedResume.fileName} scores well — a strong resume to send to ${company}.`
                            : `We'll attach ${selectedResume.fileName} and pre-fill your details on the next step.`}
                    </p>
                </div>
            )}
        </div>
    );
}

/* ---------------- Step 2: Review ---------------- */

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="text-sm font-medium text-ink-700">{children}</label>;
}

function StepReview({
    selectedResume,
    onChangeResume,
    company,
    fullName,
    email,
    phone,
    applicationNote,
    errors,
    submitError,
    onFullNameChange,
    onEmailChange,
    onPhoneChange,
    onApplicationNoteChange,
}: {
    selectedResume: ApplicantResume | null;
    onChangeResume: () => void;
    company: string;
    fullName: string;
    email: string;
    phone: string;
    applicationNote: string;
    errors: FormErrors;
    submitError: string | null;
    onFullNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onApplicationNoteChange: (value: string) => void;
}) {
    const fieldClass = (hasError?: string) => [
        "w-full h-10 px-3 text-sm text-ink-900 bg-surface border rounded-md outline-none transition-colors duration-150 placeholder:text-ink-400",
        "focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100",
        hasError ? "border-danger-500" : "border-ink-200",
    ].join(" ");

    return (
        <div>
            <h3 className="text-xl font-semibold tracking-tight text-ink-900">Review your application</h3>
            <p className="mt-1 text-sm text-ink-500">We pre-filled everything from your profile. Edit anything that looks off.</p>

            {/* Selected resume summary */}
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50/60 px-4 py-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                    <FileText size={16} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                        {selectedResume?.fileName ?? "No resume selected"}
                    </p>
                    {selectedResume && (
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-500">
                            <span>{formatFileSize(selectedResume.fileSize)}</span>
                            {typeof selectedResume.score === "number" && (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <ScoreTag score={selectedResume.score} />
                                </>
                            )}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onChangeResume}
                    className="shrink-0 rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50"
                >
                    Use a different resume
                </button>
            </div>

            {/* Fields */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <FieldLabel>Full name</FieldLabel>
                    <input
                        value={fullName}
                        onChange={(event) => onFullNameChange(event.target.value)}
                        className={fieldClass(errors.fullName)}
                        placeholder="Your full name"
                    />
                    {errors.fullName && <p className="text-xs text-danger-700">{errors.fullName}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <FieldLabel>Email</FieldLabel>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => onEmailChange(event.target.value)}
                        className={fieldClass(errors.email)}
                        placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-xs text-danger-700">{errors.email}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <FieldLabel>Phone</FieldLabel>
                    <input
                        value={phone}
                        onChange={(event) => onPhoneChange(event.target.value)}
                        className={fieldClass(errors.phone)}
                        placeholder="+977 98 XXXX XXXX"
                    />
                    {errors.phone && <p className="text-xs text-danger-700">{errors.phone}</p>}
                </div>
            </div>

            {/* Application note spans the full width on its own line */}
            <div className="mt-5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <FieldLabel>Why do you want to join {company}?</FieldLabel>
                    <span className="text-xs text-ink-400">{applicationNote.length} / {MAX_APPLICATION_NOTE} · optional</span>
                </div>
                <textarea
                    value={applicationNote}
                    maxLength={MAX_APPLICATION_NOTE}
                    onChange={(event) => onApplicationNoteChange(event.target.value)}
                    placeholder="A sentence or two on why this role is a fit (optional)."
                    className="min-h-19.5 w-full resize-none rounded-md border border-ink-200 bg-surface px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors duration-150 placeholder:text-ink-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100"
                />
            </div>

            {submitError && (
                <div className="mt-5 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {submitError}
                </div>
            )}

            <div className="mt-5 flex items-start gap-2 rounded-lg border border-cobalt-100 bg-cobalt-50 px-4 py-3 text-sm text-cobalt-700">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p>You&apos;ll get a notification for every status change — viewed, shortlisted, or not selected.</p>
            </div>
        </div>
    );
}

/* ---------------- Step 3: Done ---------------- */

function StepDone({
    job,
    applicationId,
    email,
}: {
    job: ApplyJob;
    applicationId: string | null;
    email: string;
}) {
    return (
        <div className="py-2 text-center">
            <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-700">
                <CheckCircle2 size={32} />
            </span>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-ink-900">Application sent 🎉</h3>
            <p className="mt-2 text-sm text-ink-500">
                Your application for <span className="font-medium text-ink-700">{job.title}</span> at{" "}
                <span className="font-medium text-ink-700">{job.company}</span> is on its way.
                {email ? " We've added it to your tracker." : ""}
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-lg border border-ink-100 bg-surface p-5 text-left shadow-card">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <CompanyAvatar name={job.company} size="md" className="rounded-md" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink-900">{job.title}</p>
                            <p className="truncate text-xs text-ink-500">{job.company} · {job.location}</p>
                        </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-cobalt-50 px-2.5 py-1 text-xs font-medium text-cobalt-700">
                        Just now
                    </span>
                </div>

                <div className="mt-4 space-y-2.5 border-t border-ink-100 pt-4 text-sm">
                    {applicationId && (
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-ink-500">Application ID</span>
                            <span className="truncate rounded-md bg-ink-50 px-2 py-0.5 font-mono text-xs text-ink-700">
                                {applicationId}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-ink-500">Status</span>
                        <span className="font-medium text-ink-900">Submitted</span>
                    </div>
                </div>
            </div>

            <Link
                href="/applications"
                className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cobalt-500 px-6 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
            >
                Track application
            </Link>
        </div>
    );
}

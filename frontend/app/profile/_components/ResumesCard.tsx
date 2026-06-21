"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";

import { addResume, removeResume, setDefaultResume } from "../../../lib/api/user/user";
import {
    mapApplicantResume,
    type ApplicantResume,
} from "../../jobs/[id]/_components/jobDetailsData";
import ProfileSection from "./ProfileSection";

interface ResumesCardProps {
    resumes: ApplicantResume[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
const ACCEPTED_FILES = ".pdf,.doc,.docx";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatUploadedDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const resumePreviewUrl = (fileUrl: string) => (
    /^https?:\/\//i.test(fileUrl) ? fileUrl : `${API_BASE_URL}/uploads/${fileUrl}`
);

// Resume mutations return the updated user; pull the fresh, default-first list.
const extractResumes = (response: unknown): ApplicantResume[] | null => {
    const data = (response as { data?: { resumes?: unknown[] } })?.data;
    if (!data || !Array.isArray(data.resumes)) return null;
    return data.resumes
        .map(mapApplicantResume)
        .filter((resume): resume is ApplicantResume => resume !== null)
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
};

export default function ResumesCard({ resumes: initialResumes }: ResumesCardProps) {
    const router = useRouter();
    const [resumes, setResumes] = useState<ApplicantResume[]>(initialResumes);
    const [uploading, setUploading] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (file.size > MAX_FILE_BYTES) {
            toast.error("Resume must be 5 MB or smaller");
            return;
        }

        const form = new FormData();
        form.append("resume", file);

        setUploading(true);
        try {
            const response = await addResume(form);
            const next = extractResumes(response);
            if (next) setResumes(next);
            toast.success("Resume uploaded");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not upload resume");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) void handleUpload(file);
    };

    const handleSetDefault = async (id: string) => {
        setBusyId(id);
        try {
            const response = await setDefaultResume(id);
            const next = extractResumes(response);
            setResumes(next ?? resumes.map((resume) => ({ ...resume, isDefault: resume.id === id })));
            toast.success("Default resume updated");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not set default resume");
        } finally {
            setBusyId(null);
        }
    };

    const handleRemove = async (id: string) => {
        setBusyId(id);
        try {
            const response = await removeResume(id);
            const next = extractResumes(response);
            setResumes(next ?? resumes.filter((resume) => resume.id !== id));
            toast.success("Resume removed");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not remove resume");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <ProfileSection
            title="Résumés"
            description="Upload, set a default, or remove. Your default is sent with quick applies."
            icon={<FileText size={16} />}
        >
            <div className="space-y-3">
                {resumes.length > 0 ? (
                    resumes.map((resume) => {
                        const uploadedDate = formatUploadedDate(resume.uploadedAt);
                        const busy = busyId === resume.id;

                        return (
                            <div
                                key={resume.id}
                                className={[
                                    "flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                                    resume.isDefault ? "border-cobalt-200 bg-cobalt-50/60" : "border-ink-100 bg-surface",
                                ].join(" ")}
                            >
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                                    <FileText size={16} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="truncate text-sm font-medium text-ink-900">{resume.fileName}</span>
                                        {resume.isDefault && (
                                            <span className="inline-flex items-center gap-1 rounded bg-cobalt-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cobalt-700">
                                                <Star size={10} fill="currentColor" />
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-500">
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
                                                <span className="inline-flex items-center gap-1 font-medium text-success-700">
                                                    <CheckCircle2 size={12} />
                                                    Score {resume.score.toFixed(1)} / 10
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <a
                                        href={resumePreviewUrl(resume.fileUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-cobalt-600"
                                    >
                                        Preview
                                    </a>
                                    {!resume.isDefault && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetDefault(resume.id)}
                                            disabled={busy}
                                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-cobalt-600 transition-colors hover:bg-cobalt-50 disabled:opacity-50"
                                        >
                                            {busy ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
                                            Set default
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(resume.id)}
                                        disabled={busy}
                                        aria-label={`Remove ${resume.fileName}`}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-danger-50 hover:text-danger-700 disabled:opacity-50"
                                    >
                                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-ink-400">No résumés yet. Upload one to apply faster.</p>
                )}

                {/* Upload */}
                <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/50 px-6 py-7 text-center">
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
                    <p className="mt-3 text-sm font-medium text-ink-900">Upload a new résumé</p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-ink-200 bg-surface px-4 text-sm font-medium text-ink-800 transition-colors hover:border-cobalt-100 hover:bg-cobalt-50 disabled:opacity-50"
                    >
                        <FileText size={14} />
                        {uploading ? "Uploading…" : "Choose file"}
                    </button>
                    <p className="mt-3 text-xs text-ink-400">PDF, DOC, DOCX up to 5 MB</p>
                </div>
            </div>
        </ProfileSection>
    );
}

"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AlertCircle, ShieldCheck } from "lucide-react";

import Button from "../../_components/Button";
import Input from "../../_components/Input";
import Select from "../../_components/Select";
import { createJob } from "../../../lib/api/job/job";
import type {
    CreateJobPayload,
    ExperienceLevel,
    JobCategory,
    JobType,
    WorkMode,
} from "../../../lib/api/endpoints";

const jobTypeOptions = [
    { value: "internship", label: "Internship" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
];

const workModeOptions = [
    { value: "on-site", label: "On-site" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
];

const experienceOptions = [
    { value: "no-experience", label: "No experience" },
    { value: "entry-level", label: "Entry-level" },
    { value: "junior", label: "Junior" },
    { value: "mid-level", label: "Mid-level" },
    { value: "senior-level", label: "Senior-level" },
];

const categoryOptions = [
    "IT & Software",
    "Design & Creative",
    "Marketing & Social Media",
    "Writing & Content",
    "Sales & Customer Service",
    "Business & Administration",
    "Finance & Accounting",
    "Education & Tutoring",
    "Hospitality & Tourism",
    "Retail & Store Jobs",
    "Data & Research",
    "Media & Communication",
    "Other",
].map((value) => ({ value, label: value }));

// Groups related fields into a scannable section with a clear heading, so the
// form reads as a few small chunks instead of one long list.
function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="py-5 first:pt-0 last:pb-0">
            <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
            <p className="mt-0.5 text-xs text-ink-500">{description}</p>
            <div className="mt-4 space-y-5">{children}</div>
        </section>
    );
}

export default function CreateJobForm() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        hiringName: "",
        hiringEmail: "",
        hiringPhone: "",
        location: "",
        jobType: "internship",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Other",
        description: "",
        salaryMin: "",
        salaryMax: "",
        skills: "",
        deadline: "",
    });

    const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (form.title.trim().length < 2) return setError("Enter a job title (at least 2 characters).");
        if (form.hiringName.trim().length < 2) return setError("Enter a hiring / company name.");
        if (!form.hiringEmail.trim() && !form.hiringPhone.trim()) {
            return setError("Add at least one contact — email or phone.");
        }
        if (form.location.trim().length < 2) return setError("Enter a location.");
        if (form.description.trim().length < 10) return setError("Description must be at least 10 characters.");

        const min = Number(form.salaryMin);
        const max = Number(form.salaryMax);
        const hasSalary = form.salaryMin.trim() !== "" && form.salaryMax.trim() !== "";
        if (hasSalary && (Number.isNaN(min) || Number.isNaN(max) || max < min)) {
            return setError("Enter a valid salary range (max must be ≥ min).");
        }

        const payload: CreateJobPayload = {
            title: form.title.trim(),
            hiringType: "small-business",
            hiringName: form.hiringName.trim(),
            ...(form.hiringEmail.trim() ? { hiringEmail: form.hiringEmail.trim() } : {}),
            ...(form.hiringPhone.trim() ? { hiringPhone: form.hiringPhone.trim() } : {}),
            location: form.location.trim(),
            jobType: form.jobType as JobType,
            workMode: form.workMode as WorkMode,
            experienceLevel: form.experienceLevel as ExperienceLevel,
            category: form.category as JobCategory,
            description: form.description.trim(),
            skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
            ...(hasSalary ? { salary: { min, max, currency: "Rs" } } : {}),
            ...(form.deadline ? { deadline: form.deadline } : {}),
        };

        setSaving(true);
        try {
            await createJob(payload);
            toast.success("Job posted — pending admin verification");
            router.push("/employer/jobs");
            router.refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Could not create job";
            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl rounded-lg border border-ink-200 bg-surface p-5 sm:p-6">
            {error && (
                <div className="mb-5 flex gap-2 rounded-md border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="divide-y divide-ink-100">
                <FormSection title="Role basics" description="What the role is and who it's for.">
                    <Input label="Job title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Frontend Developer Intern" />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Select label="Job type" options={jobTypeOptions} value={form.jobType} onChange={(e) => set("jobType", e.target.value)} />
                        <Select label="Work mode" options={workModeOptions} value={form.workMode} onChange={(e) => set("workMode", e.target.value)} />
                        <Select label="Experience level" options={experienceOptions} value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)} />
                        <Select label="Category" options={categoryOptions} value={form.category} onChange={(e) => set("category", e.target.value)} />
                    </div>
                </FormSection>

                <FormSection title="Hiring contact" description="How applicants and admins can reach you. Add at least one contact.">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input label="Hiring / company name" value={form.hiringName} onChange={(e) => set("hiringName", e.target.value)} placeholder="Your business name" />
                        <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Kathmandu" />
                        <Input label="Contact email" type="email" value={form.hiringEmail} onChange={(e) => set("hiringEmail", e.target.value)} placeholder="hiring@example.com" />
                        <Input label="Contact phone" value={form.hiringPhone} onChange={(e) => set("hiringPhone", e.target.value)} placeholder="98XXXXXXXX" />
                    </div>
                </FormSection>

                <FormSection title="Details & requirements" description="Pay, skills, deadline, and a clear description of the role.">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input label="Salary min (optional)" inputMode="numeric" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value.replace(/\D/g, ""))} placeholder="20000" />
                        <Input label="Salary max (optional)" inputMode="numeric" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value.replace(/\D/g, ""))} placeholder="35000" />
                    </div>
                    <Input label="Skills (comma separated)" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, TypeScript, CSS" />
                    <Input label="Application deadline (optional)" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-ink-700">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            rows={6}
                            placeholder="Describe the role, responsibilities, and what you're looking for…"
                            className="w-full resize-y rounded-md border border-ink-200 bg-surface px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100"
                        />
                    </div>
                </FormSection>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="inline-flex items-start gap-1.5 text-xs text-ink-500">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-ink-400" />
                    Listings are reviewed by an admin before going live — usually within a day.
                </p>
                <Button type="submit" loading={saving} fullWidth className="sm:w-auto">Post job</Button>
            </div>
        </form>
    );
}

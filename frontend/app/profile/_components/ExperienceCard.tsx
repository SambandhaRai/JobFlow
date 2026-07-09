"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import Button from "../../_components/Button";
import Input from "../../_components/Input";
import Select from "../../_components/Select";
import { updateUserProfile } from "../../../lib/api/user/user";
import { yearOptions } from "../setup/_components/profileSetupOptions";
import {
    createEmptyExperience,
    employmentTypes,
    getExperienceSummary,
    monthOptions,
    validateExperience,
    type EmploymentType,
    type ExperienceDraft,
    type ExperienceError,
} from "../setup/_components/experienceOptions";
import ProfileSection from "./ProfileSection";
import type { ProfileExperience } from "./profileData";

interface ExperienceCardProps {
    experiences: ProfileExperience[];
}

const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export default function ExperienceCard({ experiences }: ExperienceCardProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [committed, setCommitted] = useState<ProfileExperience[]>(experiences);
    const [draftList, setDraftList] = useState<ProfileExperience[]>(experiences);
    const [entry, setEntry] = useState<ExperienceDraft>(createEmptyExperience);
    const [entryError, setEntryError] = useState<ExperienceError>({});

    const startEditing = () => {
        setDraftList(committed);
        setEntry(createEmptyExperience());
        setEntryError({});
        setEditing(true);
    };

    const cancelEditing = () => {
        if (saving) return;
        setEditing(false);
    };

    const updateEntry = <TKey extends keyof ExperienceDraft>(key: TKey, value: ExperienceDraft[TKey]) => {
        setEntry((draft) => ({ ...draft, [key]: value }));
        setEntryError((errors) => ({ ...errors, [key]: undefined }));
    };

    const buildEntry = (draft: ExperienceDraft): ProfileExperience => ({
        id: createId(),
        title: draft.title.trim(),
        organization: draft.organization.trim(),
        employmentType: draft.employmentType,
        startMonth: draft.startMonth,
        startYear: draft.startYear.trim(),
        isCurrent: draft.isCurrent,
        endMonth: draft.endMonth,
        endYear: draft.endYear.trim(),
        description: draft.description.trim(),
    });

    const addEntry = (): boolean => {
        const errors = validateExperience(entry);
        if (Object.keys(errors).length > 0) {
            setEntryError(errors);
            return false;
        }

        setDraftList((list) => [...list, buildEntry(entry)]);
        setEntry(createEmptyExperience());
        setEntryError({});
        return true;
    };

    const removeEntry = (id: string) => setDraftList((list) => list.filter((item) => item.id !== id));

    const handleSave = async () => {
        let nextList = draftList;
        if (entry.title.trim() || entry.organization.trim()) {
            const errors = validateExperience(entry);
            if (Object.keys(errors).length > 0) {
                setEntryError(errors);
                return;
            }
            nextList = [...draftList, buildEntry(entry)];
        }

        setSaving(true);
        try {
            await updateUserProfile({
                experiences: nextList.map((item) => ({
                    title: item.title,
                    organization: item.organization,
                    employmentType: item.employmentType,
                    startMonth: item.startMonth,
                    startYear: item.startYear,
                    isCurrent: item.isCurrent,
                    ...(item.isCurrent ? {} : { endMonth: item.endMonth, endYear: item.endYear }),
                    ...(item.description ? { description: item.description } : {}),
                })),
            });
            setCommitted(nextList);
            setDraftList(nextList);
            setEntry(createEmptyExperience());
            setEditing(false);
            toast.success("Experience updated");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update your experience");
        } finally {
            setSaving(false);
        }
    };

    const editAction = !editing && (
        <Button type="button" variant="ghost" size="sm" iconLeft={<Pencil size={14} />} onClick={startEditing}>
            Edit
        </Button>
    );

    return (
        <ProfileSection
            title="Experience"
            description="Internships, part-time, freelance, or volunteer roles all count."
            icon={<Briefcase size={16} />}
            action={editAction}
        >
            {editing ? (
                <div className="space-y-5">
                    {draftList.length > 0 && (
                        <div className="space-y-2">
                            {draftList.map((experience) => (
                                <div
                                    key={experience.id}
                                    className="flex items-start justify-between gap-3 rounded-md border border-ink-200 bg-ink-50 px-3 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink-900">
                                            {experience.title} · {experience.organization}
                                        </p>
                                        <p className="text-xs text-ink-500">{getExperienceSummary(experience)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="shrink-0 rounded-md p-1.5 text-ink-400 transition-colors hover:bg-surface hover:text-danger-700"
                                        aria-label={`Remove ${experience.title}`}
                                        onClick={() => removeEntry(experience.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4 rounded-md border border-dashed border-ink-200 p-4">
                        <Input
                            label="Role / Job title"
                            placeholder="e.g. Frontend Developer Intern"
                            value={entry.title}
                            error={entryError.title}
                            onChange={(event) => updateEntry("title", event.target.value)}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Company / Organization"
                                placeholder="e.g. Leapfrog Technology"
                                value={entry.organization}
                                error={entryError.organization}
                                onChange={(event) => updateEntry("organization", event.target.value)}
                            />
                            <Select
                                label="Employment type"
                                options={employmentTypes}
                                value={entry.employmentType}
                                onChange={(event) => updateEntry("employmentType", event.target.value as EmploymentType)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Start month"
                                options={monthOptions}
                                value={entry.startMonth}
                                onChange={(event) => updateEntry("startMonth", event.target.value)}
                            />
                            <Input
                                label="Start year"
                                placeholder="Type or select a year"
                                inputMode="numeric"
                                list="profile-experience-year-options"
                                value={entry.startYear}
                                error={entryError.startYear}
                                onChange={(event) => updateEntry("startYear", event.target.value)}
                            />
                        </div>

                        <label className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
                            <input
                                type="checkbox"
                                checked={entry.isCurrent}
                                onChange={(event) => updateEntry("isCurrent", event.target.checked)}
                                className="h-4 w-4 rounded border-ink-300 text-cobalt-500 focus:ring-cobalt-100"
                            />
                            I currently work here
                        </label>

                        {!entry.isCurrent && (
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="End month"
                                    options={monthOptions}
                                    value={entry.endMonth}
                                    onChange={(event) => updateEntry("endMonth", event.target.value)}
                                />
                                <Input
                                    label="End year"
                                    placeholder="Type or select a year"
                                    inputMode="numeric"
                                    list="profile-experience-year-options"
                                    value={entry.endYear}
                                    error={entryError.endYear}
                                    onChange={(event) => updateEntry("endYear", event.target.value)}
                                />
                            </div>
                        )}

                        <datalist id="profile-experience-year-options">
                            {yearOptions.map((year) => (
                                <option key={year.value} value={year.value} />
                            ))}
                        </datalist>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="profile-experience-description" className="text-sm font-medium text-ink-700">
                                Description <span className="font-normal text-ink-400">(optional)</span>
                            </label>
                            <textarea
                                id="profile-experience-description"
                                rows={3}
                                value={entry.description}
                                onChange={(event) => updateEntry("description", event.target.value)}
                                placeholder="What did you work on? Key responsibilities, tools, or achievements."
                                className="w-full resize-y rounded-md border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100"
                            />
                        </div>

                        <Button type="button" variant="secondary" iconLeft={<Plus size={16} />} onClick={addEntry}>
                            Add experience
                        </Button>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={cancelEditing} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSave} loading={saving}>
                            Save changes
                        </Button>
                    </div>
                </div>
            ) : committed.length > 0 ? (
                <div className="space-y-2">
                    {committed.map((experience) => (
                        <div
                            key={experience.id}
                            className="flex items-start gap-3 rounded-md border border-ink-100 bg-ink-50/60 px-4 py-3"
                        >
                            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface text-cobalt-600 shadow-card">
                                <Briefcase size={15} />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-ink-900">
                                    {experience.title} · {experience.organization}
                                </p>
                                <p className="text-xs text-ink-500">{getExperienceSummary(experience)}</p>
                                {experience.description && (
                                    <p className="mt-1 whitespace-pre-line text-xs leading-5 text-ink-600">
                                        {experience.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-ink-400">No experience added yet. Add internships, part-time, or volunteer roles.</p>
            )}
        </ProfileSection>
    );
}

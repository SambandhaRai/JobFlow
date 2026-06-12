"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import Button from "../../_components/Button";
import Input from "../../_components/Input";
import Select from "../../_components/Select";
import { updateUserProfile } from "../../../lib/api/user/user";
import { getInstitutions, type Institution } from "../../../lib/api/institution/institution";
import {
    createEmptyEducation,
    currentYear,
    educationLevels,
    educationStatuses,
    fallbackInstitutionOptions,
    getEducationSummary,
    yearOptions,
    type EducationDraft,
    type EducationError,
    type EducationLevel,
    type EducationStatus,
} from "../setup/_components/profileSetupOptions";
import ProfileSection from "./ProfileSection";
import type { ProfileEducation } from "./profileData";

interface EducationCardProps {
    educations: ProfileEducation[];
}

const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const validateEducation = (draft: EducationDraft): EducationError => {
    const errors: EducationError = {};

    if (!draft.institutionName.trim()) {
        errors.institutionName = "Enter your school, college, or university";
    }

    if (!draft.completionYear.trim()) {
        errors.completionYear = draft.status === "currently-studying"
            ? "Enter your expected finish year"
            : "Enter the year you finished";
    } else if (!/^\d{4}$/.test(draft.completionYear.trim())) {
        errors.completionYear = "Enter a valid 4-digit year";
    } else if (draft.status === "currently-studying" && Number(draft.completionYear) < currentYear) {
        errors.completionYear = `Expected finish year cannot be before ${currentYear}`;
    }

    return errors;
};

export default function EducationCard({ educations }: EducationCardProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [committed, setCommitted] = useState<ProfileEducation[]>(educations);
    const [draftList, setDraftList] = useState<ProfileEducation[]>(educations);
    const [entry, setEntry] = useState<EducationDraft>(createEmptyEducation);
    const [entryError, setEntryError] = useState<EducationError>({});

    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [institutionError, setInstitutionError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            try {
                const result = await getInstitutions({ limit: 150 });
                if (!ignore) {
                    setInstitutions(result.data ?? []);
                    setInstitutionError(null);
                }
            } catch {
                if (!ignore) {
                    setInstitutions([]);
                    setInstitutionError("Could not load suggestions. You can still type your institution.");
                }
            }
        };

        void load();
        return () => {
            ignore = true;
        };
    }, []);

    const institutionOptions = useMemo(() => {
        const fromDatabase = institutions.map((institution) => institution.name);
        return Array.from(new Set([...fromDatabase, ...fallbackInstitutionOptions])).sort();
    }, [institutions]);

    const completionYearLabel = entry.status === "currently-studying" ? "Expected finish year" : "Finished year";
    const visibleYearOptions = entry.status === "currently-studying"
        ? yearOptions.filter((year) => Number(year.value) >= currentYear)
        : yearOptions;

    const startEditing = () => {
        setDraftList(committed);
        setEntry(createEmptyEducation());
        setEntryError({});
        setEditing(true);
    };

    const cancelEditing = () => {
        if (saving) return;
        setEditing(false);
    };

    const updateEntry = <TKey extends keyof EducationDraft>(key: TKey, value: EducationDraft[TKey]) => {
        setEntry((draft) => ({
            ...draft,
            [key]: value,
            // Clear the year when the status flips so a stale value can't sneak through.
            completionYear: key === "status" ? "" : key === "completionYear" ? (value as string) : draft.completionYear,
        }));
        setEntryError((errors) => ({ ...errors, [key]: undefined }));
    };

    const addEntry = (): boolean => {
        const errors = validateEducation(entry);
        if (Object.keys(errors).length > 0) {
            setEntryError(errors);
            return false;
        }

        setDraftList((list) => [
            ...list,
            {
                id: createId(),
                level: entry.level,
                institutionName: entry.institutionName.trim(),
                status: entry.status,
                completionYear: entry.completionYear.trim(),
            },
        ]);
        setEntry(createEmptyEducation());
        setEntryError({});
        return true;
    };

    const removeEntry = (id: string) => setDraftList((list) => list.filter((item) => item.id !== id));

    const handleSave = async () => {
        // If the add-entry form was started, fold it in (and block save if invalid).
        let nextList = draftList;
        if (entry.institutionName.trim() || entry.completionYear.trim()) {
            const errors = validateEducation(entry);
            if (Object.keys(errors).length > 0) {
                setEntryError(errors);
                return;
            }
            nextList = [
                ...draftList,
                {
                    id: createId(),
                    level: entry.level,
                    institutionName: entry.institutionName.trim(),
                    status: entry.status,
                    completionYear: entry.completionYear.trim(),
                },
            ];
        }

        setSaving(true);
        try {
            await updateUserProfile({
                educations: nextList.map((item) => ({
                    level: item.level,
                    institutionName: item.institutionName,
                    status: item.status,
                    completionYear: item.completionYear,
                })),
            });
            setCommitted(nextList);
            setDraftList(nextList);
            setEntry(createEmptyEducation());
            setEditing(false);
            toast.success("Education updated");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update your education");
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
            title="Education"
            description="SEE, +2, school, college, university, or any training that applies."
            icon={<GraduationCap size={16} />}
            action={editAction}
        >
            {editing ? (
                <div className="space-y-5">
                    {/* Existing entries (editable list) */}
                    {draftList.length > 0 && (
                        <div className="space-y-2">
                            {draftList.map((education) => (
                                <div
                                    key={education.id}
                                    className="flex items-center justify-between gap-3 rounded-md border border-ink-200 bg-ink-50 px-3 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink-900">{education.institutionName}</p>
                                        <p className="text-xs text-ink-500">{getEducationSummary(education)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="shrink-0 rounded-md p-1.5 text-ink-400 transition-colors hover:bg-surface hover:text-danger-700"
                                        aria-label={`Remove ${education.institutionName}`}
                                        onClick={() => removeEntry(education.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add a new entry */}
                    <div className="space-y-4 rounded-md border border-dashed border-ink-200 p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Select
                                label="Education level"
                                options={educationLevels}
                                value={entry.level}
                                onChange={(event) => updateEntry("level", event.target.value as EducationLevel)}
                            />
                            <Select
                                label="Status"
                                options={educationStatuses}
                                value={entry.status}
                                onChange={(event) => updateEntry("status", event.target.value as EducationStatus)}
                            />
                        </div>

                        <Input
                            label="School / College / University"
                            placeholder="Start typing your institution"
                            list="profile-institution-options"
                            value={entry.institutionName}
                            error={entryError.institutionName}
                            hint={institutionError ?? "Choose a suggestion or type your own."}
                            onChange={(event) => updateEntry("institutionName", event.target.value)}
                        />
                        <datalist id="profile-institution-options">
                            {institutionOptions.map((name) => (
                                <option key={name} value={name} />
                            ))}
                        </datalist>

                        <Input
                            label={completionYearLabel}
                            placeholder="Type or select a year"
                            inputMode="numeric"
                            list="profile-education-year-options"
                            value={entry.completionYear}
                            error={entryError.completionYear}
                            hint="Choose a suggestion or type any valid 4-digit year."
                            onChange={(event) => updateEntry("completionYear", event.target.value)}
                        />
                        <datalist id="profile-education-year-options">
                            {visibleYearOptions.map((year) => (
                                <option key={year.value} value={year.value} />
                            ))}
                        </datalist>

                        <Button type="button" variant="secondary" iconLeft={<Plus size={16} />} onClick={addEntry}>
                            Add education
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
                    {committed.map((education) => (
                        <div
                            key={education.id}
                            className="flex items-start gap-3 rounded-md border border-ink-100 bg-ink-50/60 px-4 py-3"
                        >
                            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface text-cobalt-600 shadow-card">
                                <GraduationCap size={15} />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-ink-900">{education.institutionName}</p>
                                <p className="text-xs text-ink-500">{getEducationSummary(education)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-ink-400">No education added yet. Add your most recent qualification.</p>
            )}
        </ProfileSection>
    );
}

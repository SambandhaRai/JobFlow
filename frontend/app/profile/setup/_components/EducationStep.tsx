import { ArrowRight, Plus, Trash2 } from "lucide-react";

import Button from "../../../_components/Button";
import Input from "../../../_components/Input";
import Select from "../../../_components/Select";
import {
    educationLevels,
    educationStatuses,
    getEducationSummary,
    type EducationDraft,
    type EducationEntry,
    type EducationError,
    type EducationLevel,
    type EducationStatus,
} from "./profileSetupOptions";

interface EducationStepProps {
    draft: EducationDraft;
    educations: EducationEntry[];
    error: EducationError;
    institutionError: string | null;
    institutionOptions: string[];
    completionYearLabel: string;
    yearOptions: Array<{ value: string; label: string }>;
    onDraftChange: <TKey extends keyof EducationDraft>(
        key: TKey,
        value: EducationDraft[TKey],
    ) => void;
    onAddEducation: () => void;
    onRemoveEducation: (id: string) => void;
    onContinue: () => void;
}

export default function EducationStep({
    draft,
    educations,
    error,
    institutionError,
    institutionOptions,
    completionYearLabel,
    yearOptions,
    onDraftChange,
    onAddEducation,
    onRemoveEducation,
    onContinue,
}: EducationStepProps) {
    return (
        <div className="space-y-5">
            {error.form && (
                <div className="rounded-md border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {error.form}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                    label="Education level"
                    options={educationLevels}
                    value={draft.level}
                    onChange={(event) => onDraftChange("level", event.target.value as EducationLevel)}
                />
                <Select
                    label="Status"
                    options={educationStatuses}
                    value={draft.status}
                    onChange={(event) => onDraftChange("status", event.target.value as EducationStatus)}
                />
            </div>

            <Input
                label="School / College / University"
                placeholder="Start typing your institution"
                list="institution-options"
                value={draft.institutionName}
                error={error.institutionName}
                hint={institutionError ?? "Choose a suggestion or type your own."}
                onChange={(event) => onDraftChange("institutionName", event.target.value)}
            />
            <datalist id="institution-options">
                {institutionOptions.map((name) => (
                    <option key={name} value={name} />
                ))}
            </datalist>

            <Input
                label={completionYearLabel}
                placeholder="Type or select a year"
                inputMode="numeric"
                list="education-year-options"
                value={draft.completionYear}
                error={error.completionYear}
                hint="Choose a suggestion or type any valid 4-digit year."
                onChange={(event) => onDraftChange("completionYear", event.target.value)}
            />
            <datalist id="education-year-options">
                {yearOptions.map((year) => (
                    <option key={year.value} value={year.value} />
                ))}
            </datalist>

            <Button
                type="button"
                variant="secondary"
                iconLeft={<Plus size={17} />}
                onClick={onAddEducation}
            >
                Add education
            </Button>

            {educations.length > 0 && (
                <div className="space-y-2">
                    {educations.map((education) => (
                        <div
                            key={education.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-ink-200 bg-ink-50 px-3 py-2.5"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-ink-900">
                                    {education.institutionName}
                                </p>
                                <p className="text-xs text-ink-500">
                                    {getEducationSummary(education)}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-md p-1.5 text-ink-400 transition-colors hover:bg-surface hover:text-danger-700"
                                aria-label={`Remove ${education.institutionName}`}
                                onClick={() => onRemoveEducation(education.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-ink-500">
                    Add SEE, +2, school, college, university, or any training level that applies.
                </p>
                <Button
                    type="button"
                    size="lg"
                    iconRight={<ArrowRight size={18} />}
                    onClick={onContinue}
                    className="sm:w-auto"
                >
                    Continue to skills
                </Button>
            </div>
        </div>
    );
}

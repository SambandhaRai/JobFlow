import { ArrowLeft, ArrowRight, Briefcase, Plus, Trash2 } from "lucide-react";

import Button from "../../../_components/Button";
import Input from "../../../_components/Input";
import Select from "../../../_components/Select";
import { yearOptions } from "./profileSetupOptions";
import {
    employmentTypes,
    getExperienceSummary,
    monthOptions,
    type EmploymentType,
    type ExperienceDraft,
    type ExperienceEntry,
    type ExperienceError,
} from "./experienceOptions";

interface ExperienceStepProps {
    draft: ExperienceDraft;
    experiences: ExperienceEntry[];
    error: ExperienceError;
    onDraftChange: <TKey extends keyof ExperienceDraft>(
        key: TKey,
        value: ExperienceDraft[TKey],
    ) => void;
    onAddExperience: () => void;
    onRemoveExperience: (id: string) => void;
    onBack: () => void;
    onContinue: () => void;
}

export default function ExperienceStep({
    draft,
    experiences,
    error,
    onDraftChange,
    onAddExperience,
    onRemoveExperience,
    onBack,
    onContinue,
}: ExperienceStepProps) {
    return (
        <div className="space-y-5">
            {error.form && (
                <div className="rounded-md border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {error.form}
                </div>
            )}

            <div className="space-y-4 rounded-md border border-dashed border-ink-200 p-4">
                <Input
                    label="Role / Job title"
                    placeholder="e.g. Frontend Developer Intern"
                    value={draft.title}
                    error={error.title}
                    onChange={(event) => onDraftChange("title", event.target.value)}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Company / Organization"
                        placeholder="e.g. Leapfrog Technology"
                        value={draft.organization}
                        error={error.organization}
                        onChange={(event) => onDraftChange("organization", event.target.value)}
                    />
                    <Select
                        label="Employment type"
                        options={employmentTypes}
                        value={draft.employmentType}
                        onChange={(event) => onDraftChange("employmentType", event.target.value as EmploymentType)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Start month"
                        options={monthOptions}
                        value={draft.startMonth}
                        onChange={(event) => onDraftChange("startMonth", event.target.value)}
                    />
                    <Input
                        label="Start year"
                        placeholder="Type or select a year"
                        inputMode="numeric"
                        list="experience-year-options"
                        value={draft.startYear}
                        error={error.startYear}
                        onChange={(event) => onDraftChange("startYear", event.target.value)}
                    />
                </div>

                <label className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
                    <input
                        type="checkbox"
                        checked={draft.isCurrent}
                        onChange={(event) => onDraftChange("isCurrent", event.target.checked)}
                        className="h-4 w-4 rounded border-ink-300 text-cobalt-500 focus:ring-cobalt-100"
                    />
                    I currently work here
                </label>

                {!draft.isCurrent && (
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="End month"
                            options={monthOptions}
                            value={draft.endMonth}
                            onChange={(event) => onDraftChange("endMonth", event.target.value)}
                        />
                        <Input
                            label="End year"
                            placeholder="Type or select a year"
                            inputMode="numeric"
                            list="experience-year-options"
                            value={draft.endYear}
                            error={error.endYear}
                            onChange={(event) => onDraftChange("endYear", event.target.value)}
                        />
                    </div>
                )}

                <datalist id="experience-year-options">
                    {yearOptions.map((year) => (
                        <option key={year.value} value={year.value} />
                    ))}
                </datalist>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="experience-description" className="text-sm font-medium text-ink-700">
                        Description <span className="font-normal text-ink-400">(optional)</span>
                    </label>
                    <textarea
                        id="experience-description"
                        rows={3}
                        value={draft.description}
                        onChange={(event) => onDraftChange("description", event.target.value)}
                        placeholder="What did you work on? Key responsibilities, tools, or achievements."
                        className="w-full resize-y rounded-md border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100"
                    />
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    iconLeft={<Plus size={17} />}
                    onClick={onAddExperience}
                >
                    Add experience
                </Button>
            </div>

            {experiences.length > 0 && (
                <div className="space-y-2">
                    {experiences.map((experience) => (
                        <div
                            key={experience.id}
                            className="flex items-start justify-between gap-3 rounded-md border border-ink-200 bg-ink-50 px-3 py-2.5"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-ink-900">
                                    {experience.title} · {experience.organization}
                                </p>
                                <p className="text-xs text-ink-500">
                                    {getExperienceSummary(experience)}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-md p-1.5 text-ink-400 transition-colors hover:bg-surface hover:text-danger-700"
                                aria-label={`Remove ${experience.title}`}
                                onClick={() => onRemoveExperience(experience.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    variant="ghost"
                    iconLeft={<ArrowLeft size={18} />}
                    onClick={onBack}
                >
                    Back
                </Button>
                <div className="flex items-center gap-3 text-xs text-ink-500 sm:gap-4">
                    <span className="hidden sm:inline">
                        <Briefcase size={14} className="mr-1 inline" />
                        Internships and part-time roles count too. You can skip this.
                    </span>
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
        </div>
    );
}

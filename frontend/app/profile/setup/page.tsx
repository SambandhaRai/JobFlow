"use client";

import { useEffect, useMemo, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, GraduationCap, Plus, Trash2 } from "lucide-react";

import Button from "../../_components/Button";
import Input from "../../_components/Input";
import Select from "../../_components/Select";
import SkillTag from "../../_components/SkillTag";
import StepIndicator from "../../_components/StepIndicator";
import { getInstitutions, type Institution } from "../../../lib/api/institution/institution";
import { updateUserProfile } from "../../../lib/api/user/user";

type EducationLevel = "see" | "+2" | "diploma" | "bachelor" | "master" | "phd" | "other";
type EducationStatus = "currently-studying" | "completed";

type EducationDraft = {
    level: EducationLevel;
    institutionName: string;
    status: EducationStatus;
    completionYear: string;
};

type EducationEntry = EducationDraft & {
    id: string;
};

type EducationError = Partial<Record<keyof EducationDraft | "form", string>>;

const educationLevels: Array<{ value: EducationLevel; label: string }> = [
    { value: "see", label: "SEE" },
    { value: "+2", label: "+2 / Higher secondary" },
    { value: "diploma", label: "Diploma" },
    { value: "bachelor", label: "Bachelor" },
    { value: "master", label: "Master" },
    { value: "phd", label: "PhD" },
    { value: "other", label: "Other" },
];

const educationStatuses: Array<{ value: EducationStatus; label: string }> = [
    { value: "currently-studying", label: "Currently studying" },
    { value: "completed", label: "Completed" },
];

const fallbackInstitutionOptions = [
    "Budhanilkantha School",
    "GEMS School",
    "Galaxy Public School",
    "Little Angels' School",
    "Rato Bangala School",
    "St. Xavier's School Jawalakhel",
    "Tribhuvan University",
    "Kathmandu University",
    "Pokhara University",
    "Purbanchal University",
    "Nepal Engineering College",
    "Kathmandu Engineering College",
    "Kantipur Engineering College",
    "Islington College",
    "Herald College Kathmandu",
    "The British College",
    "Prime College",
    "St. Xavier's College Maitighar",
];

const MAX_SKILLS = 20;
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 51 }, (_, index) => {
    const year = String(currentYear - 30 + index);
    return { value: year, label: year };
});

const createEmptyEducation = (): EducationDraft => ({
    level: "see",
    institutionName: "",
    status: "currently-studying",
    completionYear: "",
});

const normalizeSkill = (skill: string) => skill.trim().replace(/\s+/g, " ");

const createClientId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const mergeSkills = (currentSkills: string[], newSkills: string[]) => {
    const nextSkills = [...currentSkills];
    const existingSkills = new Set(currentSkills.map((skill) => skill.toLowerCase()));

    newSkills.forEach((value) => {
        const skill = normalizeSkill(value);
        const key = skill.toLowerCase();

        if (!skill || existingSkills.has(key) || nextSkills.length >= MAX_SKILLS) return;

        nextSkills.push(skill);
        existingSkills.add(key);
    });

    return nextSkills;
};

const getEducationSummary = (education: EducationEntry) => {
    const level = educationLevels.find((item) => item.value === education.level)?.label ?? education.level;
    const status = education.status === "currently-studying" ? "Expected" : "Completed";

    return `${level} • ${status} ${education.completionYear}`;
};

export default function ProfileSetupPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [serverError, setServerError] = useState<string | null>(null);
    const [institutionError, setInstitutionError] = useState<string | null>(null);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [educations, setEducations] = useState<EducationEntry[]>([]);
    const [educationDraft, setEducationDraft] = useState<EducationDraft>(createEmptyEducation);
    const [educationError, setEducationError] = useState<EducationError>({});
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const completionYearLabel = educationDraft.status === "currently-studying"
        ? "Expected finish year"
        : "Finished year";
    const visibleYearOptions = educationDraft.status === "currently-studying"
        ? yearOptions.filter((year) => Number(year.value) >= currentYear)
        : yearOptions;
    const institutionOptions = useMemo(
        () => {
            const databaseOptions = institutions.map((institution) => institution.name);
            return Array.from(new Set([...databaseOptions, ...fallbackInstitutionOptions])).sort();
        },
        [institutions],
    );

    useEffect(() => {
        let ignore = false;

        async function loadInstitutions() {
            try {
                const result = await getInstitutions({ limit: 150 });
                if (!ignore) {
                    setInstitutions(result.data ?? []);
                    setInstitutionError(null);
                }
            } catch {
                if (!ignore) {
                    setInstitutions([]);
                    setInstitutionError("Could not load database suggestions. You can still type your school or institution.");
                }
            }
        }

        void loadInstitutions();

        return () => {
            ignore = true;
        };
    }, []);

    const validateEducation = (draft: EducationDraft) => {
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
        } else if (
            draft.status === "currently-studying" &&
            Number(draft.completionYear) < currentYear
        ) {
            errors.completionYear = `Expected finish year cannot be before ${currentYear}`;
        }

        return errors;
    };

    const updateEducationDraft = <TKey extends keyof EducationDraft>(
        key: TKey,
        value: EducationDraft[TKey],
    ) => {
        setEducationDraft((draft) => ({
            ...draft,
            [key]: value,
            completionYear: key === "status"
                ? ""
                : key === "completionYear"
                    ? value as string
                    : draft.completionYear,
        }));
        setEducationError((errors) => ({ ...errors, [key]: undefined, form: undefined }));
    };

    const addEducation = () => {
        const errors = validateEducation(educationDraft);
        if (Object.keys(errors).length > 0) {
            setEducationError(errors);
            return;
        }

        setEducations((items) => [
            ...items,
            {
                ...educationDraft,
                institutionName: educationDraft.institutionName.trim(),
                completionYear: educationDraft.completionYear.trim(),
                id: createClientId(),
            },
        ]);
        setEducationDraft(createEmptyEducation());
        setEducationError({});
    };

    const removeEducation = (id: string) => {
        setEducations((items) => items.filter((item) => item.id !== id));
    };

    const continueToSkills = () => {
        if (educations.length === 0) {
            const draftHasData = Boolean(
                educationDraft.institutionName.trim() ||
                educationDraft.completionYear.trim(),
            );
            if (draftHasData) {
                const errors = validateEducation(educationDraft);
                if (Object.keys(errors).length > 0) {
                    setEducationError(errors);
                    return;
                }

                setEducations([{
                    ...educationDraft,
                    institutionName: educationDraft.institutionName.trim(),
                    completionYear: educationDraft.completionYear.trim(),
                    id: createClientId(),
                }]);
                setEducationDraft(createEmptyEducation());
                setEducationError({});
            } else {
                setEducationError({ form: "Add at least one education entry, or skip setup for now." });
                return;
            }
        }

        setCurrentStep(2);
    };

    const addSkills = (values: string[]) => {
        setSkills((currentSkills) => mergeSkills(currentSkills, values));
    };

    const commitSkillInput = () => {
        const parts = skillInput.split(",").map(normalizeSkill);
        addSkills(parts);
        setSkillInput("");
    };

    const removeSkill = (targetSkill: string) => {
        setSkills((currentSkills) => currentSkills.filter((skill) => skill !== targetSkill));
    };

    const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commitSkillInput();
            return;
        }

        if (event.key === "Backspace" && !skillInput && skills.length > 0) {
            setSkills((currentSkills) => currentSkills.slice(0, -1));
        }
    };

    const handleSkillPaste = (event: ClipboardEvent<HTMLInputElement>) => {
        const pastedText = event.clipboardData.getData("text");

        if (!/[\n,]/.test(pastedText)) return;

        event.preventDefault();
        addSkills(pastedText.split(/[\n,]/));
        setSkillInput("");
    };

    async function finishSetup() {
        setServerError(null);
        setIsSaving(true);
        commitSkillInput();

        const submittedSkills = mergeSkills(skills, skillInput.split(","));

        try {
            await updateUserProfile({
                educations: educations.map((education) => ({
                    level: education.level,
                    institutionName: education.institutionName,
                    status: education.status,
                    completionYear: education.completionYear,
                })),
                skills: submittedSkills,
            });
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "Profile setup failed");
            setIsSaving(false);
            return;
        }

        router.push("/discover");
    }

    return (
        <main className="min-h-screen bg-background px-5 py-8 sm:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
                <header className="flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt-500 text-sm font-bold text-white font-display">
                            JF
                        </div>
                        <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
                            JobFlow
                        </span>
                    </Link>
                    <Link
                        href="/discover"
                        className="text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
                    >
                        Skip for now
                    </Link>
                </header>

                <section className="rounded-lg border border-ink-200 bg-surface p-6 shadow-card sm:p-8">
                    <div className="mb-8 flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                            <GraduationCap size={22} />
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cobalt-600">
                                Profile setup
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                                Build your student profile
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500">
                                Add your education history and skills so JobFlow can tune internships and entry-level roles to you.
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <StepIndicator
                            currentStep={currentStep}
                            steps={[{ label: "Education" }, { label: "Skills" }]}
                        />
                    </div>

                    {serverError && (
                        <div className="mb-5 rounded-md border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                            {serverError}
                        </div>
                    )}

                    {currentStep === 1 ? (
                        <div className="space-y-5">
                            {educationError.form && (
                                <div className="rounded-md border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                                    {educationError.form}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Select
                                    label="Education level"
                                    options={educationLevels}
                                    value={educationDraft.level}
                                    onChange={(event) => updateEducationDraft("level", event.target.value as EducationLevel)}
                                />
                                <Select
                                    label="Status"
                                    options={educationStatuses}
                                    value={educationDraft.status}
                                    onChange={(event) => updateEducationDraft("status", event.target.value as EducationStatus)}
                                />
                            </div>

                            <Input
                                label="School / College / University"
                                placeholder="Start typing your institution"
                                list="institution-options"
                                value={educationDraft.institutionName}
                                error={educationError.institutionName}
                                hint={institutionError ?? "Choose a suggestion or type your own."}
                                onChange={(event) => updateEducationDraft("institutionName", event.target.value)}
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
                                value={educationDraft.completionYear}
                                error={educationError.completionYear}
                                hint="Choose a suggestion or type any valid 4-digit year."
                                onChange={(event) => updateEducationDraft("completionYear", event.target.value)}
                            />
                            <datalist id="education-year-options">
                                {visibleYearOptions.map((year) => (
                                    <option key={year.value} value={year.value} />
                                ))}
                            </datalist>

                            <Button
                                type="button"
                                variant="secondary"
                                iconLeft={<Plus size={17} />}
                                onClick={addEducation}
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
                                                onClick={() => removeEducation(education.id)}
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
                                    onClick={continueToSkills}
                                    className="sm:w-auto"
                                >
                                    Continue to skills
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="skills" className="text-sm font-medium text-ink-700">
                                    Skills
                                </label>
                                <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-ink-200 bg-surface px-2.5 py-2 transition-colors focus-within:border-cobalt-500 focus-within:ring-2 focus-within:ring-cobalt-100">
                                    {skills.map((skill) => (
                                        <SkillTag
                                            key={skill}
                                            label={skill}
                                            onRemove={() => removeSkill(skill)}
                                        />
                                    ))}
                                    <input
                                        id="skills"
                                        type="text"
                                        value={skillInput}
                                        onChange={(event) => setSkillInput(event.target.value)}
                                        onKeyDown={handleSkillKeyDown}
                                        onPaste={handleSkillPaste}
                                        onBlur={commitSkillInput}
                                        disabled={skills.length >= MAX_SKILLS}
                                        placeholder={skills.length > 0 ? "Add another skill" : "Type a skill and press Enter"}
                                        className="h-7 min-w-40 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-ink-500">
                                    Press Enter or comma to add a skill. {skills.length} / {MAX_SKILLS} added.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    iconLeft={<ArrowLeft size={18} />}
                                    onClick={() => setCurrentStep(1)}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    loading={isSaving}
                                    iconRight={<ArrowRight size={18} />}
                                    onClick={finishSetup}
                                    className="sm:w-auto"
                                >
                                    Save and continue
                                </Button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

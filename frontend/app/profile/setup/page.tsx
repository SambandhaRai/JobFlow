"use client";

import { useEffect, useMemo, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

import { getInstitutions, type Institution } from "../../../lib/api/institution/institution";
import { updateUserProfile } from "../../../lib/api/user/user";
import EducationStep from "./_components/EducationStep";
import ProfileSetupShell from "./_components/ProfileSetupShell";
import SkillsStep from "./_components/SkillsStep";
import {
    createEmptyEducation,
    currentYear,
    fallbackInstitutionOptions,
    MAX_SKILLS,
    yearOptions,
    type EducationDraft,
    type EducationEntry,
    type EducationError,
} from "./_components/profileSetupOptions";

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
        <ProfileSetupShell currentStep={currentStep} serverError={serverError}>
            {currentStep === 1 ? (
                <EducationStep
                    draft={educationDraft}
                    educations={educations}
                    error={educationError}
                    institutionError={institutionError}
                    institutionOptions={institutionOptions}
                    completionYearLabel={completionYearLabel}
                    yearOptions={visibleYearOptions}
                    onDraftChange={updateEducationDraft}
                    onAddEducation={addEducation}
                    onRemoveEducation={removeEducation}
                    onContinue={continueToSkills}
                />
            ) : (
                <SkillsStep
                    skills={skills}
                    skillInput={skillInput}
                    isSaving={isSaving}
                    onSkillInputChange={setSkillInput}
                    onSkillKeyDown={handleSkillKeyDown}
                    onSkillPaste={handleSkillPaste}
                    onSkillInputBlur={commitSkillInput}
                    onRemoveSkill={removeSkill}
                    onBack={() => setCurrentStep(1)}
                    onFinish={finishSetup}
                />
            )}
        </ProfileSetupShell>
    );
}

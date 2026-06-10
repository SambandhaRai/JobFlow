import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ClipboardEvent, KeyboardEvent } from "react";

import Button from "../../../_components/Button";
import SkillTag from "../../../_components/SkillTag";
import { MAX_SKILLS } from "./profileSetupOptions";

interface SkillsStepProps {
    skills: string[];
    skillInput: string;
    isSaving: boolean;
    onSkillInputChange: (value: string) => void;
    onSkillKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onSkillPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
    onSkillInputBlur: () => void;
    onRemoveSkill: (skill: string) => void;
    onBack: () => void;
    onFinish: () => void;
}

export default function SkillsStep({
    skills,
    skillInput,
    isSaving,
    onSkillInputChange,
    onSkillKeyDown,
    onSkillPaste,
    onSkillInputBlur,
    onRemoveSkill,
    onBack,
    onFinish,
}: SkillsStepProps) {
    return (
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
                            onRemove={() => onRemoveSkill(skill)}
                        />
                    ))}
                    <input
                        id="skills"
                        type="text"
                        value={skillInput}
                        onChange={(event) => onSkillInputChange(event.target.value)}
                        onKeyDown={onSkillKeyDown}
                        onPaste={onSkillPaste}
                        onBlur={onSkillInputBlur}
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
                    onClick={onBack}
                >
                    Back
                </Button>
                <Button
                    type="button"
                    size="lg"
                    loading={isSaving}
                    iconRight={<ArrowRight size={18} />}
                    onClick={onFinish}
                    className="sm:w-auto"
                >
                    Save and continue
                </Button>
            </div>
        </div>
    );
}

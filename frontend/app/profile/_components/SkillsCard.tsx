"use client";

import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

import Button from "../../_components/Button";
import SkillTag from "../../_components/SkillTag";
import { updateUserProfile } from "../../../lib/api/user/user";
import { MAX_SKILLS } from "../setup/_components/profileSetupOptions";
import ProfileSection from "./ProfileSection";

interface SkillsCardProps {
    skills: string[];
}

const normalizeSkill = (skill: string) => skill.trim().replace(/\s+/g, " ");

const mergeSkills = (current: string[], incoming: string[]) => {
    const next = [...current];
    const seen = new Set(current.map((skill) => skill.toLowerCase()));

    incoming.forEach((value) => {
        const skill = normalizeSkill(value);
        const key = skill.toLowerCase();
        if (!skill || seen.has(key) || next.length >= MAX_SKILLS) return;
        next.push(skill);
        seen.add(key);
    });

    return next;
};

export default function SkillsCard({ skills }: SkillsCardProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [committed, setCommitted] = useState<string[]>(skills);
    const [draft, setDraft] = useState<string[]>(skills);
    const [input, setInput] = useState("");

    const startEditing = () => {
        setDraft(committed);
        setInput("");
        setEditing(true);
    };

    const cancelEditing = () => {
        if (saving) return;
        setEditing(false);
    };

    const addSkills = (values: string[]) => setDraft((current) => mergeSkills(current, values));

    const commitInput = () => {
        if (!input.trim()) return;
        addSkills(input.split(","));
        setInput("");
    };

    const removeSkill = (target: string) => setDraft((current) => current.filter((skill) => skill !== target));

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commitInput();
            return;
        }
        if (event.key === "Backspace" && !input && draft.length > 0) {
            setDraft((current) => current.slice(0, -1));
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        const text = event.clipboardData.getData("text");
        if (!/[\n,]/.test(text)) return;
        event.preventDefault();
        addSkills(text.split(/[\n,]/));
        setInput("");
    };

    const handleSave = async () => {
        const nextSkills = mergeSkills(draft, input.split(","));

        setSaving(true);
        try {
            await updateUserProfile({ skills: nextSkills });
            setCommitted(nextSkills);
            setDraft(nextSkills);
            setInput("");
            setEditing(false);
            toast.success("Skills updated");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update your skills");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProfileSection
            title="Skills"
            description="What you bring to a role. Used to match you with jobs."
            icon={<Sparkles size={16} />}
            action={
                !editing && (
                    <Button type="button" variant="ghost" size="sm" iconLeft={<Pencil size={14} />} onClick={startEditing}>
                        Edit
                    </Button>
                )
            }
        >
            {editing ? (
                <div className="space-y-5">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-ink-200 bg-surface px-2.5 py-2 transition-colors focus-within:border-cobalt-500 focus-within:ring-2 focus-within:ring-cobalt-100">
                            {draft.map((skill) => (
                                <SkillTag key={skill} label={skill} onRemove={() => removeSkill(skill)} />
                            ))}
                            <input
                                type="text"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                                onBlur={commitInput}
                                disabled={draft.length >= MAX_SKILLS}
                                placeholder={draft.length > 0 ? "Add another skill" : "Type a skill and press Enter"}
                                className="h-7 min-w-40 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 disabled:cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-ink-500">
                            Press Enter or comma to add a skill. {draft.length} / {MAX_SKILLS} added.
                        </p>
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
                <div className="flex flex-wrap gap-2">
                    {committed.map((skill) => (
                        <SkillTag key={skill} label={skill} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-ink-400">No skills added yet. Add a few so we can match you to roles.</p>
            )}
        </ProfileSection>
    );
}

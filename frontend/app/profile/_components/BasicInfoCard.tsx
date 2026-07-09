"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Pencil, UserRound } from "lucide-react";
import { toast } from "react-toastify";

import Button from "../../_components/Button";
import Input from "../../_components/Input";
import { updateUserProfile } from "../../../lib/api/user/user";
import {
    PHONE_ERROR_MESSAGE,
    PHONE_MAX_LENGTH,
    isValidPhone,
    sanitizePhoneInput,
} from "../../../lib/validation/phone";
import ProfileSection from "./ProfileSection";

interface BasicInfoCardProps {
    fullName: string;
    email: string;
    phone: string;
}

type Errors = Partial<Record<"fullName" | "phone", string>>;

export default function BasicInfoCard({ fullName, email, phone }: BasicInfoCardProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [committedName, setCommittedName] = useState(fullName);
    const [committedPhone, setCommittedPhone] = useState(phone);
    const [nameDraft, setNameDraft] = useState(fullName);
    const [phoneDraft, setPhoneDraft] = useState(phone);
    const [errors, setErrors] = useState<Errors>({});

    const startEditing = () => {
        setNameDraft(committedName);
        setPhoneDraft(committedPhone);
        setErrors({});
        setEditing(true);
    };

    const cancelEditing = () => {
        if (saving) return;
        setEditing(false);
    };

    const validate = (): boolean => {
        const next: Errors = {};
        if (nameDraft.trim().length < 2) next.fullName = "Enter your full name.";

        const trimmedPhone = phoneDraft.trim();
        if (trimmedPhone && !isValidPhone(trimmedPhone)) {
            next.phone = PHONE_ERROR_MESSAGE;
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const trimmedName = nameDraft.trim();
        const trimmedPhone = phoneDraft.trim();

        setSaving(true);
        try {
            await updateUserProfile({
                fullName: trimmedName,
                ...(trimmedPhone ? { phone: trimmedPhone } : {}),
            });
            setCommittedName(trimmedName);
            setCommittedPhone(trimmedPhone);
            setEditing(false);
            toast.success("Profile updated");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update your profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProfileSection
            title="Basic information"
            description="Your name and contact details."
            icon={<UserRound size={16} />}
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
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                            label="Full name"
                            value={nameDraft}
                            error={errors.fullName}
                            onChange={(event) => setNameDraft(event.target.value)}
                            placeholder="Your full name"
                        />
                        <Input
                            label="Phone"
                            value={phoneDraft}
                            error={errors.phone}
                            hint="Optional · 10 digits starting 98 or 97"
                            inputMode="numeric"
                            maxLength={PHONE_MAX_LENGTH}
                            onChange={(event) => setPhoneDraft(sanitizePhoneInput(event.target.value))}
                            placeholder="98XXXXXXXX"
                        />
                    </div>

                    <div>
                        <Input label="Email" value={email} disabled hint="Email can't be changed here." />
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
            ) : (
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Full name</dt>
                        <dd className="mt-1 text-sm font-medium text-ink-900">{committedName || "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Email</dt>
                        <dd className="mt-1 flex items-center gap-1.5 text-sm text-ink-700">
                            <Mail size={14} className="shrink-0 text-ink-400" />
                            <span className="truncate">{email || "—"}</span>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Phone</dt>
                        <dd className="mt-1 text-sm text-ink-700">
                            {committedPhone || <span className="text-ink-400">Not added yet</span>}
                        </dd>
                    </div>
                </dl>
            )}
        </ProfileSection>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { deleteUser, updateUser } from "../../../lib/api/admin/user";
import {
    PHONE_ERROR_MESSAGE,
    PHONE_MAX_LENGTH,
    isValidPhone,
    sanitizePhoneInput,
} from "../../../lib/validation/phone";
import AdminButton from "./AdminButton";

interface UserActionsProps {
    userId: string;
    fullName: string;
    phone: string;
}

export default function UserActions({ userId, fullName, phone }: UserActionsProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);
    const [nameDraft, setNameDraft] = useState(fullName);
    const [phoneDraft, setPhoneDraft] = useState(phone);
    const [error, setError] = useState<string | null>(null);

    const openEdit = () => {
        setNameDraft(fullName);
        setPhoneDraft(phone);
        setError(null);
        setEditing(true);
    };

    const handleSave = async () => {
        if (nameDraft.trim().length < 2) {
            setError("Enter a full name (at least 2 characters).");
            return;
        }
        const trimmedPhone = phoneDraft.trim();
        if (trimmedPhone && !isValidPhone(trimmedPhone)) {
            setError(PHONE_ERROR_MESSAGE);
            return;
        }

        setBusy(true);
        try {
            await updateUser(userId, {
                fullName: nameDraft.trim(),
                ...(trimmedPhone ? { phone: trimmedPhone } : {}),
            });
            toast.success("User updated");
            setEditing(false);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not update user");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this user? This can't be undone.")) return;
        setBusy(true);
        try {
            await deleteUser(userId);
            toast.success("User deleted");
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not delete user");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <div className="flex gap-2">
                <AdminButton tone="edit" onClick={openEdit} disabled={busy}>
                    Edit
                </AdminButton>
                <AdminButton tone="delete" onClick={handleDelete} disabled={busy}>
                    Delete
                </AdminButton>
            </div>

            {editing && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/45 p-4"
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !busy) setEditing(false);
                    }}
                >
                    <div className="w-full max-w-sm rounded-lg bg-surface p-5 shadow-modal">
                        <h2 className="text-base font-semibold text-ink-900">Edit user</h2>

                        <label className="mt-4 block text-xs font-medium text-ink-600">Full name</label>
                        <input
                            value={nameDraft}
                            onChange={(event) => setNameDraft(event.target.value)}
                            className="mt-1 h-9 w-full rounded-md border border-ink-200 px-3 text-sm outline-none focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100"
                        />

                        <label className="mt-3 block text-xs font-medium text-ink-600">Phone</label>
                        <input
                            value={phoneDraft}
                            inputMode="numeric"
                            maxLength={PHONE_MAX_LENGTH}
                            onChange={(event) => setPhoneDraft(sanitizePhoneInput(event.target.value))}
                            placeholder="98XXXXXXXX"
                            className="mt-1 h-9 w-full rounded-md border border-ink-200 px-3 text-sm outline-none focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100"
                        />

                        {error && <p className="mt-2 text-xs text-danger-700">{error}</p>}

                        <div className="mt-5 flex justify-end gap-2">
                            <AdminButton tone="edit" onClick={() => setEditing(false)} disabled={busy}>
                                Cancel
                            </AdminButton>
                            <AdminButton tone="primary" onClick={handleSave} disabled={busy}>
                                {busy ? "Saving…" : "Save"}
                            </AdminButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { deleteUser, updateUser } from "../../../lib/api/admin/user";
import AdminButton from "./AdminButton";

interface EmployerActionsProps {
    userId: string;
    isVerified: boolean;
}

export default function EmployerActions({ userId, isVerified }: EmployerActionsProps) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const handleVerify = async () => {
        setBusy(true);
        try {
            await updateUser(userId, { isVerified: true });
            toast.success("Employer verified");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not verify employer");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this employer? This can't be undone.")) return;
        setBusy(true);
        try {
            await deleteUser(userId);
            toast.success("Employer deleted");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not delete employer");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex gap-2">
            {!isVerified && (
                <AdminButton tone="verify" onClick={handleVerify} disabled={busy}>
                    Verify
                </AdminButton>
            )}
            <AdminButton tone="delete" onClick={handleDelete} disabled={busy}>
                Delete
            </AdminButton>
        </div>
    );
}

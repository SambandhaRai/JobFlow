"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { deleteCompany, verifyCompany } from "../../../lib/api/admin/company";
import AdminButton from "./AdminButton";

interface CompanyActionsProps {
    companyId: string;
    isVerified: boolean;
}

export default function CompanyActions({ companyId, isVerified }: CompanyActionsProps) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const handleVerify = async () => {
        setBusy(true);
        try {
            await verifyCompany(companyId);
            toast.success("Company verified");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not verify company");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this company? This can't be undone.")) return;
        setBusy(true);
        try {
            await deleteCompany(companyId);
            toast.success("Company deleted");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not delete company");
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

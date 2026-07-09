"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

import Button from "../../_components/Button";
import Input from "../../_components/Input";
import Textarea from "../../_components/Textarea";
import CompanyAvatar from "../../_components/CompanyAvatar";
import { updateCompany, uploadCompanyLogo } from "../../../lib/api/company/company";
import { resolveAvatarUrl } from "../../../lib/avatar";
import type { EmployerCompany } from "./employerData";

const ACCEPTED_FILES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

type Fields = {
    name: string;
    website: string;
    description: string;
    industry: string;
    location: string;
    email: string;
    phone: string;
};

const toFields = (company: EmployerCompany): Fields => ({
    name: company.name ?? "",
    website: company.website ?? "",
    description: company.description ?? "",
    industry: company.industry ?? "",
    location: company.location ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
});

export default function CompanyEditor({ company }: { company: EmployerCompany }) {
    const router = useRouter();
    const companyId = company._id ?? company.id ?? "";

    const [fields, setFields] = useState<Fields>(() => toFields(company));
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoSrc, setLogoSrc] = useState<string | null>(() => resolveAvatarUrl(company.logoUrl));
    const fileInputRef = useRef<HTMLInputElement>(null);

    const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    const handleLogoUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            toast.error("Logo must be 5 MB or smaller");
            return;
        }

        const form = new FormData();
        form.append("logo", file);

        setUploading(true);
        try {
            const response = await uploadCompanyLogo(companyId, form);
            const fileName = (response as { data?: { logoUrl?: string } })?.data?.logoUrl;
            const next = resolveAvatarUrl(fileName);
            if (next) setLogoSrc(`${next}?t=${Date.now()}`);
            toast.success("Company logo updated");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not upload logo");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) void handleLogoUpload(file);
    };

    const handleSave = async () => {
        if (fields.name.trim().length < 2) {
            toast.error("Company name must be at least 2 characters");
            return;
        }

        setSaving(true);
        try {
            await updateCompany(companyId, {
                name: fields.name.trim(),
                ...(fields.website.trim() ? { website: fields.website.trim() } : {}),
                ...(fields.description.trim() ? { description: fields.description.trim() } : {}),
                ...(fields.industry.trim() ? { industry: fields.industry.trim() } : {}),
                ...(fields.location.trim() ? { location: fields.location.trim() } : {}),
                ...(fields.email.trim() ? { email: fields.email.trim() } : {}),
                ...(fields.phone.trim() ? { phone: fields.phone.trim() } : {}),
            });
            toast.success("Company details saved");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save company details");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-lg border border-ink-200 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-4 border-b border-ink-100 pb-5">
                <div className="group relative h-20 w-20 shrink-0">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_FILES}
                        onChange={onFileInputChange}
                        className="hidden"
                    />
                    {logoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoSrc}
                            alt={`${fields.name || "Company"} logo`}
                            className="h-20 w-20 rounded-lg border border-ink-100 object-cover"
                        />
                    ) : (
                        <CompanyAvatar name={fields.name || "Company"} size="xl" className="h-20 w-20 rounded-lg" />
                    )}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        aria-label="Change company logo"
                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-ink-900/50 text-white opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed"
                    >
                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                    </button>
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-ink-900">{fields.name || "Your company"}</h2>
                        {company.isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700">
                                <ShieldCheck size={12} />
                                Verified
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-ink-500">Hover the logo to upload a new image · JPG, PNG, WEBP, GIF up to 5 MB</p>
                </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input label="Company name" value={fields.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme Inc." />
                <Input label="Industry" value={fields.industry} onChange={(e) => set("industry", e.target.value)} placeholder="IT & Software" />
                <Input label="Website" value={fields.website} onChange={(e) => set("website", e.target.value)} placeholder="https://acme.com" />
                <Input label="Location" value={fields.location} onChange={(e) => set("location", e.target.value)} placeholder="Kathmandu, Nepal" />
                <Input label="Email" type="email" value={fields.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@acme.com" />
                <Input label="Phone" value={fields.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98XXXXXXXX" />
            </div>

            <div className="mt-5">
                <Textarea
                    label="About the company"
                    value={fields.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="What does your company do?"
                    rows={4}
                />
            </div>

            <div className="mt-5 flex justify-end">
                <Button type="button" onClick={handleSave} loading={saving}>
                    Save changes
                </Button>
            </div>
        </div>
    );
}

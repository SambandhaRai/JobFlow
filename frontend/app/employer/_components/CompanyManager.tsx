"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { toast } from "react-toastify";

import Button from "../../_components/Button";
import Input from "../../_components/Input";
import Textarea from "../../_components/Textarea";
import { createCompany } from "../../../lib/api/company/company";
import CompanyEditor from "./CompanyEditor";
import type { EmployerCompany } from "./employerData";

function CreateCompanyForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (name.trim().length < 2) {
            toast.error("Company name must be at least 2 characters");
            return;
        }

        setSaving(true);
        try {
            await createCompany({
                name: name.trim(),
                ...(industry.trim() ? { industry: industry.trim() } : {}),
                ...(website.trim() ? { website: website.trim() } : {}),
                ...(location.trim() ? { location: location.trim() } : {}),
                ...(description.trim() ? { description: description.trim() } : {}),
            });
            toast.success("Company created — you can now add a logo");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create company");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-lg border border-ink-200 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-3 border-b border-ink-100 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                    <Building2 size={20} />
                </span>
                <div>
                    <h2 className="text-base font-semibold text-ink-900">Set up your company</h2>
                    <p className="mt-0.5 text-xs text-ink-500">Create your company profile first, then add a logo.</p>
                </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input label="Company name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." />
                <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="IT & Software" />
                <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" />
                <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kathmandu, Nepal" />
            </div>

            <div className="mt-5">
                <Textarea
                    label="About the company"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does your company do?"
                    rows={4}
                />
            </div>

            <div className="mt-5 flex justify-end">
                <Button type="button" onClick={handleCreate} loading={saving}>
                    Create company
                </Button>
            </div>
        </div>
    );
}

export default function CompanyManager({ initialCompanies }: { initialCompanies: EmployerCompany[] }) {
    if (initialCompanies.length === 0) {
        return <CreateCompanyForm />;
    }

    return (
        <div className="space-y-5">
            {initialCompanies.map((company) => (
                <CompanyEditor key={company._id ?? company.id} company={company} />
            ))}
        </div>
    );
}

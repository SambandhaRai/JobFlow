"use client";

import { useState, type ReactNode } from "react";

import ApplyModal from "./ApplyModal";
import type { ApplicantDefaults, ApplicantResume, ApplyJob } from "./jobDetailsData";

interface ApplyButtonProps {
    job: ApplyJob;
    defaults: ApplicantDefaults;
    resumes: ApplicantResume[];
    className?: string;
    children: ReactNode;
}

export default function ApplyButton({ job, defaults, resumes, className, children }: ApplyButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className}>
                {children}
            </button>
            {open && (
                <ApplyModal
                    job={job}
                    defaults={defaults}
                    resumes={resumes}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}

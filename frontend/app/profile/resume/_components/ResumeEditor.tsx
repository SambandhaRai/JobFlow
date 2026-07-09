"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Download, GraduationCap, Mail, Pencil, Phone, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";

import { updateUserProfile } from "../../../../lib/api/user/user";
import type { UpdateProfilePayload } from "../../../../lib/api/endpoints";
import type { ProfileData, ProfileEducation, ProfileExperience } from "../../_components/profileData";
import { educationLevels, MAX_SKILLS } from "../../setup/_components/profileSetupOptions";
import { employmentTypes } from "../../setup/_components/experienceOptions";
import styles from "../resume.module.css";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const educationLabel = (education: ProfileEducation) => (
    educationLevels.find((item) => item.value === education.level)?.label ?? education.level
);

const employmentLabel = (experience: ProfileExperience) => (
    employmentTypes.find((item) => item.value === experience.employmentType)?.label ?? experience.employmentType
);

const monthYear = (month: string, year: string) => (
    [monthNames[Number(month) - 1], year].filter(Boolean).join(" ")
);

const experiencePeriod = (experience: ProfileExperience) => {
    const start = monthYear(experience.startMonth, experience.startYear);
    const end = experience.isCurrent ? "Present" : monthYear(experience.endMonth, experience.endYear);
    return [start, end].filter(Boolean).join(" – ");
};

const cloneProfile = (profile: ProfileData): ProfileData => ({
    ...profile,
    skills: [...profile.skills],
    educations: profile.educations.map((education) => ({ ...education })),
    experiences: profile.experiences.map((experience) => ({ ...experience })),
});

const normalizeSkill = (skill: string) => skill.trim().replace(/\s+/g, " ");

const fieldClass = "rounded border border-dashed border-[#a9b6d9] bg-[#f7f9ff] outline-none transition-colors placeholder:text-[#9aa3b5] focus:border-[#2e5bff] focus:bg-white";

function SectionHeading({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="mb-4 flex items-center gap-2 border-b border-[#d9dee8] pb-2">
            <span className="text-[#2e5bff]">{icon}</span>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#1a1f26]">{children}</h2>
        </div>
    );
}

export default function ResumeEditor({ profile }: { profile: ProfileData }) {
    const router = useRouter();
    const [committed, setCommitted] = useState<ProfileData>(profile);
    const [draft, setDraft] = useState<ProfileData>(profile);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [skillInput, setSkillInput] = useState("");

    const data = editing ? draft : committed;
    const hasResumeContent = Boolean(committed.educations.length || committed.experiences.length || committed.skills.length);

    const displayName = data.fullName.trim() || "Your name";
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U";

    const patchDraft = (patch: Partial<ProfileData>) => setDraft((current) => ({ ...current, ...patch }));

    const patchExperience = (id: string, patch: Partial<ProfileExperience>) => setDraft((current) => ({
        ...current,
        experiences: current.experiences.map((experience) => (
            experience.id === id ? { ...experience, ...patch } : experience
        )),
    }));

    const patchEducation = (id: string, patch: Partial<ProfileEducation>) => setDraft((current) => ({
        ...current,
        educations: current.educations.map((education) => (
            education.id === id ? { ...education, ...patch } : education
        )),
    }));

    const addSkill = () => {
        const skill = normalizeSkill(skillInput);
        setSkillInput("");
        if (!skill) return;
        setDraft((current) => {
            const exists = current.skills.some((item) => item.toLowerCase() === skill.toLowerCase());
            if (exists || current.skills.length >= MAX_SKILLS) return current;
            return { ...current, skills: [...current.skills, skill] };
        });
    };

    const removeSkill = (target: string) => setDraft((current) => ({
        ...current,
        skills: current.skills.filter((skill) => skill !== target),
    }));

    const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addSkill();
        }
    };

    const startEditing = () => {
        setDraft(cloneProfile(committed));
        setSkillInput("");
        setEditing(true);
    };

    const cancelEditing = () => {
        if (saving) return;
        setEditing(false);
    };

    const handleSave = async () => {
        const fullName = draft.fullName.trim();
        if (fullName.length < 2) {
            toast.error("Name must be at least 2 characters");
            return;
        }
        if (draft.experiences.some((experience) => !experience.title.trim() || !experience.organization.trim())) {
            toast.error("Experience entries need a title and an organization");
            return;
        }
        if (draft.educations.some((education) => !education.institutionName.trim())) {
            toast.error("Education entries need an institution name");
            return;
        }

        const phone = draft.phone.trim();
        const payload: UpdateProfilePayload = {
            fullName,
            ...(phone ? { phone } : {}),
            educations: draft.educations.map((education) => ({
                level: education.level,
                institutionName: education.institutionName.trim(),
                status: education.status,
                ...(education.completionYear.trim() ? { completionYear: education.completionYear.trim() } : {}),
            })),
            experiences: draft.experiences.map((experience) => ({
                title: experience.title.trim(),
                organization: experience.organization.trim(),
                employmentType: experience.employmentType,
                startMonth: experience.startMonth,
                startYear: experience.startYear,
                isCurrent: experience.isCurrent,
                ...(experience.isCurrent ? {} : { endMonth: experience.endMonth, endYear: experience.endYear }),
                ...(experience.description.trim() ? { description: experience.description.trim() } : {}),
            })),
            skills: draft.skills,
        };

        setSaving(true);
        try {
            await updateUserProfile(payload);
            const next = cloneProfile(draft);
            next.fullName = fullName;
            next.phone = phone;
            setCommitted(next);
            setEditing(false);
            toast.success("Resume updated");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update your resume");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAsPdf = async () => {
        setDownloading(true);
        try {
            const { downloadResumePdf } = await import("../resumePdf");
            await downloadResumePdf(committed);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create the PDF");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <div className="mx-auto mb-6 flex max-w-[210mm] flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Resume creator</h1>
                    <p className="mt-1 text-sm text-ink-500">
                        {editing
                            ? "Click any highlighted field to edit it. Changes are saved back to your profile."
                            : "This résumé stays in sync with the information in your profile."}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {editing ? (
                        <>
                            <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={saving}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-ink-200 bg-surface px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex h-9 items-center gap-2 rounded-md bg-cobalt-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cobalt-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? "Saving…" : "Save changes"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={startEditing}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-ink-200 bg-surface px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
                            >
                                <Pencil size={14} />
                                Edit resume
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveAsPdf}
                                disabled={downloading}
                                className="inline-flex h-9 items-center gap-2 rounded-md bg-cobalt-500 px-4 text-sm font-medium text-white transition-colors hover:bg-cobalt-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Download size={14} />
                                {downloading ? "Preparing…" : "Save as PDF"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {editing && (
                <p className="mx-auto mb-4 max-w-[210mm] text-xs text-ink-400">
                    Dates, employment types and adding or removing entries are managed on your{" "}
                    <Link href="/profile" className="underline underline-offset-2 hover:text-ink-600">profile page</Link>.
                </p>
            )}

            {!hasResumeContent && !editing && (
                <div className="mx-auto mb-4 flex max-w-[210mm] items-start justify-between gap-4 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-warning-700">
                    <div>
                        <p className="font-medium">Your résumé needs a little more information.</p>
                        <p className="mt-0.5 text-xs">Add education, experience, or skills to build out the document.</p>
                    </div>
                    <Link href="/profile" className="shrink-0 font-medium underline underline-offset-2">Complete profile</Link>
                </div>
            )}

            <div className="flex justify-center">
                <article className={`${styles.resumePaper} overflow-hidden rounded-xl border border-ink-200 bg-white text-[#2a3038] shadow-popover`}>
                    <header className="border-b-[6px] border-[#2e5bff] bg-[#f7f8fc] px-8 py-8 sm:px-12 sm:py-10">
                        <div className="flex items-start justify-between gap-6">
                            <div className="min-w-0 flex-1">
                                {editing ? (
                                    <input
                                        type="text"
                                        value={draft.fullName}
                                        onChange={(event) => patchDraft({ fullName: event.target.value })}
                                        placeholder="Your name"
                                        className={`${fieldClass} w-full max-w-md px-2 py-0.5 font-display text-3xl font-bold tracking-tight text-[#0e1116] sm:text-4xl`}
                                    />
                                ) : (
                                    <h1 className="font-display text-3xl font-bold tracking-tight text-[#0e1116] sm:text-4xl">
                                        {displayName}
                                    </h1>
                                )}
                                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#4a5160] sm:text-sm">
                                    {data.email && (
                                        <span className="inline-flex items-center gap-1.5" title="Your email comes from your account">
                                            <Mail size={13} />
                                            {data.email}
                                        </span>
                                    )}
                                    {editing ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone size={13} />
                                            <input
                                                type="tel"
                                                value={draft.phone}
                                                onChange={(event) => patchDraft({ phone: event.target.value })}
                                                placeholder="Phone number"
                                                className={`${fieldClass} w-40 px-1.5 py-0.5 text-xs sm:text-sm`}
                                            />
                                        </span>
                                    ) : data.phone ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone size={13} />
                                            {data.phone}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            {data.profilePicture ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={data.profilePicture}
                                    alt={displayName}
                                    className="h-20 w-20 shrink-0 rounded-xl border-2 border-white object-cover shadow-sm sm:h-24 sm:w-24"
                                />
                            ) : (
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#dde5ff] font-display text-xl font-bold text-[#1d45e5] sm:h-24 sm:w-24">
                                    {initials}
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="space-y-8 px-8 py-8 sm:px-12 sm:py-10">
                        {data.experiences.length > 0 && (
                            <section>
                                <SectionHeading icon={<BriefcaseBusiness size={16} />}>Experience</SectionHeading>
                                <div className="space-y-6">
                                    {data.experiences.map((experience) => (
                                        <div key={experience.id} className="break-inside-avoid">
                                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start sm:gap-4">
                                                <div className="min-w-0 flex-1">
                                                    {editing ? (
                                                        <div className="space-y-1">
                                                            <input
                                                                type="text"
                                                                value={experience.title}
                                                                onChange={(event) => patchExperience(experience.id, { title: event.target.value })}
                                                                placeholder="Job title"
                                                                className={`${fieldClass} w-full px-1.5 py-0.5 text-sm font-bold text-[#0e1116] sm:text-base`}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={experience.organization}
                                                                onChange={(event) => patchExperience(experience.id, { organization: event.target.value })}
                                                                placeholder="Organization"
                                                                className={`${fieldClass} w-full px-1.5 py-0.5 text-sm font-medium text-[#2e5bff]`}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <h3 className="text-sm font-bold text-[#0e1116] sm:text-base">{experience.title}</h3>
                                                            <p className="mt-0.5 text-sm font-medium text-[#2e5bff]">{experience.organization}</p>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="shrink-0 text-xs text-[#6b7280] sm:text-right">
                                                    <p>{experiencePeriod(experience)}</p>
                                                    <p className="mt-0.5">{employmentLabel(experience)}</p>
                                                </div>
                                            </div>
                                            {editing ? (
                                                <textarea
                                                    value={experience.description}
                                                    onChange={(event) => patchExperience(experience.id, { description: event.target.value })}
                                                    placeholder="Describe what you did in this role…"
                                                    rows={Math.min(8, Math.max(2, experience.description.split("\n").length + 1))}
                                                    className={`${fieldClass} mt-2 w-full resize-y px-1.5 py-1 text-sm leading-6 text-[#4a5160]`}
                                                />
                                            ) : experience.description ? (
                                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4a5160]">
                                                    {experience.description}
                                                </p>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {data.educations.length > 0 && (
                            <section>
                                <SectionHeading icon={<GraduationCap size={16} />}>Education</SectionHeading>
                                <div className="space-y-5">
                                    {data.educations.map((education) => (
                                        <div key={education.id} className="flex break-inside-avoid flex-col justify-between gap-1 sm:flex-row sm:items-start sm:gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-bold text-[#0e1116] sm:text-base">{educationLabel(education)}</h3>
                                                {editing ? (
                                                    <input
                                                        type="text"
                                                        value={education.institutionName}
                                                        onChange={(event) => patchEducation(education.id, { institutionName: event.target.value })}
                                                        placeholder="Institution name"
                                                        className={`${fieldClass} mt-1 w-full max-w-sm px-1.5 py-0.5 text-sm text-[#4a5160]`}
                                                    />
                                                ) : (
                                                    <p className="mt-0.5 text-sm text-[#4a5160]">{education.institutionName}</p>
                                                )}
                                            </div>
                                            {editing ? (
                                                <p className="shrink-0 text-xs text-[#6b7280] sm:text-right">
                                                    {education.status === "currently-studying" ? "Expected" : "Completed"}{" "}
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={education.completionYear}
                                                        onChange={(event) => patchEducation(education.id, { completionYear: event.target.value.replace(/[^0-9]/g, "").slice(0, 4) })}
                                                        placeholder="Year"
                                                        className={`${fieldClass} w-14 px-1.5 py-0.5 text-xs`}
                                                    />
                                                </p>
                                            ) : education.completionYear ? (
                                                <p className="shrink-0 text-xs text-[#6b7280] sm:text-right">
                                                    {education.status === "currently-studying" ? "Expected" : "Completed"} {education.completionYear}
                                                </p>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {(data.skills.length > 0 || editing) && (
                            <section>
                                <SectionHeading icon={<Sparkles size={16} />}>Skills</SectionHeading>
                                <div className="flex flex-wrap items-center gap-2">
                                    {data.skills.map((skill) => (
                                        <span key={skill} className="inline-flex items-center gap-1 rounded-md bg-[#eef2ff] px-3 py-1.5 text-xs font-semibold text-[#1535b8]">
                                            {skill}
                                            {editing && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                    className="ml-0.5 text-[#7a8cc9] transition-colors hover:text-[#1535b8]"
                                                    aria-label={`Remove ${skill}`}
                                                >
                                                    <X size={11} strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {editing && (
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(event) => setSkillInput(event.target.value)}
                                            onKeyDown={handleSkillKeyDown}
                                            onBlur={addSkill}
                                            disabled={draft.skills.length >= MAX_SKILLS}
                                            placeholder={draft.skills.length > 0 ? "Add a skill" : "Type a skill and press Enter"}
                                            className={`${fieldClass} h-7 min-w-36 px-2 text-xs disabled:cursor-not-allowed`}
                                        />
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </article>
            </div>
        </>
    );
}

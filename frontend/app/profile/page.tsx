import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Circle, FileText, GraduationCap, Mail, Sparkles } from "lucide-react";

import Sidebar from "../_components/Sidebar";
import ScrollToTop from "../_components/ScrollToTop";
import TopBar from "../_components/TopBar";
import AvatarUploader from "./_components/AvatarUploader";
import BasicInfoCard from "./_components/BasicInfoCard";
import EducationCard from "./_components/EducationCard";
import ResumesCard from "./_components/ResumesCard";
import SkillsCard from "./_components/SkillsCard";
import {
    fetchProfileUser,
    getProfileCompletion,
    mapProfile,
    type RawProfileUser,
} from "./_components/profileData";

export const dynamic = "force-dynamic";

const parseUserCookie = (value?: string): RawProfileUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as RawProfileUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as RawProfileUser;
        } catch {
            return null;
        }
    }
};

const roleLabel = (role: string) => (
    {
        user: "Job seeker",
        employer: "Employer",
        admin: "Admin",
    }[role] ?? "Job seeker"
);

function ProgressRing({ percent }: { percent: number }) {
    const value = Math.max(0, Math.min(100, percent));

    return (
        <div className="relative h-14 w-14 shrink-0">
            <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-ink-200" />
                <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    pathLength={100}
                    strokeDasharray={`${value} 100`}
                    className="stroke-cobalt-500"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink-900">
                {value}%
            </span>
        </div>
    );
}

function StatTile({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
    return (
        <div className="rounded-lg border border-ink-100 bg-ink-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                    {icon}
                </span>
                <span className="font-display text-2xl font-bold leading-none text-ink-900">{value}</span>
            </div>
            <p className="mt-1.5 text-xs font-medium text-ink-500">{label}</p>
        </div>
    );
}

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const cookieUser = parseUserCookie(cookieStore.get("user_data")?.value);

    const { user: fetchedUser, error } = await fetchProfileUser(token);
    const rawUser = fetchedUser ?? cookieUser;
    const profile = rawUser ? mapProfile(rawUser) : null;
    const completion = getProfileCompletion(profile);
    const displayName = profile?.fullName?.trim() || "Job seeker";
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U";
    const nextStep = completion.items.find((item) => !item.done) ?? null;

    return (
        <div className="min-h-screen bg-background">
            <ScrollToTop trigger="profile" />

            <Sidebar
                user={{ name: displayName, subtitle: profile?.email || "Student" }}
                profileCompletion={{ percent: completion.percent, hint: completion.hint }}
            />

            <div className="min-h-screen transition-[padding] duration-200 lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar userName={displayName} />

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Your profile</h1>
                    <p className="mt-1 text-sm text-ink-500">
                        Keep this up to date — it powers your job matches and pre-fills every application.
                    </p>

                    {error && !profile ? (
                        <div className="mt-6 flex gap-3 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-4 text-sm text-danger-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">Could not load your profile.</p>
                                <p className="mt-1 text-danger-700/80">{error}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-5">
                            <section className="overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-card">
                                <div className="relative h-24 overflow-hidden bg-gradient-to-br from-cobalt-700 via-cobalt-500 to-cobalt-400 sm:h-28">
                                    <div
                                        className="absolute inset-0 opacity-20"
                                        style={{
                                            backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1.5px)",
                                            backgroundSize: "18px 18px",
                                        }}
                                    />
                                    <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-cobalt-300/40 blur-2xl" />
                                    <div className="absolute -bottom-16 left-1/4 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
                                </div>

                                <div className="relative z-10 px-5 pb-5 sm:px-6 sm:pb-6">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                        <div className="flex min-w-0 items-end gap-4">
                                            <AvatarUploader
                                                initials={initials}
                                                name={displayName}
                                                profilePicture={profile?.profilePicture ?? null}
                                            />
                                            <div className="min-w-0 pb-0.5">
                                                <h2 className="truncate text-xl font-semibold text-ink-900">{displayName}</h2>
                                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                                                    <span className="inline-flex items-center rounded-full bg-cobalt-50 px-2 py-0.5 font-medium text-cobalt-700">
                                                        {roleLabel(profile?.role ?? "user")}
                                                    </span>
                                                    {profile?.email && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Mail size={13} className="text-ink-400" />
                                                            <span className="truncate">{profile.email}</span>
                                                        </span>
                                                    )}
                                                    {profile?.memberSince && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <CalendarDays size={13} className="text-ink-400" />
                                                            Since {profile.memberSince}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/70 px-4 py-3">
                                            <ProgressRing percent={completion.percent} />
                                            <div>
                                                <p className="text-sm font-semibold text-ink-900">{completion.percent}% complete</p>
                                                {nextStep ? (
                                                    <p className="mt-0.5 text-xs text-ink-500">Next: add your {nextStep.label.toLowerCase()}</p>
                                                ) : (
                                                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-success-700">
                                                        <CheckCircle2 size={12} />
                                                        All set
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-3 gap-3">
                                        <StatTile icon={<Sparkles size={15} />} value={profile?.skills.length ?? 0} label="Skills" />
                                        <StatTile icon={<GraduationCap size={15} />} value={profile?.educations.length ?? 0} label="Education" />
                                        <StatTile icon={<FileText size={15} />} value={profile?.resumes.length ?? 0} label="Résumés" />
                                    </div>

                                    {completion.percent < 100 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {completion.items.map((item) => (
                                                <span
                                                    key={item.label}
                                                    className={[
                                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                                                        item.done
                                                            ? "border-success-500/20 bg-success-50 text-success-700"
                                                            : "border-ink-200 bg-surface text-ink-500",
                                                    ].join(" ")}
                                                >
                                                    {item.done ? <CheckCircle2 size={12} /> : <Circle size={12} className="text-ink-300" />}
                                                    {item.label}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {profile && (
                                <>
                                    <BasicInfoCard
                                        fullName={profile.fullName}
                                        email={profile.email}
                                        phone={profile.phone}
                                    />
                                    <EducationCard educations={profile.educations} />
                                    <SkillsCard skills={profile.skills} />
                                    <ResumesCard resumes={profile.resumes} />
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

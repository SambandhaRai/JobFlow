import Link from "next/link";
import { cookies } from "next/headers";
import { AlertCircle, CheckCircle2, Clock3, Eye, Send, Sparkles } from "lucide-react";

import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";
import ApplicationsRealtimeSync from "./_components/ApplicationsRealtimeSync";
import ApplicationsTable from "./_components/ApplicationsTable";
import StatCard from "./_components/StatCard";
import {
    fetchApplicationsData,
    type ApplicationsUser,
} from "./_components/applicationsData";

export const dynamic = "force-dynamic";

const parseUserCookie = (value?: string): ApplicationsUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as ApplicationsUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as ApplicationsUser;
        } catch {
            return null;
        }
    }
};

const getProfileCompletion = (user: ApplicationsUser | null) => {
    if (!user) {
        return { percent: 30, hint: "Complete your profile to unlock better matches." };
    }

    const hasEducation = Array.isArray(user.educations) && user.educations.length > 0;
    const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;
    const hasResume = Array.isArray(user.resumes) && user.resumes.length > 0;
    const completed = [Boolean(user.fullName), hasEducation, hasSkills, hasResume].filter(Boolean).length;
    const percent = Math.max(25, Math.round((completed / 4) * 100));

    return {
        percent,
        hint: hasResume
            ? "Your profile is ready for stronger matches."
            : "Add 1 resume to qualify for more roles.",
    };
};

export default async function ApplicationsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const cookieUser = parseUserCookie(cookieStore.get("user_data")?.value);

    const { applications, stats, user: fetchedUser, error } = await fetchApplicationsData(token);
    const user = fetchedUser ?? cookieUser;
    const fullName = user?.fullName ?? "Job seeker";

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={{ name: fullName, subtitle: user?.email ?? "Student" }}
                profileCompletion={getProfileCompletion(user)}
            />

            <div className="min-h-screen transition-[padding] duration-200 lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar userName={fullName} />
                <ApplicationsRealtimeSync />

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">My applications</h1>
                        {stats.total > 0 && (
                            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-sm font-medium text-ink-600">
                                {stats.total} total
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                        Track every step. We&apos;ll notify you the moment a status changes.
                    </p>

                    {error ? (
                        <div className="mt-6 flex gap-3 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-4 text-sm text-danger-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">Could not load your applications.</p>
                                <p className="mt-1 text-danger-700/80">{error}</p>
                            </div>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="mt-6 rounded-lg border border-ink-100 bg-surface px-5 py-14 text-center shadow-card">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                                <Send size={22} />
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-ink-900">No applications yet</h2>
                            <p className="mt-2 text-sm text-ink-500">
                                When you apply to a verified role, it&apos;ll show up here so you can track every update.
                            </p>
                            <Link
                                href="/discover"
                                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                            >
                                <Sparkles size={15} />
                                Browse verified jobs
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <StatCard
                                    icon={<Send size={16} />}
                                    label="Applied"
                                    value={stats.total}
                                    hint={stats.appliedThisWeek > 0 ? `+${stats.appliedThisWeek} this week` : "No new this week"}
                                    hintPositive={stats.appliedThisWeek > 0}
                                />
                                <StatCard
                                    icon={<Eye size={16} />}
                                    label="Viewed by employer"
                                    value={stats.viewed}
                                    hint={`${stats.viewRate}% view rate`}
                                    hintPositive={stats.viewRate > 0}
                                />
                                <StatCard
                                    icon={<CheckCircle2 size={16} />}
                                    label="Shortlisted"
                                    value={stats.shortlisted}
                                    valueTone={stats.shortlisted > 0 ? "success" : "default"}
                                    hint={
                                        stats.interviews > 0
                                            ? `${stats.interviews} interview${stats.interviews === 1 ? "" : "s"} scheduled`
                                            : `of ${stats.total} applications`
                                    }
                                    hintPositive={stats.interviews > 0}
                                />
                                <StatCard
                                    icon={<Clock3 size={16} />}
                                    label="Awaiting reply"
                                    value={stats.awaiting}
                                    valueTone={stats.awaiting > 0 ? "warning" : "default"}
                                    hint={stats.awaiting > 0 ? `Avg ${stats.avgWaitingDays}d waiting` : "All caught up"}
                                />
                            </div>

                            <div className="mt-6">
                                <ApplicationsTable applications={applications} />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

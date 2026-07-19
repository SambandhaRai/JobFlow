import Link from "next/link";
import { cookies } from "next/headers";
import { AlertCircle, Flag, ShieldCheck } from "lucide-react";

import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";
import ReportCard from "./_components/ReportCard";
import { fetchReportsData, type ReportsUser } from "./_components/reportsData";

export const dynamic = "force-dynamic";

const parseUserCookie = (value?: string): ReportsUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as ReportsUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as ReportsUser;
        } catch {
            return null;
        }
    }
};

const getProfileCompletion = (user: ReportsUser | null) => {
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

export default async function ReportsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const cookieUser = parseUserCookie(cookieStore.get("user_data")?.value);

    const { reports, stats, user: fetchedUser, error } = await fetchReportsData(token);
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

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">My reports</h1>
                        {stats.total > 0 && (
                            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-sm font-medium text-ink-600">
                                {stats.total} total
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                        Listings you flagged, and what our team decided. Reports stay private from employers.
                    </p>

                    {stats.total > 0 && (
                        <div className="mt-5 flex flex-wrap gap-3">
                            <div className="rounded-lg border border-ink-100 bg-surface px-4 py-3 shadow-card">
                                <p className="text-xs uppercase tracking-wide text-ink-400">Under review</p>
                                <p className="mt-0.5 text-xl font-semibold text-ink-900">{stats.open}</p>
                            </div>
                            <div className="rounded-lg border border-ink-100 bg-surface px-4 py-3 shadow-card">
                                <p className="text-xs uppercase tracking-wide text-ink-400">Resolved</p>
                                <p className="mt-0.5 text-xl font-semibold text-ink-900">{stats.resolved}</p>
                            </div>
                        </div>
                    )}

                    {error ? (
                        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-danger-500/30 bg-danger-50 px-6 py-12 text-center">
                            <AlertCircle size={22} className="text-danger-500" aria-hidden="true" />
                            <p className="text-sm font-medium text-danger-700">Could not load your reports</p>
                            <p className="max-w-sm text-sm text-ink-600">{error}</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-ink-100 bg-surface px-6 py-16 text-center shadow-card">
                            <ShieldCheck size={22} className="text-ink-400" aria-hidden="true" />
                            <p className="text-sm font-medium text-ink-900">You haven&apos;t reported anything</p>
                            <p className="max-w-sm text-sm text-ink-500">
                                If a listing looks like a scam or asks you for money, use the
                                {" "}
                                <span className="inline-flex items-center gap-1 font-medium text-ink-700">
                                    <Flag size={12} aria-hidden="true" />
                                    Report listing
                                </span>
                                {" "}
                                button on the job page. We review every report within 24 hours.
                            </p>
                            <Link
                                href="/discover"
                                className="mt-2 text-sm font-medium text-cobalt-500 transition-colors hover:text-cobalt-700"
                            >
                                Browse jobs
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-5 space-y-3">
                            {reports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </ul>
                    )}
                </main>
            </div>
        </div>
    );
}

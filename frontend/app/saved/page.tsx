import { cookies } from "next/headers";
import { AlertCircle } from "lucide-react";

import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";
import SavedJobsList from "./_components/SavedJobsList";
import { fetchSavedJobsData, type SavedUser } from "./_components/savedData";

export const dynamic = "force-dynamic";

const parseUserCookie = (value?: string): SavedUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as SavedUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as SavedUser;
        } catch {
            return null;
        }
    }
};

const getProfileCompletion = (user: SavedUser | null) => {
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

export default async function SavedJobsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const cookieUser = parseUserCookie(cookieStore.get("user_data")?.value);

    const { jobs, user: fetchedUser, error } = await fetchSavedJobsData(token);
    const user = fetchedUser ?? cookieUser;
    const fullName = user?.fullName ?? "Job seeker";

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={{ name: fullName, subtitle: user?.email ?? "Student" }}
                profileCompletion={getProfileCompletion(user)}
            />

            <div className="min-h-screen transition-[padding] duration-200 lg:pl-(--app-sidebar-width,232px)">
                <TopBar userName={fullName} />

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Saved jobs</h1>
                        {jobs.length > 0 && (
                            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-sm font-medium text-ink-600">
                                {jobs.length} saved
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                        Roles you bookmarked, ready when you are. Unsave anything you&apos;re no longer chasing.
                    </p>

                    {error ? (
                        <div className="mt-6 flex gap-3 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-4 text-sm text-danger-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">Could not load your saved jobs.</p>
                                <p className="mt-1 text-danger-700/80">{error}</p>
                            </div>
                        </div>
                    ) : (
                        <SavedJobsList jobs={jobs} />
                    )}
                </main>
            </div>
        </div>
    );
}

import { cookies } from "next/headers";
import type { Metadata } from "next";
import { AlertCircle, MapPin } from "lucide-react";

import ScrollToTop from "../../_components/ScrollToTop";
import Sidebar from "../../_components/Sidebar";
import TopBar from "../../_components/TopBar";
import {
    fetchProfileUser,
    getProfileCompletion,
    mapProfile,
    parseUserCookie,
} from "../_components/profileData";
import ResumeEditor from "./_components/ResumeEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Resume Creator | JobFlow",
    description: "Create a professional resume from your JobFlow profile.",
};

export default async function ResumePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const cookieUser = parseUserCookie(cookieStore.get("user_data")?.value);
    const { user: fetchedUser, error } = await fetchProfileUser(token);
    const rawUser = fetchedUser ?? cookieUser;
    const profile = rawUser ? mapProfile(rawUser) : null;
    const completion = getProfileCompletion(profile);
    const displayName = profile?.fullName.trim() || "Job seeker";

    return (
        <div className="min-h-screen bg-background">
            <ScrollToTop trigger="resume" />

            <div>
                <Sidebar
                    user={{ name: displayName, subtitle: profile?.email || "Student" }}
                    profileCompletion={{ percent: completion.percent, hint: completion.hint }}
                />
            </div>

            <div className="min-h-screen transition-[padding] duration-200 lg:pl-(--app-sidebar-width,232px)">
                <div>
                    <TopBar userName={displayName} />
                </div>

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    {profile ? (
                        <ResumeEditor profile={profile} />
                    ) : (
                        <>
                            <div className="mx-auto mb-6 max-w-[210mm]">
                                <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Resume creator</h1>
                                <p className="mt-1 text-sm text-ink-500">
                                    This résumé stays in sync with the information in your profile.
                                </p>
                            </div>
                            {error ? (
                                <div className="mx-auto flex max-w-[210mm] gap-3 rounded-lg border border-danger-500/30 bg-danger-50 px-4 py-4 text-sm text-danger-700">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">Could not create your résumé.</p>
                                        <p className="mt-1 text-danger-700/80">{error}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mx-auto max-w-[210mm] rounded-lg border border-ink-200 bg-surface p-6 text-center">
                                    <MapPin size={20} className="mx-auto text-ink-400" />
                                    <p className="mt-3 text-sm font-medium text-ink-900">Sign in to create your résumé.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

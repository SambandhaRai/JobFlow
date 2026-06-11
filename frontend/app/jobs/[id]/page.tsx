import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import ScrollToTop from "../../_components/ScrollToTop";
import AtAGlanceSection from "./_components/AtAGlanceSection";
import DetailShell from "./_components/DetailShell";
import ErrorState from "./_components/ErrorState";
import JobBreadcrumbs from "./_components/JobBreadcrumbs";
import JobHero from "./_components/JobHero";
import MatchPanel from "./_components/MatchPanel";
import RoleDetailsSection from "./_components/RoleDetailsSection";
import SkillsSection from "./_components/SkillsSection";
import {
    fetchJobDetailsData,
    getApplicantDefaults,
    getApplicantResumes,
    isNotFoundError,
    toApplyJob,
    type JobDetailsUser,
} from "./_components/jobDetailsData";

export const dynamic = "force-dynamic";

interface JobDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

const parseUserCookie = (value?: string): JobDetailsUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as JobDetailsUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as JobDetailsUser;
        } catch {
            return null;
        }
    }
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    const cookieUser = parseUserCookie(cookieStore.get("user_data")?.value);

    let data;
    try {
        data = await fetchJobDetailsData(id, token);
    } catch (error) {
        if (isNotFoundError(error)) notFound();

        const message = error instanceof Error ? error.message : "The backend did not return this job.";
        return (
            <DetailShell user={cookieUser}>
                <ErrorState message={message} />
            </DetailShell>
        );
    }

    const { job, match, isSaved, hasApplied } = data;
    const user = data.user ?? cookieUser;
    const applicantDefaults = getApplicantDefaults(user);
    const resumes = getApplicantResumes(user);

    return (
        <DetailShell user={user}>
            <ScrollToTop trigger={job.id} />
            <main className="px-4 py-5 sm:px-6 sm:py-6">
                <JobBreadcrumbs job={job} />

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="min-w-0 space-y-5">
                        <JobHero
                            job={job}
                            isSaved={isSaved}
                            hasApplied={hasApplied}
                            applyJob={toApplyJob(job)}
                            applicantDefaults={applicantDefaults}
                            resumes={resumes}
                        />
                        <AtAGlanceSection job={job} />
                        <RoleDetailsSection job={job} />
                        <SkillsSection job={job} match={match} />
                    </div>

                    <MatchPanel
                        job={job}
                        match={match}
                        applicantDefaults={applicantDefaults}
                        resumes={resumes}
                        hasApplied={hasApplied}
                    />
                </div>
            </main>
        </DetailShell>
    );
}

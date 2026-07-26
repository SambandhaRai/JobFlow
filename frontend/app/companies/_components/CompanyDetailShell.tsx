import type { ReactNode } from "react";

import Footer from "../../(public)/_components/Footer";
import Navbar from "../../(public)/_components/Navbar";
import DetailShell from "../../jobs/[id]/_components/DetailShell";
import type { JobDetailsUser } from "../../jobs/[id]/_components/jobDetailsData";

interface CompanyDetailShellProps {
    user: JobDetailsUser | null;
    children: ReactNode;
}

/**
 * Company profiles are public, so anonymous visitors get the marketing chrome.
 * Signed-in job seekers keep the app sidebar they navigated in with.
 */
export default function CompanyDetailShell({ user, children }: CompanyDetailShellProps) {
    if (user) {
        return <DetailShell user={user}>{children}</DetailShell>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="mx-auto max-w-5xl">{children}</div>
            <Footer />
        </div>
    );
}

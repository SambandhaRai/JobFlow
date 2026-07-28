import type { Metadata } from "next";
import { cookies } from "next/headers";

import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";
import HelpCentreContent from "./_components/HelpCentreContent";

export const metadata: Metadata = {
    title: "Help Centre | JobFlow",
    description: "Get help using JobFlow's job-seeker features.",
};

type HelpUser = {
    fullName?: string;
    email?: string;
};

const parseUserCookie = (value?: string): HelpUser | null => {
    if (!value) return null;

    try {
        return JSON.parse(value) as HelpUser;
    } catch {
        try {
            return JSON.parse(decodeURIComponent(value)) as HelpUser;
        } catch {
            return null;
        }
    }
};

export default async function HelpPage() {
    const cookieStore = await cookies();
    const user = parseUserCookie(cookieStore.get("user_data")?.value);
    const fullName = user?.fullName?.trim() || "Job seeker";

    return (
        <div className="min-h-screen bg-background">
            <Sidebar user={{ name: fullName, subtitle: user?.email ?? "Student" }} />

            <div className="min-h-screen transition-[padding] duration-200 lg:pl-(--app-sidebar-width,232px)">
                <TopBar userName={fullName} />

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    <HelpCentreContent />
                </main>
            </div>
        </div>
    );
}

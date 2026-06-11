import type { ReactNode } from "react";

import Sidebar from "../../../_components/Sidebar";
import TopBar from "../../../_components/TopBar";
import { getProfileCompletion, type JobDetailsUser } from "./jobDetailsData";

const getUserName = (user: JobDetailsUser | null) => user?.fullName ?? "Job seeker";

interface DetailShellProps {
    user: JobDetailsUser | null;
    children: ReactNode;
}

export default function DetailShell({ user, children }: DetailShellProps) {
    const fullName = getUserName(user);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={{ name: fullName, subtitle: user?.email ?? "Student" }}
                profileCompletion={getProfileCompletion(user)}
            />

            <div className="min-h-screen transition-[padding] duration-200 lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar userName={fullName} notificationCount={1} />
                {children}
            </div>
        </div>
    );
}

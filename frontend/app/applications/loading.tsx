import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";

export default function ApplicationsLoading() {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={{ name: "Job seeker", subtitle: "Loading profile" }}
                profileCompletion={{ percent: 30, hint: "Loading your profile." }}
            />

            <div className="min-h-screen lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar userName="Job seeker" />

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    <div className="h-7 w-56 rounded bg-ink-100" />
                    <div className="mt-2 h-4 w-80 rounded bg-ink-50" />

                    {/* Stats */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card">
                                <div className="h-4 w-28 rounded bg-ink-100" />
                                <div className="mt-3 h-8 w-12 rounded bg-ink-100" />
                                <div className="mt-3 h-3 w-24 rounded bg-ink-50" />
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="mt-6 flex gap-3 border-b border-ink-100 pb-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="h-6 w-20 rounded bg-ink-100" />
                        ))}
                    </div>

                    {/* Table */}
                    <div className="mt-4 overflow-hidden rounded-lg border border-ink-100 bg-surface shadow-card">
                        <div className="divide-y divide-ink-100">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-3 px-5 py-4">
                                    <div className="h-10 w-10 shrink-0 rounded-md bg-ink-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-48 rounded bg-ink-100" />
                                        <div className="h-3 w-28 rounded bg-ink-50" />
                                    </div>
                                    <div className="hidden h-6 w-32 rounded-full bg-ink-50 md:block" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

import Sidebar from "../../_components/Sidebar";
import TopBar from "../../_components/TopBar";

export default function JobDetailsLoading() {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={{ name: "Job seeker", subtitle: "Loading profile" }}
                profileCompletion={{ percent: 30, hint: "Loading your profile." }}
            />

            <div className="min-h-screen lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar userName="Job seeker" />

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    <div className="h-4 w-64 rounded bg-ink-100" />

                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0 space-y-5">
                            <div className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card sm:p-6">
                                <div className="flex gap-5">
                                    <div className="h-16 w-16 shrink-0 rounded-lg bg-ink-100" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-40 rounded bg-ink-100" />
                                        <div className="h-7 w-2/3 rounded bg-ink-100" />
                                        <div className="h-4 w-52 rounded bg-ink-100" />
                                        <div className="flex gap-3 pt-2">
                                            <div className="h-10 w-32 rounded-md bg-ink-100" />
                                            <div className="h-10 w-24 rounded-md bg-ink-50" />
                                            <div className="h-10 w-24 rounded-md bg-ink-50" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-20 rounded-lg border border-ink-100 bg-surface" />
                                ))}
                            </div>

                            {Array.from({ length: 2 }).map((_, index) => (
                                <div key={index} className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card sm:p-6">
                                    <div className="h-5 w-40 rounded bg-ink-100" />
                                    <div className="mt-4 space-y-2">
                                        <div className="h-4 w-full rounded bg-ink-50" />
                                        <div className="h-4 w-11/12 rounded bg-ink-50" />
                                        <div className="h-4 w-3/4 rounded bg-ink-50" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="h-56 rounded-lg border border-ink-100 bg-surface" />
                            <div className="h-48 rounded-lg border border-ink-100 bg-surface" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

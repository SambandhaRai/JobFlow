import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";

export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={{ name: "Job seeker", subtitle: "Loading profile" }}
                profileCompletion={{ percent: 30, hint: "Loading your profile." }}
            />

            <div className="min-h-screen lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar userName="Job seeker" />

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    <div className="h-7 w-40 rounded bg-ink-100" />
                    <div className="mt-2 h-4 w-72 rounded bg-ink-50" />

                    <div className="mt-6 overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-card">
                        <div className="h-28 bg-ink-100 sm:h-32" />
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                            <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
                                <div className="h-24 w-24 shrink-0 rounded-2xl bg-ink-200 ring-4 ring-surface" />
                                <div className="flex-1 space-y-2 pb-1">
                                    <div className="h-5 w-44 rounded bg-ink-100" />
                                    <div className="h-4 w-60 rounded bg-ink-50" />
                                </div>
                            </div>
                            <div className="mt-5 grid grid-cols-3 gap-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="h-16 rounded-lg bg-ink-50" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-5">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="rounded-xl border border-ink-100 bg-surface p-5 shadow-card sm:p-6">
                                <div className="h-5 w-36 rounded bg-ink-100" />
                                <div className="mt-4 space-y-2">
                                    <div className="h-4 w-full rounded bg-ink-50" />
                                    <div className="h-4 w-2/3 rounded bg-ink-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

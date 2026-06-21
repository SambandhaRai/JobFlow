import Sidebar from "../_components/Sidebar";
import TopBar from "../_components/TopBar";

function SkeletonCard() {
    return (
        <div className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card">
            <div className="flex gap-4">
                <div className="h-12 w-12 rounded-md bg-ink-100" />
                <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <div className="h-4 w-32 rounded bg-ink-100" />
                        <div className="h-6 w-2/3 rounded bg-ink-100" />
                        <div className="h-4 w-44 rounded bg-ink-100" />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                        <div className="h-10 rounded-md bg-ink-50" />
                        <div className="h-10 rounded-md bg-ink-50" />
                        <div className="h-10 rounded-md bg-ink-50" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DiscoverLoading() {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={{ name: "Job seeker", subtitle: "Loading profile" }}
                profileCompletion={{ percent: 30, hint: "Loading your profile." }}
            />
            <div className="min-h-screen lg:pl-[var(--app-sidebar-width,232px)]">
                <TopBar userName="Job seeker" />
                <main className="grid gap-5 px-4 py-5 sm:px-6 sm:py-6 xl:grid-cols-[var(--discover-filter-width,260px)_minmax(0,1fr)]">
                    <div className="hidden rounded-lg border border-ink-100 bg-surface p-4 shadow-card xl:block">
                        <div className="mb-4 h-8 w-24 rounded bg-ink-100" />
                        <div className="space-y-3">
                            {Array.from({ length: 9 }).map((_, index) => (
                                <div key={index} className="h-8 rounded-md bg-ink-50" />
                            ))}
                        </div>
                    </div>
                    <section className="space-y-5">
                        <div className="h-24 rounded-lg border border-cobalt-100 bg-cobalt-50" />
                        {Array.from({ length: 4 }).map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </section>
                </main>
            </div>
        </div>
    );
}

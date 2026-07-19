export default function CompaniesLoading() {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-ink-100 bg-surface">
                <div className="mx-auto max-w-6xl animate-pulse px-6 py-10 sm:py-14">
                    <div className="h-6 w-36 rounded-full bg-ink-100" />
                    <div className="mt-4 h-9 w-80 max-w-full rounded bg-ink-100" />
                    <div className="mt-3 h-4 w-96 max-w-full rounded bg-ink-50" />
                    <div className="mt-7 flex gap-8">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <div className="h-3 w-20 rounded bg-ink-50" />
                                <div className="h-6 w-10 rounded bg-ink-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="h-10 w-full animate-pulse rounded-md bg-ink-100" />
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-lg border border-ink-100 bg-surface p-5 shadow-card"
                        >
                            <div className="flex gap-3">
                                <div className="h-12 w-12 shrink-0 rounded-md bg-ink-100" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 rounded bg-ink-100" />
                                    <div className="h-3 w-24 rounded bg-ink-50" />
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-3 w-full rounded bg-ink-50" />
                                <div className="h-3 w-4/5 rounded bg-ink-50" />
                            </div>
                            <div className="mt-5 h-3 w-40 rounded bg-ink-50" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

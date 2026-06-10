import { Pencil } from "lucide-react";

interface WelcomeBannerProps {
    firstName: string;
}

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

export default function WelcomeBanner({ firstName }: WelcomeBannerProps) {
    return (
        <section className="rounded-lg border border-cobalt-100 bg-cobalt-50 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="font-display text-2xl font-semibold tracking-tight text-cobalt-600">
                        {getGreeting()}, {firstName} 👋
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-ink-200 bg-surface px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
                >
                    <Pencil size={15} />
                    Edit preferences
                </button>
            </div>
        </section>
    );
}

import Link from "next/link";
import { SearchX } from "lucide-react";

export default function JobNotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-lg border border-ink-100 bg-surface p-8 text-center shadow-card">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-ink-50 text-ink-400">
                    <SearchX size={22} />
                </div>
                <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink-900">
                    This job isn&apos;t available
                </h1>
                <p className="mt-2 text-sm text-ink-500">
                    It may have been filled or removed. Browse other verified roles instead.
                </p>
                <Link
                    href="/discover"
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                >
                    Back to discover
                </Link>
            </div>
        </main>
    );
}

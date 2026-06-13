import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function CompanyErrorState({ message }: { message: string }) {
    return (
        <main className="px-4 py-6 sm:px-6">
            <div className="rounded-lg border border-danger-500/30 bg-danger-50 px-5 py-4 text-danger-700">
                <div className="flex gap-3">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <h1 className="text-base font-semibold">Could not load this company</h1>
                        <p className="mt-1 text-sm text-danger-700/80">{message}</p>
                        <Link
                            href="/discover"
                            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-danger-500 px-4 text-sm font-medium text-white transition-colors hover:bg-danger-700"
                        >
                            Back to discover
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

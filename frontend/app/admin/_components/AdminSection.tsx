import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface AdminSectionProps {
    title: string;
    count: number;
    error: string | null;
    children: ReactNode;
}

export default function AdminSection({ title, count, error, children }: AdminSectionProps) {
    return (
        <section>
            <h1 className="text-lg font-semibold text-ink-900">
                {title} <span className="font-normal text-ink-400">({count})</span>
            </h1>

            {error && (
                <div className="mt-3 flex gap-2 rounded-md border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="mt-4">{children}</div>
        </section>
    );
}

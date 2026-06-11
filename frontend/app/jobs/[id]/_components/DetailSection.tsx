import type { ReactNode } from "react";

interface DetailSectionProps {
    title: string;
    children: ReactNode;
}

export default function DetailSection({ title, children }: DetailSectionProps) {
    return (
        <section className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

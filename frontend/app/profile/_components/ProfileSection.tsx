import type { ReactNode } from "react";

interface ProfileSectionProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
}

export default function ProfileSection({ title, description, icon, action, children }: ProfileSectionProps) {
    return (
        <section className="rounded-xl border border-ink-100 bg-surface p-5 shadow-card transition-shadow hover:shadow-popover sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    {icon && (
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cobalt-50 text-cobalt-600">
                            {icon}
                        </span>
                    )}
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-ink-900">{title}</h2>
                        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
                    </div>
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>

            <div className="mt-5">{children}</div>
        </section>
    );
}

import { TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

type ValueTone = "default" | "success" | "warning";

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: number | string;
    valueTone?: ValueTone;
    hint?: string;
    hintPositive?: boolean;
}

const valueToneStyles: Record<ValueTone, string> = {
    default: "text-ink-900",
    success: "text-success-700",
    warning: "text-warning-700",
};

export default function StatCard({
    icon,
    label,
    value,
    valueTone = "default",
    hint,
    hintPositive = false,
}: StatCardProps) {
    return (
        <div className="rounded-lg border border-ink-100 bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-500">
                <span className="text-ink-400">{icon}</span>
                {label}
            </div>
            <p className={`mt-3 text-3xl font-semibold tracking-tight ${valueToneStyles[valueTone]}`}>
                {value}
            </p>
            {hint && (
                <p className={`mt-2 inline-flex items-center gap-1 text-xs ${hintPositive ? "text-success-700" : "text-ink-500"}`}>
                    {hintPositive && <TrendingUp size={13} />}
                    {hint}
                </p>
            )}
        </div>
    );
}

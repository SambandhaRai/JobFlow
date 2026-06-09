import { X } from "lucide-react";

interface SkillTagProps {
    label: string;
    required?: boolean;
    onRemove?: () => void;
    className?: string;
}

export default function SkillTag({ label, required = false, onRemove, className = "" }: SkillTagProps) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-ink-50 text-ink-700 border border-ink-200",
                className,
            ].join(" ")}
        >
            {label}
            {required && (
                <span className="text-cobalt-500 ml-0.5">*</span>
            )}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 text-ink-400 hover:text-ink-700 transition-colors"
                    aria-label={`Remove ${label}`}
                >
                    <X size={11} strokeWidth={2.5} />
                </button>
            )}
        </span>
    );
}

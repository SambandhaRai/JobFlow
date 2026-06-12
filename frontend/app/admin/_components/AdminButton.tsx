import type { ButtonHTMLAttributes } from "react";

const tones = {
    verify: "border-cobalt-200 text-cobalt-700 hover:bg-cobalt-50",
    edit: "border-ink-200 text-ink-700 hover:bg-ink-50",
    delete: "border-danger-500/30 text-danger-700 hover:bg-danger-50",
    primary: "border-cobalt-500 bg-cobalt-500 text-white hover:bg-cobalt-600",
};

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    tone: keyof typeof tones;
}

export default function AdminButton({ tone, className = "", ...props }: AdminButtonProps) {
    return (
        <button
            {...props}
            className={[
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                tones[tone],
                className,
            ].join(" ")}
        />
    );
}

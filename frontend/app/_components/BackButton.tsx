"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    fallbackHref?: string;
    label?: string;
    className?: string;
}

export default function BackButton({
    fallbackHref = "/",
    label = "Back",
    className = "",
}: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackHref);
        }
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className={[
                "inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-800",
                className,
            ].join(" ")}
        >
            <ArrowLeft size={16} />
            {label}
        </button>
    );
}

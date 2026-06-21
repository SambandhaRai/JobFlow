import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface AppliedButtonProps {
    className?: string;
}

export default function AppliedButton({ className = "" }: AppliedButtonProps) {
    return (
        <Link
            href="/applications"
            className={[
                "inline-flex items-center justify-center gap-2 rounded-md border border-success-500/30 bg-success-50 text-sm font-medium text-success-700 transition-colors hover:border-success-500/50",
                className,
            ].join(" ")}
            title="You've already applied to this job"
        >
            <CheckCircle2 size={15} />
            Already applied · View status
        </Link>
    );
}

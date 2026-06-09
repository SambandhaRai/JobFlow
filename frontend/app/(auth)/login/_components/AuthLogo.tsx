import Link from "next/link";

interface AuthLogoProps {
    inverted?: boolean;
    className?: string;
}

export default function AuthLogo({ inverted = false, className = "" }: AuthLogoProps) {
    return (
        <Link href="/" className={["flex items-center gap-2", className].join(" ")}>
            <div
                className={[
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-display",
                    inverted
                        ? "bg-white/20 text-white"
                        : "bg-cobalt-500 text-white",
                ].join(" ")}
            >
                JF
            </div>
            <span
                className={[
                    "font-semibold font-display tracking-tight",
                    inverted ? "text-white" : "text-ink-900",
                ].join(" ")}
            >
                JobFlow
            </span>
        </Link>
    );
}

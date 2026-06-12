import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import AuthLogo from "../../login/_components/AuthLogo";

const stats = [
    { value: "12,400+", label: "active candidates" },
    { value: "4.8", label: "average rating" },
    { value: "200+", label: "partner colleges" },
];

interface LeftPanelProps {
    eyebrow: string;
    heading: string;
    body: string;
    variant?: "login" | "signup";
}

export default function LeftPanel({ eyebrow, heading, body, variant = "login" }: LeftPanelProps) {
    return (
        <aside className="hidden lg:flex flex-col w-1/2 bg-cobalt-500 relative overflow-hidden">
            <Image
                src="/images/login-left.png"
                alt=""
                fill
                priority
                sizes="50vw"
                className="object-cover"
            />
            <div className="absolute inset-0 bg-cobalt-900/35 pointer-events-none" />
            <div className="absolute inset-0 bg-linear-to-br from-cobalt-900/80 via-cobalt-700/35 to-ink-900/70 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink-900/85 to-transparent pointer-events-none" />

            {/* Logo */}
            <div className="relative z-10 p-10">
                <AuthLogo inverted />
            </div>

            <div className="relative z-10 flex-1 flex items-end px-12 pb-10">
                <div className="max-w-md">
                    <p className="text-white/70 text-sm font-medium mb-3">{eyebrow}</p>
                    <h1 className="text-white text-5xl font-display font-bold leading-none tracking-tight">
                        {heading}
                    </h1>
                    <p className="text-white/75 text-base leading-relaxed mt-5 max-w-sm">
                        {body}
                    </p>
                </div>
            </div>

            {variant === "login" ? (
                /* Stats */
                <div className="relative z-10 border-t border-white/20 px-12 py-8 grid grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <p className="text-white text-xl font-bold font-display tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative z-10 px-12 pb-10">
                    <Link
                        href="/login"
                        className="flex w-full flex-col rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                    >
                        <span className="text-xs font-mono text-white/65 mb-1">
                            Looking for a job?
                        </span>
                        <span className="text-sm font-semibold">
                            Sign in as a job seeker -&gt;
                        </span>
                    </Link>
                </div>
            )}

            {/* Verified badge */}
            <div className="absolute top-8 right-8 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                    <Check size={10} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="text-white text-xs font-medium">Verified student talent</span>
            </div>
        </aside>
    );
}

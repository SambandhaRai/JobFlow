import Link from "next/link";
import { ArrowRight } from "lucide-react";

const navLinks = [
    { href: "/discover", label: "Find jobs" },
    { href: "/companies", label: "Companies" },
    { href: "/career-guide", label: "Career guide" },
    { href: "/employers", label: "For employers" },
];

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-30 bg-surface border-b border-ink-100">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-cobalt-500 flex items-center justify-center text-white text-xs font-bold font-display">
                        JF
                    </div>
                    <span className="font-semibold text-ink-900 font-display tracking-tight">
                        JobFlow
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm text-ink-600">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="hover:text-ink-900 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/sign-up"
                        className="h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-sm bg-cobalt-500 text-sm font-medium text-white hover:bg-cobalt-600 active:bg-cobalt-700 transition-colors"
                    >
                        Get started
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

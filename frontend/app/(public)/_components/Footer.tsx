import Link from "next/link";

const footerLinks = ["About", "Trust & safety", "Help center", "Privacy"];

export default function Footer() {
    return (
        <footer className="border-t border-ink-100 bg-surface py-8">
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-cobalt-500 flex items-center justify-center text-white text-[10px] font-bold font-display">
                        JF
                    </div>
                    <span className="text-sm font-semibold text-ink-700 font-display">JobFlow</span>
                    <span className="text-xs text-ink-400 ml-1">2026 JobFlow Nepal, Kathmandu</span>
                </div>
                <div className="flex flex-wrap items-center gap-5 text-xs text-ink-500">
                    {footerLinks.map((link) => (
                        <Link key={link} href="#" className="hover:text-ink-800 transition-colors">
                            {link}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}

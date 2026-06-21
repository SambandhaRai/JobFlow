"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/employers", label: "Employers" },
    { href: "/admin/companies", label: "Companies" },
    { href: "/admin/reports", label: "Reports" },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap gap-1 border-b border-ink-200">
            {TABS.map((tab) => {
                const active = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={[
                            "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                            active
                                ? "border-cobalt-500 text-cobalt-700"
                                : "border-transparent text-ink-500 hover:text-ink-800",
                        ].join(" ")}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}

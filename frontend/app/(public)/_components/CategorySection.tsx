import Link from "next/link";
import {
    BarChart3,
    Code2,
    Handshake,
    Headphones,
    Megaphone,
    Palette,
    PenLine,
    Settings2,
} from "lucide-react";

const categories = [
    { icon: Code2, name: "Tech & Engineering", count: 412 },
    { icon: Palette, name: "Design & Creative", count: 168 },
    { icon: BarChart3, name: "Data & Analytics", count: 94 },
    { icon: Megaphone, name: "Marketing & Growth", count: 233 },
    { icon: PenLine, name: "Writing & Content", count: 87 },
    { icon: Settings2, name: "Business & Ops", count: 156 },
    { icon: Headphones, name: "Customer Success", count: 79 },
    { icon: Handshake, name: "Sales & BD", count: 142 },
];

export default function CategorySection() {
    return (
        <section className="py-20 bg-surface">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-widest text-cobalt-500 mb-2">
                        Browse by category
                    </p>
                    <h2 className="text-3xl font-display font-bold text-ink-900 tracking-tight">
                        1,371 open roles, updated hourly
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <Link
                                key={category.name}
                                href={`/discover?category=${encodeURIComponent(category.name)}`}
                                className="group p-4 rounded-lg border border-ink-100 bg-surface hover:border-cobalt-300 hover:shadow-card transition-all"
                            >
                                <span className="w-10 h-10 rounded-md bg-cobalt-50 text-cobalt-600 flex items-center justify-center mb-3">
                                    <Icon size={18} />
                                </span>
                                <p className="text-sm font-semibold text-ink-800 mb-0.5 group-hover:text-cobalt-600 transition-colors">
                                    {category.name}
                                </p>
                                <p className="text-xs text-ink-400">{category.count} open roles</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

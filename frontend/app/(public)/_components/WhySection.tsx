import { Check, DollarSign, Shield, Zap } from "lucide-react";

const features = [
    {
        icon: Check,
        title: "Every employer verified",
        description: "We check business registration before any listing goes live.",
    },
    {
        icon: DollarSign,
        title: "Salary always shown",
        description: "No hidden ranges. You see numbers up front.",
    },
    {
        icon: Zap,
        title: "Apply in 60 seconds",
        description: "One resume, one click. Auto-filled forms with no back-and-forth.",
    },
    {
        icon: Shield,
        title: "Report scams easily",
        description: "Suspicious post? Flag it and our team reviews within 24 hours.",
    },
];

export default function WhySection() {
    return (
        <section className="py-20 bg-surface">
            <div className="max-w-6xl mx-auto px-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-cobalt-500 mb-3">
                    Why JobFlow
                </p>
                <h2 className="text-3xl font-display font-bold text-ink-900 tracking-tight mb-12 max-w-sm">
                    Built for trust, speed, and your first real opportunity.
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="p-5 rounded-lg border border-ink-100 bg-surface hover:shadow-card transition-shadow"
                            >
                                <div className="w-9 h-9 rounded-md bg-cobalt-50 flex items-center justify-center mb-4">
                                    <Icon size={18} className="text-cobalt-500" />
                                </div>
                                <p className="text-sm font-semibold text-ink-900 mb-1.5">
                                    {feature.title}
                                </p>
                                <p className="text-xs text-ink-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

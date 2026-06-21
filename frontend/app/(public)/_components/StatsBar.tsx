const stats = [
    { value: "12,400+", label: "students from 200+ colleges" },
    { value: "1,800+", label: "verified employers" },
    { value: "58 sec", label: "average time to apply" },
];

export default function StatsBar() {
    return (
        <section className="bg-ink-50 border-y border-ink-100 py-12">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-ink-200 gap-8 sm:gap-0">
                {stats.map((stat) => (
                    <div key={stat.label} className="text-center px-8">
                        <p className="text-3xl font-bold font-display text-ink-900 tracking-tight mb-1">
                            {stat.value}
                        </p>
                        <p className="text-sm text-ink-500">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

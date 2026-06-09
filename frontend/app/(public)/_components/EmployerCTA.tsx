import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EmployerCTA() {
    return (
        <section className="py-16 bg-surface">
            <div className="max-w-6xl mx-auto px-6">
                <div className="rounded-xl bg-cobalt-500 px-10 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white tracking-tight mb-2">
                            Hiring entry-level talent in Nepal?
                        </h2>
                        <p className="text-sm text-cobalt-100 max-w-md leading-relaxed">
                            Post a verified listing in 5 minutes. Reach 12,000+ active student applicants
                            from top colleges across Kathmandu, Lalitpur, and Pokhara.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            href="/employers/pricing"
                            className="h-10 px-4 inline-flex items-center justify-center rounded-md border border-white/40 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                        >
                            See pricing
                        </Link>
                        <Link
                            href="/employers/post-job"
                            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white text-sm font-medium text-cobalt-600 hover:bg-cobalt-50 transition-colors"
                        >
                            Post a job
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

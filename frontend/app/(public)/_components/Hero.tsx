import Link from "next/link";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";

import Button from "../../_components/Button";
import FloatingJobCard from "./FloatingJobCard";

const popularTags = ["Internship", "No experience", "Remote", "Part-time", "Marketing"];

export default function Hero() {
    return (
        <section className="bg-surface pt-16 pb-20 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 flex items-center gap-12">
                <div className="flex-1 max-w-lg">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cobalt-50 border border-cobalt-200 text-xs font-medium text-cobalt-600 mb-6">
                        <Sparkles size={13} />
                        Built for students and fresh graduates in Nepal
                    </div>

                    <h1 className="text-[2.75rem] leading-[1.1] font-display font-bold tracking-[-0.03em] text-ink-900 mb-3">
                        Land your first real job{" "}
                        <span className="text-cobalt-500">without the runaround.</span>
                    </h1>

                    <p className="text-base text-ink-500 leading-relaxed mb-8">
                        Internships and entry-level roles from verified employers.
                        Salaries always shown. Apply in under 60 seconds with one resume.
                    </p>

                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                            <input
                                type="search"
                                placeholder="Job title, skill, or company"
                                className="w-full h-11 pl-9 pr-3 text-sm border border-ink-200 rounded-md outline-none focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100 transition-colors bg-surface"
                            />
                        </div>
                        <div className="relative">
                            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                            <input
                                type="text"
                                defaultValue="Kathmandu"
                                className="w-36 h-11 pl-8 pr-3 text-sm border border-ink-200 rounded-md outline-none focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100 transition-colors bg-surface"
                            />
                        </div>
                        <Button size="md" className="h-11 px-5 shrink-0" iconRight={<ArrowRight size={14} />}>
                            Search jobs
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-ink-400">Popular:</span>
                        {popularTags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/discover?q=${tag}`}
                                className="text-xs px-2.5 py-1 rounded-full border border-ink-200 text-ink-600 hover:border-cobalt-400 hover:text-cobalt-600 transition-colors bg-surface"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="hidden lg:block relative w-80 h-72 shrink-0">
                    <FloatingJobCard
                        company="Lumen Labs"
                        title="Frontend Intern"
                        tags={["No experience", "Remote"]}
                        salary="Rs 25,000/mo"
                        className="absolute top-0 right-0 rotate-[2deg]"
                    />
                    <FloatingJobCard
                        company="Sajilo Pay"
                        title="Marketing Associate"
                        tags={["Entry-level", "Full-time", "Lalitpur"]}
                        salary="Rs 35,000-45,000"
                        className="absolute top-24 right-4 rotate-[-1deg] shadow-modal"
                    />
                    <FloatingJobCard
                        company="North Loop Studio"
                        title="UX Research Asst."
                        tags={["Beginner", "Part-time", "Remote"]}
                        salary="Rs 600/hr"
                        className="absolute top-48 right-8 rotate-[1deg]"
                    />
                </div>
            </div>
        </section>
    );
}

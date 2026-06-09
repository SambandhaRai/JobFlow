import Link from "next/link";
import { ArrowRight } from "lucide-react";

import FeaturedJobCard, { type FeaturedJob } from "./FeaturedJobCard";

const jobs: FeaturedJob[] = [
    {
        company: "Lumen Labs",
        title: "Frontend Developer Intern",
        location: "Kathmandu",
        workMode: "Hybrid",
        jobType: "Internship",
        duration: "6 mo",
        skills: ["React", "TypeScript", "Tailwind", "No experience needed"],
        salary: "Rs 25,000/mo",
        postedAgo: "3h ago",
    },
    {
        company: "Sajilo Pay",
        title: "Marketing Associate",
        location: "Lalitpur",
        workMode: "On-site",
        jobType: "Full-time",
        skills: ["Social media", "Content", "Entry-level"],
        salary: "Rs 35,000-45,000",
        postedAgo: "1d ago",
    },
    {
        company: "North Loop Studio",
        title: "UX Research Assistant",
        location: "Pokhara",
        workMode: "Remote",
        jobType: "Part-time",
        duration: "20 hrs",
        skills: ["Figma", "Interviews", "No experience needed"],
        salary: "Rs 600/hr",
        postedAgo: "1h ago",
    },
    {
        company: "Himal Insights",
        title: "Data Analyst Trainee",
        location: "Kathmandu",
        workMode: "Hybrid",
        jobType: "Internship",
        duration: "4 mo",
        skills: ["SQL", "Excel", "Python", "Entry-level"],
        salary: "Rs 20,000/mo",
        postedAgo: "6h ago",
    },
];

export default function FeaturedSection() {
    return (
        <section className="py-20 bg-ink-50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-cobalt-500 mb-2">
                            This week
                        </p>
                        <h2 className="text-3xl font-display font-bold text-ink-900 tracking-tight">
                            Featured opportunities
                        </h2>
                    </div>
                    <Link
                        href="/discover"
                        className="text-sm font-medium text-cobalt-500 hover:text-cobalt-700 flex items-center gap-1 transition-colors"
                    >
                        Browse all jobs
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map((job) => (
                        <FeaturedJobCard key={job.title} job={job} />
                    ))}
                </div>
            </div>
        </section>
    );
}

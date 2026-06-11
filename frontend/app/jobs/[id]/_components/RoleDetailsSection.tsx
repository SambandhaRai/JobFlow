import DetailSection from "./DetailSection";
import type { JobDetails } from "./jobDetailsData";

function BulletList({
    items,
    positive = false,
}: {
    items: string[];
    positive?: boolean;
}) {
    if (items.length === 0) {
        return <p className="text-sm text-ink-400">Not listed by the employer.</p>;
    }

    return (
        <ul className="space-y-3 text-sm leading-6 text-ink-700">
            {items.map((item) => (
                <li key={item} className="flex gap-3">
                    <span className={positive ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success-500" : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300"} />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default function RoleDetailsSection({ job }: { job: JobDetails }) {
    return (
        <DetailSection title="About the role">
            <div className="space-y-4 text-sm leading-7 text-ink-700">
                {job.descriptionParagraphs.length > 0 ? (
                    job.descriptionParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))
                ) : (
                    <p>The employer has not added a detailed description yet.</p>
                )}
            </div>

            <div className="mt-7 grid gap-7 lg:grid-cols-2">
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-ink-900">What you will do</h3>
                    <BulletList items={job.responsibilities} />
                </div>
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-ink-900">What they are looking for</h3>
                    <BulletList items={job.requirements} positive={job.isBeginnerFriendly} />
                </div>
            </div>
        </DetailSection>
    );
}

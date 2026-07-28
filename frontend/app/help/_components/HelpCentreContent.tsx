"use client";

import {
    Bell,
    Bookmark,
    BriefcaseBusiness,
    ChevronDown,
    CircleHelp,
    FileSearch,
    FileText,
    Flag,
    Search,
    SearchX,
    ShieldCheck,
    UserRound,
    X,
    type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type HelpQuestion = {
    id: string;
    question: string;
    answer: React.ReactNode;
    searchText: string;
};

type HelpCategory = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    questions: HelpQuestion[];
};

const HELP_CATEGORIES: HelpCategory[] = [
    {
        id: "finding-jobs",
        title: "Finding and filtering jobs",
        description: "Search the available roles and narrow the results.",
        icon: FileSearch,
        questions: [
            {
                id: "search-for-jobs",
                question: "How do I search for a job?",
                answer: (
                    <ol className="list-decimal space-y-1.5 pl-5">
                        <li>Open <Link href="/discover">Discover</Link>.</li>
                        <li>Enter a role, skill, or company in the top search field.</li>
                        <li>Press Enter to update the results.</li>
                    </ol>
                ),
                searchText: "discover search role skill company top field enter results",
            },
            {
                id: "filter-job-results",
                question: "How do I narrow my results?",
                answer: (
                    <ol className="list-decimal space-y-1.5 pl-5">
                        <li>Use the filters on Discover to choose job type, experience level, or work mode.</li>
                        <li>Open More filters for salary, location, and job category.</li>
                        <li>Select an active filter again to remove it, or choose Reset to start over.</li>
                    </ol>
                ),
                searchText: "filter job type experience work mode salary location category more filters reset clear",
            },
        ],
    },
    {
        id: "saving-jobs",
        title: "Saving jobs",
        description: "Keep interesting roles together until you are ready.",
        icon: Bookmark,
        questions: [
            {
                id: "save-a-job",
                question: "How do I save a job?",
                answer: (
                    <ol className="list-decimal space-y-1.5 pl-5">
                        <li>Select the bookmark icon on a job card, or choose Save on the job page.</li>
                        <li>Open <Link href="/saved">Saved</Link> from the sidebar to find it again.</li>
                    </ol>
                ),
                searchText: "save bookmark job card listing saved sidebar keep",
            },
            {
                id: "remove-saved-job",
                question: "How do I remove a saved job?",
                answer: (
                    <p>
                        Select the filled bookmark again, or choose Saved on the job page. The role is
                        removed from your <Link href="/saved">Saved jobs</Link> list.
                    </p>
                ),
                searchText: "remove unsave filled bookmark saved jobs list",
            },
        ],
    },
    {
        id: "applying",
        title: "Applying and using Quick Apply",
        description: "Send your details and résumé from a job listing.",
        icon: BriefcaseBusiness,
        questions: [
            {
                id: "apply-to-job",
                question: "How do I apply to a job?",
                answer: (
                    <ol className="list-decimal space-y-1.5 pl-5">
                        <li>Open a job and choose Apply Now.</li>
                        <li>Select an existing résumé or upload one, then check your contact details.</li>
                        <li>Review the application and submit it.</li>
                    </ol>
                ),
                searchText: "apply now application select upload resume contact details review submit",
            },
            {
                id: "quick-apply",
                question: "How does Quick Apply work?",
                answer: (
                    <p>
                        Quick Apply prepares an application with your saved contact details and résumé.
                        Review the details, then choose Submit application. If anything is missing, choose
                        Review &amp; complete to use the full form.
                    </p>
                ),
                searchText: "quick apply default saved contact details resume submit missing review complete full form",
            },
        ],
    },
    {
        id: "tracking-applications",
        title: "Tracking applications",
        description: "See each application and its latest status.",
        icon: FileText,
        questions: [
            {
                id: "track-application",
                question: "Where can I track an application?",
                answer: (
                    <p>
                        Open <Link href="/applications">Applications</Link> from the sidebar. Use the All,
                        Active, Shortlisted, Interviews, and Closed tabs to filter the list.
                    </p>
                ),
                searchText: "track applications all active shortlisted interviews closed tabs sidebar",
            },
            {
                id: "application-statuses",
                question: "What application statuses can I see?",
                answer: (
                    <p>
                        An application can show as Submitted, Viewed by employer, Shortlisted, Interview
                        scheduled, or Not selected. The tracker also shows when each item was last updated.
                    </p>
                ),
                searchText: "status submitted viewed employer shortlisted interview scheduled not selected last updated",
            },
        ],
    },
    {
        id: "profiles-resumes",
        title: "Managing profiles and résumés",
        description: "Keep application details current and manage your files.",
        icon: UserRound,
        questions: [
            {
                id: "update-profile",
                question: "How do I update my profile?",
                answer: (
                    <p>
                        Open <Link href="/profile">Profile</Link> to edit your name, phone, education,
                        experience, and skills. Your account email is displayed there but cannot be changed.
                    </p>
                ),
                searchText: "profile edit update name phone education experience skills email cannot change",
            },
            {
                id: "manage-resumes",
                question: "How do I upload or manage a résumé?",
                answer: (
                    <ol className="list-decimal space-y-1.5 pl-5">
                        <li>Open the Résumés section on <Link href="/profile">Profile</Link>.</li>
                        <li>Upload a PDF, DOC, or DOCX file up to 5 MB.</li>
                        <li>Preview, set as default, or remove a résumé from the same section.</li>
                    </ol>
                ),
                searchText: "resume résumé upload pdf doc docx 5 mb preview set default remove profile",
            },
            {
                id: "resume-creator",
                question: "Can I create a résumé from my profile?",
                answer: (
                    <p>
                        Yes. Open <Link href="/profile/resume">Resume creator</Link>, edit the profile-based
                        content, save your changes, then choose Save as PDF when it is ready.
                    </p>
                ),
                searchText: "resume résumé creator profile edit save changes download save as pdf",
            },
        ],
    },
    {
        id: "notifications",
        title: "Notifications",
        description: "Review application and report updates.",
        icon: Bell,
        questions: [
            {
                id: "view-notifications",
                question: "Where do I see notifications?",
                answer: (
                    <p>
                        Use the bell in the top bar or open <Link href="/notifications">Notifications</Link>
                        from the sidebar. Unread items are highlighted and show a blue dot.
                    </p>
                ),
                searchText: "notifications bell top bar sidebar unread blue dot application report update",
            },
            {
                id: "mark-notifications-read",
                question: "How do I mark notifications as read?",
                answer: (
                    <p>
                        Open an unread notification to mark it as read. When you have unread items, you can
                        also choose Mark all read on the Notifications page.
                    </p>
                ),
                searchText: "mark notification read unread open mark all read",
            },
        ],
    },
    {
        id: "reporting-listing",
        title: "Reporting a job listing",
        description: "Flag a listing from its job details page.",
        icon: Flag,
        questions: [
            {
                id: "report-job",
                question: "How do I report a job listing?",
                answer: (
                    <ol className="list-decimal space-y-1.5 pl-5">
                        <li>Open the job and choose Report listing.</li>
                        <li>Select the reason and add a short note if needed.</li>
                        <li>Submit the report, then check <Link href="/reports">My reports</Link> for its status.</li>
                    </ol>
                ),
                searchText: "report flag job listing reason short note details submit my reports status",
            },
        ],
    },
    {
        id: "account-sign-in",
        title: "Account and sign-in support",
        description: "Get back into your job-seeker account or sign out.",
        icon: ShieldCheck,
        questions: [
            {
                id: "forgot-password",
                question: "What if I forgot my password?",
                answer: (
                    <ol className="list-decimal space-y-1.5 pl-5">
                        <li>Open <Link href="/forgot-password">Forgot password</Link>.</li>
                        <li>Enter the email used for your job-seeker account.</li>
                        <li>Use the reset link sent to that address.</li>
                    </ol>
                ),
                searchText: "forgot password reset email link sign in login job seeker",
            },
            {
                id: "sign-out",
                question: "How do I sign out?",
                answer: (
                    <p>
                        On desktop, use Log out beside your profile at the bottom of the sidebar. You can
                        also open the profile menu in the top bar and choose Logout.
                    </p>
                ),
                searchText: "sign out log out logout profile sidebar top bar menu",
            },
        ],
    },
];

const normalizeSearch = (value: string) => value.trim().toLocaleLowerCase();

function AccordionItem({
    categoryId,
    item,
    expanded,
    onToggle,
}: {
    categoryId: string;
    item: HelpQuestion;
    expanded: boolean;
    onToggle: () => void;
}) {
    const buttonId = `${categoryId}-${item.id}-button`;
    const panelId = `${categoryId}-${item.id}-panel`;

    return (
        <div className="border-t border-ink-100 first:border-t-0">
            <h3>
                <button
                    id={buttonId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={onToggle}
                    className="flex min-h-14 w-full items-center justify-between gap-4 rounded-md px-1 py-3 text-left text-sm font-semibold text-ink-900 transition-colors hover:text-cobalt-700"
                >
                    <span>{item.question}</span>
                    <ChevronDown
                        size={17}
                        aria-hidden="true"
                        className={[
                            "shrink-0 text-ink-400 transition-transform duration-200",
                            expanded ? "rotate-180 text-cobalt-600" : "",
                        ].join(" ")}
                    />
                </button>
            </h3>
            <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!expanded}
                className="pb-4 pr-8 text-sm leading-6 text-ink-600 [&_a]:font-medium [&_a]:text-cobalt-600 [&_a]:underline [&_a]:decoration-cobalt-200 [&_a]:underline-offset-2 hover:[&_a]:text-cobalt-700"
            >
                {item.answer}
            </div>
        </div>
    );
}

export default function HelpCentreContent() {
    const [query, setQuery] = useState("");
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
    const searchInputRef = useRef<HTMLInputElement>(null);
    const normalizedQuery = normalizeSearch(query);

    const filteredCategories = useMemo(() => {
        if (!normalizedQuery) return HELP_CATEGORIES;

        return HELP_CATEGORIES.map((category) => ({
            ...category,
            questions: category.questions.filter((item) => (
                normalizeSearch(
                    `${category.title} ${category.description} ${item.question} ${item.searchText}`,
                ).includes(normalizedQuery)
            )),
        })).filter((category) => category.questions.length > 0);
    }, [normalizedQuery]);

    const resultCount = filteredCategories.reduce(
        (total, category) => total + category.questions.length,
        0,
    );

    const clearSearch = () => {
        setQuery("");
        searchInputRef.current?.focus();
    };

    const toggleQuestion = (id: string) => {
        setExpandedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <>
            <section
                aria-labelledby="help-centre-title"
                className="overflow-hidden rounded-xl border border-cobalt-100 bg-cobalt-50 px-5 py-6 sm:px-7 sm:py-7"
            >
                <div className="flex items-start gap-4">
                    <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface text-cobalt-600 shadow-card sm:inline-flex">
                        <CircleHelp size={21} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h1 id="help-centre-title" className="text-2xl font-semibold tracking-tight text-ink-900">
                            Help Centre
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-600">
                            Find quick answers for searching, applying, and managing your JobFlow account.
                        </p>
                    </div>
                </div>

                <form
                    role="search"
                    onSubmit={(event) => event.preventDefault()}
                    className="mt-5 max-w-2xl"
                >
                    <label htmlFor="help-search" className="sr-only">Search Help Centre</label>
                    <div className="relative">
                        <Search
                            size={17}
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                        />
                        <input
                            ref={searchInputRef}
                            id="help-search"
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search help topics..."
                            className="h-11 w-full rounded-lg border border-ink-200 bg-surface pl-10 pr-10 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100 [&::-webkit-search-cancel-button]:appearance-none"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                aria-label="Clear help search"
                                className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                            >
                                <X size={15} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <div aria-live="polite" aria-atomic="true" className="min-h-5 text-sm text-ink-500">
                {normalizedQuery && (
                    <p>
                        {resultCount === 1 ? "1 answer" : `${resultCount} answers`} for
                        {" "}<span className="font-medium text-ink-700">&ldquo;{query.trim()}&rdquo;</span>
                    </p>
                )}
            </div>

            {filteredCategories.length > 0 ? (
                <div className="mt-3 grid items-start gap-4 xl:grid-cols-2">
                    {filteredCategories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <section
                                key={category.id}
                                aria-labelledby={`${category.id}-title`}
                                className="rounded-xl border border-ink-100 bg-surface p-5 shadow-card sm:p-6"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cobalt-50 text-cobalt-600">
                                        <Icon size={18} aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 id={`${category.id}-title`} className="text-base font-semibold text-ink-900">
                                            {category.title}
                                        </h2>
                                        <p className="mt-0.5 text-sm leading-5 text-ink-500">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    {category.questions.map((item) => {
                                        const accordionId = `${category.id}-${item.id}`;
                                        return (
                                            <AccordionItem
                                                key={item.id}
                                                categoryId={category.id}
                                                item={item}
                                                expanded={expandedIds.has(accordionId)}
                                                onToggle={() => toggleQuestion(accordionId)}
                                            />
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>
            ) : (
                <section className="mt-3 rounded-xl border border-ink-100 bg-surface px-5 py-14 text-center shadow-card">
                    <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg bg-ink-50 text-ink-400">
                        <SearchX size={22} aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold text-ink-900">No help topics found</h2>
                    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-ink-500">
                        Try a shorter search or clear it to browse every help category.
                    </p>
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                    >
                        Clear search
                    </button>
                </section>
            )}

            <section
                aria-labelledby="contact-support-title"
                className="mt-5 flex flex-col gap-4 rounded-xl border border-ink-100 bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div>
                    <h2 id="contact-support-title" className="text-lg font-semibold text-ink-900">
                        Still need help?
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-ink-500">
                        Email the JobFlow support team with a short description of the problem.
                    </p>
                </div>
                <Link
                    href="mailto:support@jobflow.np"
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-cobalt-500 px-5 text-sm font-medium text-white transition-colors hover:bg-cobalt-600"
                >
                    Email support
                </Link>
            </section>
        </>
    );
}

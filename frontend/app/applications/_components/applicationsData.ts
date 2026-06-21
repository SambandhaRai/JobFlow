import type { ApplicationStatus } from "../../_components/StatusBadge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type ApiResponse<TData> = {
    success?: boolean;
    data?: TData;
    totalApplications?: number;
    message?: string;
};

type HttpError = Error & { status?: number };

type PopulatedJob = {
    _id?: string;
    id?: string;
    title?: string;
    company?: string;
    hiringName?: string;
};

type BackendApplication = {
    _id?: string;
    id?: string;
    jobId?: string | PopulatedJob;
    status?: ApplicationStatus;
    appliedAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type ApplicationsUser = {
    fullName?: string;
    email?: string;
    skills?: unknown[];
    educations?: unknown[];
    resumes?: unknown[];
};

export type ApplicationItem = {
    id: string;
    jobId: string | null;
    role: string;
    company: string;
    status: ApplicationStatus;
    appliedAt?: string;
    appliedLabel: string;
    updatedLabel: string;
};

export type ApplicationStats = {
    total: number;
    appliedThisWeek: number;
    viewed: number;
    viewRate: number;
    shortlisted: number;
    interviews: number;
    awaiting: number;
    avgWaitingDays: number;
};

export type ApplicationsData = {
    applications: ApplicationItem[];
    stats: ApplicationStats;
    user: ApplicationsUser | null;
    error: string | null;
};

const EMPTY_STATS: ApplicationStats = {
    total: 0,
    appliedThisWeek: 0,
    viewed: 0,
    viewRate: 0,
    shortlisted: 0,
    interviews: 0,
    awaiting: 0,
    avgWaitingDays: 0,
};

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const formatAppliedLabel = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const time = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);

    if (isSameDay(date, now)) return `Today, ${time}`;
    if (isSameDay(date, yesterday)) return `Yesterday, ${time}`;

    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const formatRelative = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.max(0, Math.floor(diffMs / 60000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
};

const getPopulatedJob = (jobId: BackendApplication["jobId"]) => (
    jobId && typeof jobId === "object" ? jobId : null
);

const mapApplication = (application: BackendApplication): ApplicationItem => {
    const job = getPopulatedJob(application.jobId);
    const jobId = job
        ? (job._id ?? job.id ?? null)
        : (typeof application.jobId === "string" ? application.jobId : null);
    const appliedAt = application.appliedAt ?? application.createdAt;
    const updatedAt = application.updatedAt ?? appliedAt;

    return {
        id: application._id ?? application.id ?? "",
        jobId,
        role: job?.title ?? "Role",
        company: job?.hiringName ?? job?.company ?? "Company",
        status: application.status ?? "submitted",
        appliedAt,
        appliedLabel: formatAppliedLabel(appliedAt),
        updatedLabel: formatRelative(updatedAt),
    };
};

const DAY_MS = 24 * 60 * 60 * 1000;

const computeStats = (applications: ApplicationItem[]): ApplicationStats => {
    const total = applications.length;
    if (total === 0) return EMPTY_STATS;

    const now = Date.now();
    const toMs = (value?: string) => (value ? new Date(value).getTime() : Number.NaN);

    const appliedThisWeek = applications.filter((item) => {
        const ms = toMs(item.appliedAt);
        return !Number.isNaN(ms) && now - ms <= 7 * DAY_MS;
    }).length;

    const viewed = applications.filter((item) => item.status !== "submitted").length;
    const shortlisted = applications.filter(
        (item) => item.status === "shortlisted" || item.status === "interview_scheduled",
    ).length;
    const interviews = applications.filter((item) => item.status === "interview_scheduled").length;

    const waiting = applications.filter(
        (item) => item.status === "submitted" && !Number.isNaN(toMs(item.appliedAt)),
    );
    const avgWaitingDays = waiting.length > 0
        ? Math.round(
            waiting.reduce((sum, item) => sum + (now - toMs(item.appliedAt)), 0) / waiting.length / DAY_MS,
        )
        : 0;

    return {
        total,
        appliedThisWeek,
        viewed,
        viewRate: Math.round((viewed / total) * 100),
        shortlisted,
        interviews,
        awaiting: waiting.length,
        avgWaitingDays,
    };
};

const fetchJson = async <TData>(path: string, token: string | null) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
    });

    if (!response.ok) {
        let message = `Request failed with ${response.status}`;
        try {
            const body = await response.json() as ApiResponse<TData>;
            message = body.message || message;
        } catch {
            // Keep the status-based message when the API does not return JSON.
        }
        const error = new Error(message) as HttpError;
        error.status = response.status;
        throw error;
    }

    return response.json() as Promise<ApiResponse<TData>>;
};

export const fetchApplicationsData = async (token: string | null): Promise<ApplicationsData> => {
    if (!token) {
        return { applications: [], stats: EMPTY_STATS, user: null, error: null };
    }

    let applications: ApplicationItem[] = [];
    let user: ApplicationsUser | null = null;
    let error: string | null = null;

    try {
        const response = await fetchJson<BackendApplication[]>("/api/applications/me", token);
        applications = (response.data ?? []).map(mapApplication);
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load your applications";
    }

    try {
        const userResponse = await fetchJson<ApplicationsUser>("/api/users/me", token);
        user = userResponse.data ?? null;
    } catch {
        user = null;
    }

    return { applications, stats: computeStats(applications), user, error };
};

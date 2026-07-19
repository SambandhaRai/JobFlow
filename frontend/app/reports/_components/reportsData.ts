import { resolveCompanyLogo } from "../../../lib/avatar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5051";

type ApiResponse<TData> = {
    success?: boolean;
    data?: TData;
    totalReports?: number;
    message?: string;
};

type PopulatedJob = {
    _id?: string;
    id?: string;
    title?: string;
    company?: string;
    hiringName?: string;
    location?: string;
    companyId?: string | { _id?: string; name?: string; slug?: string; logoUrl?: string };
};

type BackendReport = {
    _id?: string;
    id?: string;
    jobId?: string | PopulatedJob;
    reason?: string;
    message?: string;
    status?: ReportStatus;
    createdAt?: string;
    updatedAt?: string;
};

export type ReportStatus = "open" | "reviewed" | "dismissed";

export type ReportsUser = {
    fullName?: string;
    email?: string;
    skills?: unknown[];
    educations?: unknown[];
    resumes?: unknown[];
};

export type ReportItem = {
    id: string;
    jobId: string | null;
    role: string;
    company: string;
    companyLogo?: string;
    location?: string;
    reasonLabel: string;
    message?: string;
    status: ReportStatus;
    submittedLabel: string;
    updatedLabel?: string;
};

export type ReportsStats = {
    total: number;
    open: number;
    resolved: number;
};

const REASON_LABELS: Record<string, string> = {
    scam: "Suspicious or fake listing",
    misleading: "Misleading salary or details",
    payment_request: "Employer asked for payment",
    inappropriate: "Inappropriate or unsafe content",
    duplicate: "Duplicate listing",
    spam: "Spam",
    other: "Something else",
};

export const STATUS_COPY: Record<ReportStatus, { label: string; blurb: string }> = {
    open: {
        label: "Under review",
        blurb: "Our team is looking into this report.",
    },
    reviewed: {
        label: "Action taken",
        blurb: "We reviewed this report and acted on it.",
    },
    dismissed: {
        label: "No action needed",
        blurb: "We found no violation of our guidelines.",
    },
};

const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const getHeaders = (token: string | null) => (
    token ? { Authorization: `Bearer ${token}` } : undefined
);

const fetchJson = async <TData>(path: string, token: string | null) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: getHeaders(token),
        cache: "no-store",
    });

    if (!response.ok) {
        let message = `Request failed with ${response.status}`;
        try {
            const body = await response.json() as ApiResponse<TData>;
            message = body.message || message;
        } catch {}
        throw new Error(message);
    }

    return response.json() as Promise<ApiResponse<TData>>;
};

const mapReport = (report: BackendReport): ReportItem => {
    const job = typeof report.jobId === "object" && report.jobId !== null ? report.jobId : null;
    const jobId = job ? (job._id ?? job.id ?? null) : (typeof report.jobId === "string" ? report.jobId : null);
    const status = report.status ?? "open";

    return {
        id: report._id ?? report.id ?? "",
        jobId,
        // A deleted listing still leaves the report behind, so fall back rather
        // than rendering an empty row.
        role: job?.title ?? "Listing no longer available",
        company: job?.company ?? job?.hiringName ?? "Unknown company",
        companyLogo: resolveCompanyLogo(job?.companyId),
        location: job?.location,
        reasonLabel: REASON_LABELS[report.reason ?? "other"] ?? report.reason ?? "Something else",
        message: report.message?.trim() || undefined,
        status,
        submittedLabel: formatDate(report.createdAt),
        updatedLabel: report.updatedAt && report.updatedAt !== report.createdAt
            ? formatDate(report.updatedAt)
            : undefined,
    };
};

export const fetchReportsData = async (token: string | null): Promise<{
    reports: ReportItem[];
    stats: ReportsStats;
    user: ReportsUser | null;
    error: string | null;
}> => {
    const empty = { total: 0, open: 0, resolved: 0 };

    if (!token) {
        return { reports: [], stats: empty, user: null, error: null };
    }

    const [reportsResult, userResult] = await Promise.allSettled([
        fetchJson<BackendReport[]>("/api/reports/me?size=100", token),
        fetchJson<ReportsUser>("/api/users/me", token),
    ]);

    const user = userResult.status === "fulfilled" ? (userResult.value.data ?? null) : null;

    if (reportsResult.status === "rejected") {
        const message = reportsResult.reason instanceof Error
            ? reportsResult.reason.message
            : "The backend did not return your reports.";
        return { reports: [], stats: empty, user, error: message };
    }

    const reports = (reportsResult.value.data ?? []).map(mapReport);

    return {
        reports,
        stats: {
            total: reports.length,
            open: reports.filter((report) => report.status === "open").length,
            resolved: reports.filter((report) => report.status !== "open").length,
        },
        user,
        error: null,
    };
};

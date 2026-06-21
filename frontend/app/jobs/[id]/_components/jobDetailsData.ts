import type {
    ExperienceLevel,
    HiringType,
    JobCategory,
    JobType,
    WorkMode,
} from "../../../../lib/api/endpoints";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type ApiResponse<TData> = {
    success?: boolean;
    data?: TData;
    message?: string;
};

export type BackendJobDetails = {
    _id?: string;
    id?: string;
    title?: string;
    company?: string;
    companyId?: string | { _id?: string; id?: string };
    hiringType?: HiringType;
    hiringName?: string;
    hiringEmail?: string;
    hiringPhone?: string;
    hiringWebsite?: string;
    hiringLocation?: string;
    isHiringVerified?: boolean;
    location?: string;
    jobType?: JobType;
    workMode?: WorkMode;
    experienceLevel?: ExperienceLevel;
    category?: JobCategory;
    salary?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    duration?: string;
    skills?: string[];
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
    isVerified?: boolean;
    isBeginnerFriendly?: boolean;
    deadline?: string;
    postedAt?: string;
    createdAt?: string;
};

export type JobDetailsUser = {
    _id?: string;
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    educations?: unknown[];
    resumes?: unknown[];
    savedJobs?: unknown[];
};

export type ApplicantResume = {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    score?: number;
    isDefault: boolean;
    uploadedAt?: string;
};

export type ApplicantDefaults = {
    fullName: string;
    email: string;
    phone: string;
};

export type ApplyJob = {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    isVerified: boolean;
};

export type JobDetails = {
    id: string;
    title: string;
    company: string;
    companyId?: string;
    hiringType: HiringType;
    hiringTypeLabel: string;
    isHiringVerified: boolean;
    location: string;
    category: string;
    workMode: string;
    workModeLabel: string;
    jobType: string;
    jobTypeLabel: string;
    experienceLevel: string;
    experienceLevelLabel: string;
    salary: string;
    salarySubtext: string;
    duration: string;
    durationSubtext: string;
    skills: string[];
    descriptionParagraphs: string[];
    responsibilities: string[];
    requirements: string[];
    isVerified: boolean;
    isBeginnerFriendly: boolean;
    deadline?: string;
    deadlineShort?: string;
    postedAt: string;
    hiringEmail?: string;
    hiringPhone?: string;
    hiringWebsite?: string;
    hiringLocation?: string;
};

export type JobMatch = {
    percent: number;
    matchedSkills: string[];
    missingSkills: string[];
    hasResume: boolean;
};

export type JobDetailsData = {
    job: JobDetails;
    user: JobDetailsUser | null;
    isSaved: boolean;
    hasApplied: boolean;
    match: JobMatch;
};

export const toApplyJob = (job: JobDetails): ApplyJob => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    isVerified: job.isVerified,
});

type HttpError = Error & { status?: number };

const titleCase = (value: string) => (
    value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
);

const formatMoney = (value: number, currency = "Rs") => (
    `${currency} ${value.toLocaleString("en-US")}`
);

const formatSalary = (salary: BackendJobDetails["salary"]) => {
    const hasMin = typeof salary?.min === "number";
    const hasMax = typeof salary?.max === "number";
    if (!hasMin && !hasMax) return "Salary not disclosed";

    const currency = salary.currency || "Rs";
    const min = hasMin ? salary.min as number : undefined;
    const max = hasMax ? salary.max as number : undefined;
    if (min !== undefined && max !== undefined && min !== max) {
        return `${formatMoney(min, currency)} - ${formatMoney(max, currency)}`;
    }

    return formatMoney(min ?? max ?? 0, currency);
};

const formatDate = (dateValue?: string) => {
    if (!dateValue) return undefined;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return undefined;

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

const formatShortDate = (dateValue?: string) => {
    if (!dateValue) return undefined;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return undefined;

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
    }).format(date);
};

const formatPostedAt = (dateValue?: string) => {
    if (!dateValue) return "Recently posted";

    const postedAt = new Date(dateValue);
    if (Number.isNaN(postedAt.getTime())) return "Recently posted";

    const diffMs = Date.now() - postedAt.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    if (diffHours < 1) return "Posted just now";
    if (diffHours < 24) return `Posted ${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Posted ${diffDays}d ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    return `Posted ${diffWeeks}w ago`;
};

const splitParagraphs = (value?: string) => (
    value
        ?.split(/\n{2,}|\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean) ?? []
);

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
        } catch {
            // Keep the status-based message when the API does not return JSON.
        }

        const error = new Error(message) as HttpError;
        error.status = response.status;
        throw error;
    }

    return response.json() as Promise<ApiResponse<TData>>;
};

const getJobId = (job: BackendJobDetails) => job._id ?? job.id ?? "";

// companyId may arrive as a raw ObjectId string or a populated sub-document.
const getCompanyId = (companyId: BackendJobDetails["companyId"]) => {
    if (typeof companyId === "string") return companyId || undefined;
    if (companyId && typeof companyId === "object") {
        return companyId._id ?? companyId.id ?? undefined;
    }
    return undefined;
};

const mapJobDetails = (job: BackendJobDetails): JobDetails => {
    const jobType = job.jobType ?? "internship";
    const workMode = job.workMode ?? "hybrid";
    const experienceLevel = job.experienceLevel ?? "entry-level";
    const hiringType = job.hiringType ?? "small-business";
    const deadline = formatDate(job.deadline);
    const salary = formatSalary(job.salary);

    return {
        id: getJobId(job),
        title: job.title ?? "Untitled role",
        company: job.hiringName ?? job.company ?? "Hiring profile",
        companyId: getCompanyId(job.companyId),
        hiringType,
        hiringTypeLabel: {
            company: "Company",
            "small-business": "Small business",
            individual: "Individual",
        }[hiringType],
        isHiringVerified: Boolean(job.isHiringVerified),
        location: job.location ?? "Location not listed",
        category: job.category ?? "Other",
        workMode,
        workModeLabel: titleCase(workMode),
        jobType,
        jobTypeLabel: titleCase(jobType),
        experienceLevel,
        experienceLevelLabel: titleCase(experienceLevel),
        salary,
        salarySubtext: job.jobType === "internship" ? "Stipend" : "Compensation",
        duration: job.duration || "Not specified",
        durationSubtext: job.jobType === "internship" ? "Internship length" : "Role duration",
        skills: job.skills ?? [],
        descriptionParagraphs: splitParagraphs(job.description),
        responsibilities: job.responsibilities ?? [],
        requirements: job.requirements ?? [],
        isVerified: Boolean(job.isVerified),
        isBeginnerFriendly: Boolean(job.isBeginnerFriendly),
        deadline,
        deadlineShort: formatShortDate(job.deadline),
        postedAt: formatPostedAt(job.postedAt ?? job.createdAt),
        hiringEmail: job.hiringEmail,
        hiringPhone: job.hiringPhone,
        hiringWebsite: job.hiringWebsite,
        hiringLocation: job.hiringLocation,
    };
};

const getSavedJobId = (item: unknown) => {
    if (typeof item === "string") return item;
    if (!item || typeof item !== "object") return null;

    const savedJob = item as BackendJobDetails;
    return savedJob._id ?? savedJob.id ?? null;
};

const isSavedJob = (savedJobs: unknown[] | undefined, jobId: string) => (
    Array.isArray(savedJobs) && savedJobs.some((item) => getSavedJobId(item) === jobId)
);

const getAppliedJobId = (application: unknown): string | null => {
    if (!application || typeof application !== "object") return null;

    const jobId = (application as { jobId?: unknown }).jobId;
    if (typeof jobId === "string") return jobId;
    if (jobId && typeof jobId === "object") {
        const populated = jobId as { _id?: string; id?: string };
        return populated._id ?? populated.id ?? null;
    }
    return null;
};

const hasAppliedToJob = (applications: unknown[] | undefined, jobId: string) => (
    Array.isArray(applications) && applications.some((application) => getAppliedJobId(application) === jobId)
);

const getJobMatch = (job: JobDetails, user: JobDetailsUser | null): JobMatch => {
    const userSkills = new Set((user?.skills ?? []).map((skill) => skill.toLowerCase()));
    const matchedSkills = job.skills.filter((skill) => userSkills.has(skill.toLowerCase()));
    const missingSkills = job.skills.filter((skill) => !userSkills.has(skill.toLowerCase()));
    const hasResume = Array.isArray(user?.resumes) && user.resumes.length > 0;

    if (job.skills.length === 0) {
        return {
            percent: hasResume ? 78 : 64,
            matchedSkills,
            missingSkills,
            hasResume,
        };
    }

    const skillScore = Math.round((matchedSkills.length / job.skills.length) * 70);
    const resumeScore = hasResume ? 15 : 0;
    const beginnerScore = job.isBeginnerFriendly ? 8 : 0;
    const percent = Math.min(97, Math.max(42, 42 + skillScore + resumeScore + beginnerScore));

    return {
        percent,
        matchedSkills,
        missingSkills,
        hasResume,
    };
};

export const mapApplicantResume = (item: unknown): ApplicantResume | null => {
    if (!item || typeof item !== "object") return null;

    const resume = item as Record<string, unknown>;
    const fileUrl = typeof resume.fileUrl === "string" ? resume.fileUrl : "";
    if (!fileUrl) return null;

    return {
        id: String(resume._id ?? resume.id ?? ""),
        fileName: typeof resume.fileName === "string" ? resume.fileName : "Resume",
        fileUrl,
        fileSize: typeof resume.fileSize === "number" ? resume.fileSize : 0,
        score: typeof resume.score === "number" ? resume.score : undefined,
        isDefault: Boolean(resume.isDefault),
        uploadedAt: typeof resume.uploadedAt === "string" ? resume.uploadedAt : undefined,
    };
};

export const getApplicantResumes = (user: JobDetailsUser | null): ApplicantResume[] => {
    const resumes = Array.isArray(user?.resumes) ? user.resumes : [];

    return resumes
        .map(mapApplicantResume)
        .filter((resume): resume is ApplicantResume => resume !== null)
        // Surface the default resume first so it is the natural pre-selection.
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
};

export const getApplicantDefaults = (user: JobDetailsUser | null): ApplicantDefaults => ({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
});

export const getProfileCompletion = (user: JobDetailsUser | null) => {
    if (!user) {
        return {
            percent: 30,
            hint: "Complete your profile to unlock better matches.",
        };
    }

    const hasEducation = Array.isArray(user.educations) && user.educations.length > 0;
    const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;
    const hasResume = Array.isArray(user.resumes) && user.resumes.length > 0;
    const completed = [Boolean(user.fullName), hasEducation, hasSkills, hasResume].filter(Boolean).length;
    const percent = Math.max(25, Math.round((completed / 4) * 100));

    return {
        percent,
        hint: hasResume
            ? "Your profile is ready for stronger matches."
            : "Add 1 resume to qualify for more roles.",
    };
};

export const fetchJobDetailsData = async (
    jobId: string,
    token: string | null,
): Promise<JobDetailsData> => {
    const jobResponse = await fetchJson<BackendJobDetails>(`/api/jobs/${jobId}`, token);
    const backendJob = jobResponse.data;

    if (!backendJob) {
        const error = new Error("Job not found") as HttpError;
        error.status = 404;
        throw error;
    }

    const job = mapJobDetails(backendJob);
    let user: JobDetailsUser | null = null;
    let savedJobs: unknown[] | undefined;
    let hasApplied = false;

    if (token) {
        try {
            const userResponse = await fetchJson<JobDetailsUser>("/api/users/me", token);
            user = userResponse.data ?? null;
        } catch {
            user = null;
        }

        try {
            const savedResponse = await fetchJson<unknown[]>("/api/users/me/saved-jobs", token);
            savedJobs = savedResponse.data;
        } catch {
            savedJobs = user?.savedJobs;
        }

        try {
            const appliedResponse = await fetchJson<unknown[]>("/api/applications/me", token);
            hasApplied = hasAppliedToJob(appliedResponse.data, job.id);
        } catch {
            hasApplied = false;
        }
    }

    return {
        job,
        user,
        isSaved: isSavedJob(savedJobs ?? user?.savedJobs, job.id),
        hasApplied,
        match: getJobMatch(job, user),
    };
};

export const isNotFoundError = (error: unknown) => (
    Boolean(error && typeof error === "object" && (error as HttpError).status === 404)
);

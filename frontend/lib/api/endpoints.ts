type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

export type UserRole = "user" | "employer" | "admin";

export type RegisterPayload =
    | {
        role: "user";
        fullName: string;
        email: string;
        password: string;
        confirmPassword: string;
        phone?: string;
    }
    | {
        role: "employer";
        fullName: string;
        email: string;
        password: string;
        confirmPassword: string;
        phone?: string;
    };

export type LoginPayload = {
    email: string;
    password: string;
};

export type UpdateProfilePayload = {
    fullName?: string;
    phone?: string;
    educations?: Array<{
        level: "see" | "+2" | "diploma" | "bachelor" | "master" | "phd" | "other";
        institutionName: string;
        status: "currently-studying" | "completed";
        completionYear?: string;
    }>;
    skills?: string[];
};

export type InstitutionType = "school" | "college" | "university";

export type InstitutionListQuery = {
    search?: string;
    type?: InstitutionType;
    limit?: number;
};

export type CreateResumePayload = {
    fileName: string;
    fileUrl: string;
    fileSize: number;
};

export type UserListQuery = {
    page?: number;
    size?: number;
    search?: string;
    role?: UserRole;
};

export type JobType = "internship" | "full-time" | "part-time";
export type WorkMode = "on-site" | "remote" | "hybrid";
export type ExperienceLevel =
    | "no-experience"
    | "entry-level"
    | "junior"
    | "mid-level"
    | "senior-level";
export type JobCategory =
    | "IT & Software"
    | "Design & Creative"
    | "Marketing & Social Media"
    | "Writing & Content"
    | "Sales & Customer Service"
    | "Business & Administration"
    | "Finance & Accounting"
    | "Education & Tutoring"
    | "Hospitality & Tourism"
    | "Retail & Store Jobs"
    | "Data & Research"
    | "Media & Communication"
    | "Other";

export type HiringType = "company" | "small-business" | "individual";

export type SalaryPayload = {
    min: number;
    max: number;
    currency?: string;
};

export type CreateJobPayload = {
    title: string;
    hiringType?: HiringType;
    companyId?: string;
    hiringName: string;
    hiringEmail?: string;
    hiringPhone?: string;
    hiringWebsite?: string;
    hiringLocation?: string;
    location: string;
    jobType: JobType;
    workMode: WorkMode;
    experienceLevel: ExperienceLevel;
    category?: JobCategory;
    salary?: SalaryPayload;
    duration?: string;
    skills?: string[];
    description: string;
    responsibilities?: string[];
    requirements?: string[];
    isBeginnerFriendly?: boolean;
    deadline?: string | Date;
};

export type UpdateJobPayload = Partial<CreateJobPayload>;

export type JobListQuery = {
    page?: number;
    size?: number;
    search?: string;
    jobType?: JobType;
    workMode?: WorkMode;
    experienceLevel?: ExperienceLevel;
    category?: JobCategory;
    location?: string;
    postedByUserId?: string;
    companyId?: string;
    hiringType?: HiringType;
    minSalary?: number;
    maxSalary?: number;
    isBeginnerFriendly?: boolean;
    isVerified?: boolean;
    employerId?: string;
};

export type ApplicationStatus =
    | "submitted"
    | "viewed_by_employer"
    | "shortlisted"
    | "interview_scheduled"
    | "not_selected";

export type CreateApplicationPayload = {
    jobId: string;
    resumeUrl: string;
    fullName: string;
    email: string;
    phone: string;
    coverLetter?: string;
};

export type UpdateApplicationStatusPayload = {
    status: ApplicationStatus;
};

export type ApplicationListQuery = {
    page?: number;
    size?: number;
    status?: ApplicationStatus;
};

const withQuery = (path: string, params?: QueryParams) => {
    const query = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        query.set(key, String(value));
    });

    const queryString = query.toString();
    return queryString ? `${path}?${queryString}` : path;
};

export const API = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
    },

    USER: {
        GET_PROFILE: "/api/users/me",
        UPDATE_PROFILE: "/api/users/me",

        RESUME: {
            ADD: "/api/users/me/resumes",
            DELETE: (resumeId: string) => `/api/users/me/resumes/${resumeId}`,
            SET_DEFAULT: (resumeId: string) => `/api/users/me/resumes/${resumeId}/default`,
        },

        SAVED_JOB: {
            GET_ALL: "/api/users/me/saved-jobs",
            SAVE: (jobId: string) => `/api/users/me/saved-jobs/${jobId}`,
            UNSAVE: (jobId: string) => `/api/users/me/saved-jobs/${jobId}`,
        },
    },

    JOB: {
        GET_ALL: (params?: JobListQuery) => withQuery("/api/jobs", params),
        GET_BY_ID: (id: string) => `/api/jobs/${id}`,
        CREATE: "/api/jobs",
        UPDATE: (id: string) => `/api/jobs/${id}`,
        DELETE: (id: string) => `/api/jobs/${id}`,
        VERIFY: (id: string) => `/api/jobs/${id}/verify`,
    },

    APPLICATION: {
        CREATE: "/api/applications",
        GET_MY_APPLICATIONS: (params?: ApplicationListQuery) => withQuery("/api/applications/me", params),
        GET_EMPLOYER_APPLICATIONS: (params?: ApplicationListQuery) => withQuery("/api/applications/employer", params),
        GET_FOR_JOB: (jobId: string, params?: ApplicationListQuery) => (
            withQuery(`/api/applications/job/${jobId}`, params)
        ),
        GET_ALL: (params?: ApplicationListQuery) => withQuery("/api/applications", params),
        GET_BY_ID: (id: string) => `/api/applications/${id}`,
        UPDATE_STATUS: (id: string) => `/api/applications/${id}/status`,
        WITHDRAW: (id: string) => `/api/applications/${id}`,
    },

    INSTITUTION: {
        GET_ALL: (params?: InstitutionListQuery) => withQuery("/api/institutions", params),
    },

    ADMIN: {
        USER: {
            GET_ALL: (params?: UserListQuery) => withQuery("/api/users", params),
            GET_BY_ID: (id: string) => `/api/users/${id}`,
            DELETE: (id: string) => `/api/users/${id}`,
        },
        JOB: {
            VERIFY: (id: string) => `/api/jobs/${id}/verify`,
        },
        APPLICATION: {
            GET_ALL: (params?: ApplicationListQuery) => withQuery("/api/applications", params),
            UPDATE_STATUS: (id: string) => `/api/applications/${id}/status`,
            WITHDRAW: (id: string) => `/api/applications/${id}`,
        },
    },
} as const;

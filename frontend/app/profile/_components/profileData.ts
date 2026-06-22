import {
    mapApplicantResume,
    type ApplicantResume,
} from "../../jobs/[id]/_components/jobDetailsData";
import type {
    EducationLevel,
    EducationStatus,
} from "../setup/_components/profileSetupOptions";
import type { EmploymentType } from "../setup/_components/experienceOptions";
import { resolveAvatarUrl } from "../../../lib/avatar";

export { resolveAvatarUrl };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type ApiResponse<TData> = {
    success?: boolean;
    data?: TData;
    message?: string;
};

export type RawProfileUser = {
    _id?: string;
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    profilePicture?: string;
    createdAt?: string;
    skills?: string[];
    educations?: unknown[];
    experiences?: unknown[];
    resumes?: unknown[];
    savedJobs?: unknown[];
};

export type ProfileEducation = {
    id: string;
    level: EducationLevel;
    institutionName: string;
    status: EducationStatus;
    completionYear: string;
};

export type ProfileExperience = {
    id: string;
    title: string;
    organization: string;
    employmentType: EmploymentType;
    startMonth: string;
    startYear: string;
    isCurrent: boolean;
    endMonth: string;
    endYear: string;
    description: string;
};

export type ProfileData = {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    profilePicture: string | null;
    memberSince: string | null;
    skills: string[];
    educations: ProfileEducation[];
    experiences: ProfileExperience[];
    resumes: ApplicantResume[];
};

export type ProfileCompletion = {
    percent: number;
    hint: string;
    items: Array<{ label: string; done: boolean }>;
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
        } catch {}
        throw new Error(message);
    }

    return response.json() as Promise<ApiResponse<TData>>;
};

const mapEducation = (item: unknown, index: number): ProfileEducation | null => {
    if (!item || typeof item !== "object") return null;

    const education = item as Record<string, unknown>;
    const institutionName = typeof education.institutionName === "string" ? education.institutionName : "";
    if (!institutionName) return null;

    return {
        id: String(education._id ?? education.id ?? `education-${index}`),
        level: (education.level as EducationLevel) ?? "other",
        institutionName,
        status: (education.status as EducationStatus) ?? "completed",
        completionYear: typeof education.completionYear === "string" ? education.completionYear : "",
    };
};

const mapExperience = (item: unknown, index: number): ProfileExperience | null => {
    if (!item || typeof item !== "object") return null;

    const experience = item as Record<string, unknown>;
    const title = typeof experience.title === "string" ? experience.title : "";
    const organization = typeof experience.organization === "string" ? experience.organization : "";
    if (!title || !organization) return null;

    const asString = (value: unknown) => (typeof value === "string" ? value : "");

    return {
        id: String(experience._id ?? experience.id ?? `experience-${index}`),
        title,
        organization,
        employmentType: (experience.employmentType as EmploymentType) ?? "internship",
        startMonth: asString(experience.startMonth) || "1",
        startYear: asString(experience.startYear),
        isCurrent: Boolean(experience.isCurrent),
        endMonth: asString(experience.endMonth) || "1",
        endYear: asString(experience.endYear),
        description: asString(experience.description),
    };
};

const formatMemberSince = (value?: string) => {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
};

export const mapProfile = (user: RawProfileUser): ProfileData => ({
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role ?? "user",
    profilePicture: resolveAvatarUrl(user.profilePicture),
    memberSince: formatMemberSince(user.createdAt),
    skills: Array.isArray(user.skills) ? user.skills.filter((skill): skill is string => typeof skill === "string") : [],
    educations: (Array.isArray(user.educations) ? user.educations : [])
        .map(mapEducation)
        .filter((education): education is ProfileEducation => education !== null),
    experiences: (Array.isArray(user.experiences) ? user.experiences : [])
        .map(mapExperience)
        .filter((experience): experience is ProfileExperience => experience !== null),
    resumes: (Array.isArray(user.resumes) ? user.resumes : [])
        .map(mapApplicantResume)
        .filter((resume): resume is ApplicantResume => resume !== null)
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
});

export const getProfileCompletion = (profile: ProfileData | null): ProfileCompletion => {
    const items = [
        { label: "Name", done: (profile?.fullName.trim().length ?? 0) >= 2 },
        { label: "Education", done: (profile?.educations.length ?? 0) > 0 },
        { label: "Skills", done: (profile?.skills.length ?? 0) > 0 },
        { label: "Résumé", done: (profile?.resumes.length ?? 0) > 0 },
    ];
    const completed = items.filter((item) => item.done).length;
    const percent = Math.max(25, Math.round((completed / items.length) * 100));

    return {
        percent,
        hint: items[3].done
            ? "Your profile is ready for stronger matches."
            : "Add 1 résumé to qualify for more roles.",
        items,
    };
};

export const fetchProfileUser = async (
    token: string | null,
): Promise<{ user: RawProfileUser | null; error: string | null }> => {
    if (!token) return { user: null, error: null };

    try {
        const response = await fetchJson<RawProfileUser>("/api/users/me", token);
        return { user: response.data ?? null, error: null };
    } catch (err) {
        return { user: null, error: err instanceof Error ? err.message : "Failed to load your profile" };
    }
};

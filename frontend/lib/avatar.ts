const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export const resolveAvatarUrl = (value?: string | null): string | null => {
    if (!value) return null;
    return /^https?:\/\//i.test(value) ? value : `${API_BASE_URL}/uploads/${value}`;
};

type PopulatedCompanyRef = string | { logoUrl?: string } | null | undefined;

export const resolveCompanyLogo = (companyId: PopulatedCompanyRef): string | undefined => {
    if (!companyId || typeof companyId === "string") return undefined;
    return resolveAvatarUrl(companyId.logoUrl) ?? undefined;
};

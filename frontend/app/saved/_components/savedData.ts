import {
    mapJob,
    type BackendJob,
    type DiscoverUser,
    type Job,
} from "../../discover/_components/discoverData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type ApiResponse<TData> = {
    success?: boolean;
    data?: TData;
    message?: string;
};

// The saved-jobs endpoint returns the same populated shape Discover consumes,
// and the profile endpoint feeds the sidebar — so we reuse Discover's user type.
export type SavedUser = DiscoverUser;

export type SavedJobsData = {
    jobs: Job[];
    user: SavedUser | null;
    error: string | null;
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
        throw new Error(message);
    }

    return response.json() as Promise<ApiResponse<TData>>;
};

export const fetchSavedJobsData = async (token: string | null): Promise<SavedJobsData> => {
    if (!token) {
        return { jobs: [], user: null, error: null };
    }

    let jobs: Job[] = [];
    let user: SavedUser | null = null;
    let error: string | null = null;

    try {
        // `data` is the user's saved jobs, fully populated (same shape as a job).
        const response = await fetchJson<BackendJob[]>("/api/users/me/saved-jobs", token);
        jobs = (response.data ?? []).map(mapJob);
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load your saved jobs";
    }

    try {
        const userResponse = await fetchJson<SavedUser>("/api/users/me", token);
        user = userResponse.data ?? null;
    } catch {
        // The profile only powers the sidebar — not critical for the page.
        user = null;
    }

    return { jobs, user, error };
};

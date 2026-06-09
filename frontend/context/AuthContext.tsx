"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { clearAuthCookies, getAuthToken, getUserData } from "../lib/cookie";

export type AuthUser = {
    _id?: string;
    id?: string;
    fullName?: string;
    email?: string;
    role?: "user" | "employer" | "admin";
    [key: string]: unknown;
};

interface AuthContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
    user: AuthUser | null;
    setUser: Dispatch<SetStateAction<AuthUser | null>>;
    logout: () => Promise<void>;
    loading: boolean;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            const token = await getAuthToken();
            const userData = await getUserData();

            if (token) {
                window.localStorage.setItem("jobflow_token", token);
            } else {
                window.localStorage.removeItem("jobflow_token");
            }

            setUser(userData as AuthUser | null);
            setIsAuthenticated(Boolean(token));
        } catch {
            window.localStorage.removeItem("jobflow_token");
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void checkAuth();
        }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    const logout = async () => {
        try {
            await clearAuthCookies();
            window.localStorage.removeItem("jobflow_token");
            setIsAuthenticated(false);
            setUser(null);
            toast.success("Logged out successfully");
            router.push("/");
        } catch (error) {
            toast.error("Failed to log out");
            console.log("Logout Failed:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                user,
                setUser,
                logout,
                loading,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};

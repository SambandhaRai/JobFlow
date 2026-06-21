"use server";

import { loginUser, registerUser } from "../api/auth";
import type { LoginPayload, RegisterPayload, UserRole } from "../api/endpoints";
import { setAuthToken, setUserData } from "../cookie";

type AuthUser = {
    _id?: string;
    id?: string;
    fullName?: string;
    email?: string;
    role?: "user" | "employer" | "admin";
    [key: string]: unknown;
};

type LoginActionPayload = LoginPayload & {
    acceptedRoles?: UserRole[];
    roleMismatchMessage?: string;
};

type AuthApiResult<TData = unknown> = {
    success: boolean;
    data?: TData;
    token?: string;
    message?: string;
};

type AuthActionResult<TData = unknown> =
    | {
        success: true;
        data?: TData;
        token?: string;
        message: string;
    }
    | {
        success: false;
        message: string;
    };

const getActionErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
};

export const handleRegister = async (
    formData: RegisterPayload,
): Promise<AuthActionResult<AuthUser>> => {
    try {
        const result = await registerUser(formData) as AuthApiResult<AuthUser>;

        if (result.success) {
            if (result.token) {
                await setAuthToken(result.token);
            }
            if (result.data) {
                await setUserData(result.data);
            }

            return {
                success: true,
                data: result.data,
                token: result.token,
                message: "Registration Successful",
            };
        }

        return {
            success: false,
            message: result.message || "Registration Failed",
        };
    } catch (err) {
        console.log("HANDLE REGISTER ERROR:", err);

        return {
            success: false,
            message: getActionErrorMessage(err, "Registration Failed"),
        };
    }
};

export const handleLogin = async (
    formData: LoginActionPayload,
): Promise<AuthActionResult<AuthUser>> => {
    try {
        const { acceptedRoles, roleMismatchMessage, ...loginData } = formData;
        const result = await loginUser(loginData) as AuthApiResult<AuthUser>;

        if (result.success) {
            const role = result.data?.role;

            if (acceptedRoles?.length && (!role || !acceptedRoles.includes(role))) {
                return {
                    success: false,
                    message: roleMismatchMessage || "This account cannot log in from here.",
                };
            }

            if (result.token) {
                await setAuthToken(result.token);
            }
            if (result.data) {
                await setUserData(result.data);
            }

            return {
                success: true,
                data: result.data,
                token: result.token,
                message: "Login Successful",
            };
        }

        return {
            success: false,
            message: result.message || "Login Failed",
        };
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Login Failed"),
        };
    }
};

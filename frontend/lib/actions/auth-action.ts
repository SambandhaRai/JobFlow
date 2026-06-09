"use server";

import { loginUser, registerUser } from "../api/auth";
import type { LoginPayload, RegisterPayload } from "../api/endpoints";

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
): Promise<AuthActionResult> => {
    try {
        const result = await registerUser(formData) as AuthApiResult;

        if (result.success) {
            return {
                success: true,
                data: result.data,
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
    formData: LoginPayload,
): Promise<AuthActionResult> => {
    try {
        const result = await loginUser(formData) as AuthApiResult;

        if (result.success) {
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

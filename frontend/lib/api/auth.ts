import type { AxiosError } from "axios";

import axios from "./axios";
import {
    API,
    type ForgotPasswordPayload,
    type LoginPayload,
    type RegisterPayload,
    type ResetPasswordPayload,
} from "./endpoints";

type ApiErrorResponse = {
    message?: string;
};

const getAuthErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const registerUser = async (registerData: RegisterPayload) => {
    try {
        const response = await axios.post(API.AUTH.REGISTER, registerData);
        return response.data;
    } catch (err) {
        console.log("REGISTER ERROR:", (err as AxiosError<ApiErrorResponse>).response?.data);
        throw new Error(getAuthErrorMessage(err, "Registration Failed"));
    }
};

export const loginUser = async (loginData: LoginPayload) => {
    try {
        const response = await axios.post(API.AUTH.LOGIN, loginData);
        return response.data;
    } catch (err) {
        throw new Error(getAuthErrorMessage(err, "Login Failed"));
    }
};

export const googleStart = async () => {
    try {
        const response = await axios.get(API.AUTH.GOOGLE_START);
        return response.data;
    } catch (err) {
        throw new Error(getAuthErrorMessage(err, "Could not start Google sign-in"));
    }
};

export const googleCallback = async (code: string, state: string, stateCookie: string) => {
    try {
        const response = await axios.post(API.AUTH.GOOGLE_CALLBACK, { code, state, stateCookie });
        return response.data;
    } catch (err) {
        throw new Error(getAuthErrorMessage(err, "Google Login Failed"));
    }
};

export const requestPasswordReset = async (payload: ForgotPasswordPayload) => {
    try {
        const response = await axios.post(API.AUTH.FORGOT_PASSWORD, payload);
        return response.data;
    } catch (err) {
        throw new Error(getAuthErrorMessage(err, "Could not send the reset link"));
    }
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
    try {
        const response = await axios.post(API.AUTH.RESET_PASSWORD, payload);
        return response.data;
    } catch (err) {
        throw new Error(getAuthErrorMessage(err, "Password reset failed"));
    }
};

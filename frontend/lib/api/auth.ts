import type { AxiosError } from "axios";

import axios from "./axios";
import { API, type LoginPayload, type RegisterPayload } from "./endpoints";

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

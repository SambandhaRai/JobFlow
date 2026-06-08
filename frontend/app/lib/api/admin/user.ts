import type { AxiosError } from "axios";

import axios from "../axios";
import { API, type UserListQuery } from "../endpoints";

type ApiErrorResponse = {
    message?: string;
};

const getAdminUserErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getAllUsers = async (params?: UserListQuery) => {
    try {
        const response = await axios.get(API.ADMIN.USER.GET_ALL(params));
        return response.data;
    } catch (err) {
        throw new Error(getAdminUserErrorMessage(err, "Failed to fetch users"));
    }
};

export const getUserById = async (id: string) => {
    try {
        const response = await axios.get(API.ADMIN.USER.GET_BY_ID(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminUserErrorMessage(err, "Failed to fetch user"));
    }
};

export const deleteUser = async (id: string) => {
    try {
        const response = await axios.delete(API.ADMIN.USER.DELETE(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminUserErrorMessage(err, "Failed to delete user"));
    }
};

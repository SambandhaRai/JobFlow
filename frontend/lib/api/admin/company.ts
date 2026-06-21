import type { AxiosError } from "axios";

import axios from "../axios";
import { API } from "../endpoints";

type ApiErrorResponse = {
    message?: string;
};

const getAdminCompanyErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const verifyCompany = async (id: string) => {
    try {
        const response = await axios.patch(API.ADMIN.COMPANY.VERIFY(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminCompanyErrorMessage(err, "Failed to verify company"));
    }
};

export const deleteCompany = async (id: string) => {
    try {
        const response = await axios.delete(API.ADMIN.COMPANY.DELETE(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminCompanyErrorMessage(err, "Failed to delete company"));
    }
};

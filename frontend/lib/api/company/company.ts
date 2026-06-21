import type { AxiosError } from "axios";

import axios from "../axios";
import {
    API,
    type CreateCompanyPayload,
    type UpdateCompanyPayload,
} from "../endpoints";

type ApiErrorResponse = {
    message?: string;
};

const getCompanyErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getMyCompanies = async () => {
    try {
        const response = await axios.get(API.COMPANY.GET_MINE);
        return response.data;
    } catch (err) {
        throw new Error(getCompanyErrorMessage(err, "Failed to fetch your companies"));
    }
};

export const createCompany = async (payload: CreateCompanyPayload) => {
    try {
        const response = await axios.post(API.COMPANY.CREATE, payload);
        return response.data;
    } catch (err) {
        throw new Error(getCompanyErrorMessage(err, "Failed to create company"));
    }
};

export const updateCompany = async (id: string, payload: UpdateCompanyPayload) => {
    try {
        const response = await axios.put(API.COMPANY.UPDATE(id), payload);
        return response.data;
    } catch (err) {
        throw new Error(getCompanyErrorMessage(err, "Failed to update company"));
    }
};

export const uploadCompanyLogo = async (id: string, formData: FormData) => {
    try {
        const response = await axios.put(API.COMPANY.UPLOAD_LOGO(id), formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (err) {
        throw new Error(getCompanyErrorMessage(err, "Failed to upload company logo"));
    }
};

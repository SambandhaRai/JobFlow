import type { AxiosError } from "axios";

import axios from "../axios";
import { API, type InstitutionListQuery, type InstitutionType } from "../endpoints";

export type Institution = {
    _id: string;
    name: string;
    type: InstitutionType;
    isActive: boolean;
};

type InstitutionResponse = {
    success: boolean;
    data?: Institution[];
    message?: string;
};

type ApiErrorResponse = {
    message?: string;
};

const getInstitutionErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getInstitutions = async (params?: InstitutionListQuery) => {
    try {
        const response = await axios.get<InstitutionResponse>(API.INSTITUTION.GET_ALL(params));
        return response.data;
    } catch (err) {
        throw new Error(getInstitutionErrorMessage(err, "Failed to fetch institutions"));
    }
};

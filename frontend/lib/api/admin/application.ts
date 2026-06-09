import type { AxiosError } from "axios";

import axios from "../axios";
import {
    API,
    type ApplicationListQuery,
    type UpdateApplicationStatusPayload,
} from "../endpoints";

type ApiErrorResponse = {
    message?: string;
};

const getAdminApplicationErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getAllApplications = async (params?: ApplicationListQuery) => {
    try {
        const response = await axios.get(API.ADMIN.APPLICATION.GET_ALL(params));
        return response.data;
    } catch (err) {
        throw new Error(getAdminApplicationErrorMessage(err, "Failed to fetch applications"));
    }
};

export const getApplicationById = async (id: string) => {
    try {
        const response = await axios.get(API.APPLICATION.GET_BY_ID(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminApplicationErrorMessage(err, "Failed to fetch application"));
    }
};

export const getApplicationsForJob = async (jobId: string, params?: ApplicationListQuery) => {
    try {
        const response = await axios.get(API.APPLICATION.GET_FOR_JOB(jobId, params));
        return response.data;
    } catch (err) {
        throw new Error(getAdminApplicationErrorMessage(err, "Failed to fetch job applications"));
    }
};

export const updateApplicationStatus = async (
    id: string,
    statusData: UpdateApplicationStatusPayload,
) => {
    try {
        const response = await axios.patch(API.ADMIN.APPLICATION.UPDATE_STATUS(id), statusData);
        return response.data;
    } catch (err) {
        throw new Error(getAdminApplicationErrorMessage(err, "Failed to update application status"));
    }
};

export const withdrawApplication = async (id: string) => {
    try {
        const response = await axios.delete(API.ADMIN.APPLICATION.WITHDRAW(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminApplicationErrorMessage(err, "Failed to withdraw application"));
    }
};

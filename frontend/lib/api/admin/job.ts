import type { AxiosError } from "axios";

import axios from "../axios";
import {
    API,
    type JobListQuery,
    type UpdateJobPayload,
} from "../endpoints";

type ApiErrorResponse = {
    message?: string;
};

const getAdminJobErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getAllJobs = async (params?: JobListQuery) => {
    try {
        const response = await axios.get(API.JOB.GET_ALL(params));
        return response.data;
    } catch (err) {
        throw new Error(getAdminJobErrorMessage(err, "Failed to fetch jobs"));
    }
};

export const getJobById = async (id: string) => {
    try {
        const response = await axios.get(API.JOB.GET_BY_ID(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminJobErrorMessage(err, "Failed to fetch job"));
    }
};

export const updateJob = async (id: string, jobData: UpdateJobPayload) => {
    try {
        const response = await axios.put(API.JOB.UPDATE(id), jobData);
        return response.data;
    } catch (err) {
        throw new Error(getAdminJobErrorMessage(err, "Failed to update job"));
    }
};

export const deleteJob = async (id: string) => {
    try {
        const response = await axios.delete(API.JOB.DELETE(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminJobErrorMessage(err, "Failed to delete job"));
    }
};

export const verifyJob = async (id: string) => {
    try {
        const response = await axios.patch(API.ADMIN.JOB.VERIFY(id));
        return response.data;
    } catch (err) {
        throw new Error(getAdminJobErrorMessage(err, "Failed to verify job"));
    }
};

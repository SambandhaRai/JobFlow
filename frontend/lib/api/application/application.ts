import type { AxiosError } from "axios";

import axios from "../axios";
import {
    API,
    type ApplicationListQuery,
    type CreateApplicationPayload,
    type UpdateApplicationStatusPayload,
} from "../endpoints";

type ApiErrorResponse = {
    message?: string;
    errors?: string;
};

const getApplicationErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    // Validation failures come back under `errors` (from z.prettifyError),
    // not `message`, so surface those instead of a generic status line.
    return error.response?.data?.message
        || error.response?.data?.errors
        || error.message
        || fallback;
};

export const applyToJob = async (applicationData: CreateApplicationPayload) => {
    try {
        const response = await axios.post(API.APPLICATION.CREATE, applicationData);
        return response.data;
    } catch (err) {
        throw new Error(getApplicationErrorMessage(err, "Failed to submit application"));
    }
};

export const getMyApplications = async (params?: ApplicationListQuery) => {
    try {
        const response = await axios.get(API.APPLICATION.GET_MY_APPLICATIONS(params));
        return response.data;
    } catch (err) {
        throw new Error(getApplicationErrorMessage(err, "Failed to fetch applications"));
    }
};

export const getEmployerApplications = async (params?: ApplicationListQuery) => {
    try {
        const response = await axios.get(API.APPLICATION.GET_EMPLOYER_APPLICATIONS(params));
        return response.data;
    } catch (err) {
        throw new Error(getApplicationErrorMessage(err, "Failed to fetch employer applications"));
    }
};

export const getApplicationsForJob = async (jobId: string, params?: ApplicationListQuery) => {
    try {
        const response = await axios.get(API.APPLICATION.GET_FOR_JOB(jobId, params));
        return response.data;
    } catch (err) {
        throw new Error(getApplicationErrorMessage(err, "Failed to fetch job applications"));
    }
};

export const getApplicationById = async (id: string) => {
    try {
        const response = await axios.get(API.APPLICATION.GET_BY_ID(id));
        return response.data;
    } catch (err) {
        throw new Error(getApplicationErrorMessage(err, "Failed to fetch application"));
    }
};

export const updateApplicationStatus = async (
    id: string,
    statusData: UpdateApplicationStatusPayload,
) => {
    try {
        const response = await axios.patch(API.APPLICATION.UPDATE_STATUS(id), statusData);
        return response.data;
    } catch (err) {
        throw new Error(getApplicationErrorMessage(err, "Failed to update application status"));
    }
};

export const withdrawApplication = async (id: string) => {
    try {
        const response = await axios.delete(API.APPLICATION.WITHDRAW(id));
        return response.data;
    } catch (err) {
        throw new Error(getApplicationErrorMessage(err, "Failed to withdraw application"));
    }
};

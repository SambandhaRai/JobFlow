import type { AxiosError } from "axios";

import axios from "../axios";
import {
    API,
    type CreateResumePayload,
    type UpdateProfilePayload,
} from "../endpoints";

type ApiErrorResponse = {
    message?: string;
};

const getUserErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getUserProfile = async () => {
    try {
        const response = await axios.get(API.USER.GET_PROFILE);
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to fetch user profile"));
    }
};

export const updateUserProfile = async (profileData: UpdateProfilePayload) => {
    try {
        const response = await axios.put(API.USER.UPDATE_PROFILE, profileData);
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to update user profile"));
    }
};

export const uploadProfilePicture = async (formData: FormData) => {
    try {
        const response = await axios.put(API.USER.UPLOAD_PROFILE_PICTURE, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to upload profile picture"));
    }
};

export const addResume = async (resumeData: CreateResumePayload | FormData) => {
    try {
        const isFormData = typeof FormData !== "undefined" && resumeData instanceof FormData;
        const response = await axios.post(
            API.USER.RESUME.ADD,
            resumeData,
            isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined,
        );
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to add resume"));
    }
};

export const removeResume = async (resumeId: string) => {
    try {
        const response = await axios.delete(API.USER.RESUME.DELETE(resumeId));
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to remove resume"));
    }
};

export const setDefaultResume = async (resumeId: string) => {
    try {
        const response = await axios.patch(API.USER.RESUME.SET_DEFAULT(resumeId));
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to set default resume"));
    }
};

export const getSavedJobs = async () => {
    try {
        const response = await axios.get(API.USER.SAVED_JOB.GET_ALL);
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to fetch saved jobs"));
    }
};

export const saveJob = async (jobId: string) => {
    try {
        const response = await axios.post(API.USER.SAVED_JOB.SAVE(jobId));
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to save job"));
    }
};

export const unsaveJob = async (jobId: string) => {
    try {
        const response = await axios.delete(API.USER.SAVED_JOB.UNSAVE(jobId));
        return response.data;
    } catch (err) {
        throw new Error(getUserErrorMessage(err, "Failed to unsave job"));
    }
};

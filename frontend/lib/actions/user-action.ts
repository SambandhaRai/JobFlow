"use server";

import {
    addResume,
    getSavedJobs,
    getUserProfile,
    removeResume,
    saveJob,
    setDefaultResume,
    unsaveJob,
    updateUserProfile,
} from "../api/user/user";
import type { CreateResumePayload, UpdateProfilePayload } from "../api/endpoints";
import {
    getActionErrorMessage,
    type ActionResult,
    type ApiResult,
    toActionResult,
} from "./action-utils";

export const handleGetUserProfile = async (): Promise<ActionResult> => {
    try {
        const result = await getUserProfile() as ApiResult;
        return toActionResult(result, "Profile fetched successfully", "Failed to fetch user profile");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch user profile"),
        };
    }
};

export const handleUpdateUserProfile = async (
    formData: UpdateProfilePayload,
): Promise<ActionResult> => {
    try {
        const result = await updateUserProfile(formData) as ApiResult;
        return toActionResult(result, "Profile updated successfully", "Failed to update user profile");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to update user profile"),
        };
    }
};

export const handleAddResume = async (
    formData: CreateResumePayload | FormData,
): Promise<ActionResult> => {
    try {
        const result = await addResume(formData) as ApiResult;
        return toActionResult(result, "Resume added successfully", "Failed to add resume");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to add resume"),
        };
    }
};

export const handleRemoveResume = async (resumeId: string): Promise<ActionResult> => {
    try {
        const result = await removeResume(resumeId) as ApiResult;
        return toActionResult(result, "Resume removed successfully", "Failed to remove resume");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to remove resume"),
        };
    }
};

export const handleSetDefaultResume = async (resumeId: string): Promise<ActionResult> => {
    try {
        const result = await setDefaultResume(resumeId) as ApiResult;
        return toActionResult(result, "Default resume updated", "Failed to set default resume");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to set default resume"),
        };
    }
};

export const handleGetSavedJobs = async (): Promise<ActionResult> => {
    try {
        const result = await getSavedJobs() as ApiResult;
        return toActionResult(result, "Saved jobs fetched successfully", "Failed to fetch saved jobs");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch saved jobs"),
        };
    }
};

export const handleSaveJob = async (jobId: string): Promise<ActionResult> => {
    try {
        const result = await saveJob(jobId) as ApiResult;
        return toActionResult(result, "Job saved successfully", "Failed to save job");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to save job"),
        };
    }
};

export const handleUnsaveJob = async (jobId: string): Promise<ActionResult> => {
    try {
        const result = await unsaveJob(jobId) as ApiResult;
        return toActionResult(result, "Job unsaved successfully", "Failed to unsave job");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to unsave job"),
        };
    }
};

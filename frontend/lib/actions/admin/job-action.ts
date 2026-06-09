"use server";

import {
    deleteJob,
    getAllJobs,
    getJobById,
    updateJob,
    verifyJob,
} from "../../api/admin/job";
import type { JobListQuery, UpdateJobPayload } from "../../api/endpoints";
import {
    getActionErrorMessage,
    type ActionResult,
    type ApiResult,
    toActionResult,
} from "../action-utils";

export const handleAdminGetAllJobs = async (
    params?: JobListQuery,
): Promise<ActionResult> => {
    try {
        const result = await getAllJobs(params) as ApiResult;
        return toActionResult(result, "Jobs fetched successfully", "Failed to fetch jobs");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch jobs"),
        };
    }
};

export const handleAdminGetJobById = async (id: string): Promise<ActionResult> => {
    try {
        const result = await getJobById(id) as ApiResult;
        return toActionResult(result, "Job fetched successfully", "Failed to fetch job");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch job"),
        };
    }
};

export const handleAdminUpdateJob = async (
    id: string,
    formData: UpdateJobPayload,
): Promise<ActionResult> => {
    try {
        const result = await updateJob(id, formData) as ApiResult;
        return toActionResult(result, "Job updated successfully", "Failed to update job");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to update job"),
        };
    }
};

export const handleAdminDeleteJob = async (id: string): Promise<ActionResult> => {
    try {
        const result = await deleteJob(id) as ApiResult;
        return toActionResult(result, "Job deleted successfully", "Failed to delete job");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to delete job"),
        };
    }
};

export const handleAdminVerifyJob = async (id: string): Promise<ActionResult> => {
    try {
        const result = await verifyJob(id) as ApiResult;
        return toActionResult(result, "Job verified successfully", "Failed to verify job");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to verify job"),
        };
    }
};

"use server";

import {
    createJob,
    deleteJob,
    getAllJobs,
    getJobById,
    updateJob,
} from "../api/job/job";
import type { CreateJobPayload, JobListQuery, UpdateJobPayload } from "../api/endpoints";
import {
    getActionErrorMessage,
    type ActionResult,
    type ApiResult,
    toActionResult,
} from "./action-utils";

export const handleGetAllJobs = async (params?: JobListQuery): Promise<ActionResult> => {
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

export const handleGetJobById = async (id: string): Promise<ActionResult> => {
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

export const handleCreateJob = async (formData: CreateJobPayload): Promise<ActionResult> => {
    try {
        const result = await createJob(formData) as ApiResult;
        return toActionResult(result, "Job created successfully", "Failed to create job");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to create job"),
        };
    }
};

export const handleUpdateJob = async (
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

export const handleDeleteJob = async (id: string): Promise<ActionResult> => {
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

"use server";

import {
    applyToJob,
    getApplicationById,
    getApplicationsForJob,
    getEmployerApplications,
    getMyApplications,
    updateApplicationStatus,
    withdrawApplication,
} from "../api/application/application";
import type {
    ApplicationListQuery,
    CreateApplicationPayload,
    UpdateApplicationStatusPayload,
} from "../api/endpoints";
import {
    getActionErrorMessage,
    type ActionResult,
    type ApiResult,
    toActionResult,
} from "./action-utils";

export const handleApplyToJob = async (
    formData: CreateApplicationPayload,
): Promise<ActionResult> => {
    try {
        const result = await applyToJob(formData) as ApiResult;
        return toActionResult(result, "Application submitted successfully", "Failed to submit application");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to submit application"),
        };
    }
};

export const handleGetMyApplications = async (
    params?: ApplicationListQuery,
): Promise<ActionResult> => {
    try {
        const result = await getMyApplications(params) as ApiResult;
        return toActionResult(result, "Applications fetched successfully", "Failed to fetch applications");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch applications"),
        };
    }
};

export const handleGetEmployerApplications = async (
    params?: ApplicationListQuery,
): Promise<ActionResult> => {
    try {
        const result = await getEmployerApplications(params) as ApiResult;
        return toActionResult(result, "Applications fetched successfully", "Failed to fetch employer applications");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch employer applications"),
        };
    }
};

export const handleGetApplicationsForJob = async (
    jobId: string,
    params?: ApplicationListQuery,
): Promise<ActionResult> => {
    try {
        const result = await getApplicationsForJob(jobId, params) as ApiResult;
        return toActionResult(result, "Applications fetched successfully", "Failed to fetch job applications");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch job applications"),
        };
    }
};

export const handleGetApplicationById = async (id: string): Promise<ActionResult> => {
    try {
        const result = await getApplicationById(id) as ApiResult;
        return toActionResult(result, "Application fetched successfully", "Failed to fetch application");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch application"),
        };
    }
};

export const handleUpdateApplicationStatus = async (
    id: string,
    formData: UpdateApplicationStatusPayload,
): Promise<ActionResult> => {
    try {
        const result = await updateApplicationStatus(id, formData) as ApiResult;
        return toActionResult(result, "Application status updated successfully", "Failed to update application status");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to update application status"),
        };
    }
};

export const handleWithdrawApplication = async (id: string): Promise<ActionResult> => {
    try {
        const result = await withdrawApplication(id) as ApiResult;
        return toActionResult(result, "Application withdrawn successfully", "Failed to withdraw application");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to withdraw application"),
        };
    }
};

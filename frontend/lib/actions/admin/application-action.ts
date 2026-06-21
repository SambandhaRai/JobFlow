"use server";

import {
    getAllApplications,
    getApplicationById,
    getApplicationsForJob,
    updateApplicationStatus,
    withdrawApplication,
} from "../../api/admin/application";
import type {
    ApplicationListQuery,
    UpdateApplicationStatusPayload,
} from "../../api/endpoints";
import {
    getActionErrorMessage,
    type ActionResult,
    type ApiResult,
    toActionResult,
} from "../action-utils";

export const handleAdminGetAllApplications = async (
    params?: ApplicationListQuery,
): Promise<ActionResult> => {
    try {
        const result = await getAllApplications(params) as ApiResult;
        return toActionResult(result, "Applications fetched successfully", "Failed to fetch applications");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch applications"),
        };
    }
};

export const handleAdminGetApplicationById = async (id: string): Promise<ActionResult> => {
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

export const handleAdminGetApplicationsForJob = async (
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

export const handleAdminUpdateApplicationStatus = async (
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

export const handleAdminWithdrawApplication = async (id: string): Promise<ActionResult> => {
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

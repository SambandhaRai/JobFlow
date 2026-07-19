import type { AxiosError } from "axios";

import axios from "../axios";

type ApiErrorResponse = {
    message?: string;
    errors?: string;
};

export type ReportReason =
    | "spam"
    | "scam"
    | "inappropriate"
    | "misleading"
    | "payment_request"
    | "duplicate"
    | "other";

/** Thrown when the reporter has already reported this listing (HTTP 409). */
export class AlreadyReportedError extends Error {}

export type CreateReportPayload = {
    jobId: string;
    reason?: ReportReason;
    message?: string;
};

const getReportErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message
        || error.response?.data?.errors
        || error.message
        || fallback;
};

export type ReportStatus = "open" | "reviewed" | "dismissed";

export const updateReportStatus = async (id: string, status: ReportStatus) => {
    try {
        const response = await axios.patch(`/api/reports/${id}/status`, { status });
        return response.data;
    } catch (err) {
        throw new Error(getReportErrorMessage(err, "Failed to update report status"));
    }
};

export const createReport = async (payload: CreateReportPayload) => {
    try {
        const response = await axios.post("/api/reports", payload);
        return response.data;
    } catch (err) {
        const message = getReportErrorMessage(err, "Failed to submit report");

        if ((err as AxiosError).response?.status === 409) {
            throw new AlreadyReportedError(message);
        }

        throw new Error(message);
    }
};

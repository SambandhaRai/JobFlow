import type { AxiosError } from "axios";

import axios from "../axios";

type ApiErrorResponse = {
    message?: string;
    errors?: string;
};

export type ReportReason = "spam" | "scam" | "inappropriate" | "misleading" | "other";

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

export const createReport = async (payload: CreateReportPayload) => {
    try {
        const response = await axios.post("/api/reports", payload);
        return response.data;
    } catch (err) {
        throw new Error(getReportErrorMessage(err, "Failed to submit report"));
    }
};

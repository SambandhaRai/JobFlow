import type { AxiosError } from "axios";

import axios from "../axios";
import { API, type NotificationListQuery } from "../endpoints";

export type NotificationKind =
    | "application_viewed"
    | "application_shortlisted"
    | "application_interview_scheduled"
    | "application_not_selected"
    | "application_update";

export type NotificationItem = {
    _id: string;
    type: NotificationKind;
    title: string;
    message: string;
    applicationId?: string;
    jobId?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
};

export type NotificationListResponse = {
    success: boolean;
    data: NotificationItem[];
    totalNotifications: number;
    unreadCount: number;
};

type ApiErrorResponse = {
    message?: string;
    errors?: string;
};

const getErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message
        || error.response?.data?.errors
        || error.message
        || fallback;
};

export const getNotifications = async (
    params?: NotificationListQuery,
): Promise<NotificationListResponse> => {
    try {
        const response = await axios.get(API.NOTIFICATION.GET_ALL(params));
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err, "Failed to fetch notifications"));
    }
};

export const getUnreadCount = async (): Promise<number> => {
    try {
        const response = await axios.get(API.NOTIFICATION.UNREAD_COUNT);
        return response.data?.data?.unreadCount ?? 0;
    } catch (err) {
        throw new Error(getErrorMessage(err, "Failed to fetch unread count"));
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        const response = await axios.patch(API.NOTIFICATION.MARK_READ(id));
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err, "Failed to mark notification as read"));
    }
};

export const markAllNotificationsRead = async () => {
    try {
        const response = await axios.patch(API.NOTIFICATION.MARK_ALL_READ);
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err, "Failed to mark notifications as read"));
    }
};

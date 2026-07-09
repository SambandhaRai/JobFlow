import { NotificationRepository } from "../repositories/notification.repository";
import { INotification } from "../models/notification.model";
import { IApplication } from "../models/application.model";
import { NotificationKind } from "../types/notification.type";
import { ApplicationStatusType } from "../types/application.type";
import { HttpError } from "../errors/http-error";
import { sendToUser } from "../realtime/sse";

const notificationRepository = new NotificationRepository();

interface ListNotificationsParams {
    page?: number;
    size?: number;
}

type StatusNotificationConfig = {
    type: NotificationKind;
    title: string;
    message: (jobTitle?: string) => string;
};

const STATUS_NOTIFICATIONS: Partial<Record<ApplicationStatusType, StatusNotificationConfig>> = {
    viewed_by_employer: {
        type: "application_viewed",
        title: "Application viewed",
        message: (job) => `An employer viewed your application${job ? ` for "${job}"` : ""}.`,
    },
    shortlisted: {
        type: "application_shortlisted",
        title: "You've been shortlisted",
        message: (job) => `Your application${job ? ` for "${job}"` : ""} was shortlisted.`,
    },
    interview_scheduled: {
        type: "application_interview_scheduled",
        title: "Interview scheduled",
        message: (job) => `An interview was scheduled for your application${job ? ` to "${job}"` : ""}.`,
    },
    not_selected: {
        type: "application_not_selected",
        title: "Application update",
        message: (job) => `Your application${job ? ` for "${job}"` : ""} was not selected this time.`,
    },
};

export class NotificationService {

    async listForUser(userId: string, params: ListNotificationsParams) {
        const page = params.page ?? 1;
        const size = params.size ?? 20;
        return await notificationRepository.getNotificationsForUser({ page, size, userId });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await notificationRepository.getUnreadCount(userId);
    }

    async markAsRead(notificationId: string, userId: string) {
        const notification = await notificationRepository.markAsRead(notificationId, userId);
        if (!notification) {
            throw new HttpError(404, "Notification not found");
        }

        await this.pushUnreadCount(userId);
        return notification;
    }

    async markAllAsRead(userId: string) {
        await notificationRepository.markAllAsRead(userId);
        sendToUser(userId, "unread", { unreadCount: 0 });
    }

    async notifyApplicationStatus(
        application: IApplication,
        status: ApplicationStatusType,
        jobTitle?: string,
    ): Promise<INotification | undefined> {
        const config = STATUS_NOTIFICATIONS[status];
        if (!config) return undefined;

        const notification = await notificationRepository.createNotification({
            userId: application.userId,
            type: config.type,
            title: config.title,
            message: config.message(jobTitle),
            applicationId: application._id,
            jobId: application.jobId,
        });

        const userId = application.userId.toString();
        sendToUser(userId, "notification", notification);
        await this.pushUnreadCount(userId);

        return notification;
    }

    private async pushUnreadCount(userId: string): Promise<void> {
        const unreadCount = await notificationRepository.getUnreadCount(userId);
        sendToUser(userId, "unread", { unreadCount });
    }
}

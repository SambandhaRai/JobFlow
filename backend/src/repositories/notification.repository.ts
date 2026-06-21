import mongoose from "mongoose";
import { INotification, NotificationModel } from "../models/notification.model";

interface ListNotificationsParams {
    page: number;
    size: number;
    userId: string;
}

export interface INotificationRepository {
    createNotification(data: Partial<INotification>): Promise<INotification>;
    getNotificationsForUser(params: ListNotificationsParams): Promise<{
        notifications: INotification[];
        totalNotifications: number;
        unreadCount: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<INotification | null>;
    markAllAsRead(userId: string): Promise<void>;
}

export class NotificationRepository implements INotificationRepository {

    async createNotification(data: Partial<INotification>): Promise<INotification> {
        const notification = new NotificationModel(data);
        return await notification.save();
    }

    async getNotificationsForUser({ page, size, userId }: ListNotificationsParams) {
        const filter = { userId: new mongoose.Types.ObjectId(userId) };

        const [notifications, totalNotifications, unreadCount] = await Promise.all([
            NotificationModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size),
            NotificationModel.countDocuments(filter),
            NotificationModel.countDocuments({ ...filter, isRead: false }),
        ]);

        return { notifications, totalNotifications, unreadCount };
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await NotificationModel.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            isRead: false,
        });
    }

    async markAsRead(id: string, userId: string): Promise<INotification | null> {
        return await NotificationModel.findOneAndUpdate(
            { _id: id, userId: new mongoose.Types.ObjectId(userId) },
            { $set: { isRead: true, readAt: new Date() } },
            { returnDocument: "after" }
        );
    }

    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );
    }
}

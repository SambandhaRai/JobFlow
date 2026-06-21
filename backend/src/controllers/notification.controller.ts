import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { addClient, removeClient } from "../realtime/sse";

const notificationService = new NotificationService();

export class NotificationController {

    async getMyNotifications(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;

            const result = await notificationService.listForUser(userId, { page, size });
            return res.status(200).json({
                success: true,
                data: result.notifications,
                totalNotifications: result.totalNotifications,
                unreadCount: result.unreadCount,
                message: "Notifications fetched successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const unreadCount = await notificationService.getUnreadCount(userId);
            return res.status(200).json({
                success: true,
                data: { unreadCount },
                message: "Unread count fetched successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const notification = await notificationService.markAsRead(req.params.id as string, userId);
            return res.status(200).json({
                success: true,
                data: notification,
                message: "Notification marked as read",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            await notificationService.markAllAsRead(userId);
            return res.status(200).json({
                success: true,
                message: "All notifications marked as read",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    // Long-lived Server-Sent Events stream. Authenticated via sseAuthMiddleware.
    async stream(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            // Disable proxy buffering (e.g. nginx) so events flush immediately.
            "X-Accel-Buffering": "no",
        });
        res.write("retry: 5000\n\n");
        res.write("event: connected\ndata: {}\n\n");

        addClient(userId, res);

        // Send the current unread count so a freshly opened tab is accurate.
        try {
            const unreadCount = await notificationService.getUnreadCount(userId);
            res.write(`event: unread\ndata: ${JSON.stringify({ unreadCount })}\n\n`);
        } catch {
            // Non-fatal: the client can still fall back to the REST unread-count endpoint.
        }

        // Comment-only heartbeat keeps idle connections from being dropped.
        const heartbeat = setInterval(() => {
            res.write(": ping\n\n");
        }, 25000);

        req.on("close", () => {
            clearInterval(heartbeat);
            removeClient(userId, res);
            res.end();
        });
    }
}

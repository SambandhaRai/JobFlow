import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { sseAuthMiddleware } from "../middlewares/sse-auth.middleware";

const router = Router();
const notificationController = new NotificationController();

router.get("/stream", sseAuthMiddleware, notificationController.stream);

router.get("/", authorizedMiddleware, notificationController.getMyNotifications);
router.get("/unread-count", authorizedMiddleware, notificationController.getUnreadCount);
router.patch("/read-all", authorizedMiddleware, notificationController.markAllAsRead);
router.patch("/:id/read", authorizedMiddleware, notificationController.markAsRead);

export default router;

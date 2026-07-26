import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const reportController = new ReportController();

router.post("/", authorizedMiddleware, reportController.createReport);

// Must stay above any "/:id" style routes.
router.get("/me", authorizedMiddleware, reportController.getMyReports);

router.get("/", authorizedMiddleware, adminOnlyMiddleware, reportController.getAllReports);

router.patch("/:id/status", authorizedMiddleware, adminOnlyMiddleware, reportController.updateReportStatus);

export default router;

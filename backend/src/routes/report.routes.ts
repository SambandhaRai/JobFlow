import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const reportController = new ReportController();

// Any authenticated user can report a job listing
router.post("/", authorizedMiddleware, reportController.createReport);

// Admin reviews all reports
router.get("/", authorizedMiddleware, adminOnlyMiddleware, reportController.getAllReports);

export default router;

import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const reportController = new ReportController();

router.post("/", authorizedMiddleware, reportController.createReport);

router.get("/", authorizedMiddleware, adminOnlyMiddleware, reportController.getAllReports);

export default router;

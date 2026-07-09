import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import {
    authorizedMiddleware,
    adminOnlyMiddleware,
    employerOnlyMiddleware,
    userOnlyMiddleware
} from "../middlewares/authorization.middleware";

const router = Router();
const applicationController = new ApplicationController();

router.post("/", authorizedMiddleware, userOnlyMiddleware, applicationController.applyToJob);
router.get("/me", authorizedMiddleware, applicationController.getMyApplications);

router.get(
    "/employer",
    authorizedMiddleware,
    employerOnlyMiddleware,
    applicationController.getEmployerApplications
);

router.get("/job/:jobId", authorizedMiddleware, applicationController.getApplicationsForJob);

router.get("/", authorizedMiddleware, adminOnlyMiddleware, applicationController.getAllApplications);

router.get("/:id", authorizedMiddleware, applicationController.getApplicationById);

router.patch("/:id/status", authorizedMiddleware, applicationController.updateApplicationStatus);

router.delete("/:id", authorizedMiddleware, applicationController.withdrawApplication);

export default router;

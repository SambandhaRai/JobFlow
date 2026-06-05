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

// Job seeker submits and views their own
router.post("/", authorizedMiddleware, applicationController.applyToJob);
router.get("/me", authorizedMiddleware, applicationController.getMyApplications);

// Employer views all applications across their jobs
router.get(
    "/employer",
    authorizedMiddleware,
    employerOnlyMiddleware,
    applicationController.getEmployerApplications
);

// Owner employer or admin views applications for a specific job (service checks)
router.get("/job/:jobId", authorizedMiddleware, applicationController.getApplicationsForJob);

// Admin views all
router.get("/", authorizedMiddleware, adminOnlyMiddleware, applicationController.getAllApplications);

// Owner user / owner employer / admin views one (service checks)
router.get("/:id", authorizedMiddleware, applicationController.getApplicationById);

// Owner employer or admin updates status (service checks)
router.patch("/:id/status", authorizedMiddleware, applicationController.updateApplicationStatus);

// Applicant or admin withdraws (service checks)
router.delete("/:id", authorizedMiddleware, applicationController.withdrawApplication);

router.post("/", authorizedMiddleware, userOnlyMiddleware, applicationController.applyToJob);

export default router;
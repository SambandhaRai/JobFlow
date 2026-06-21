import { Router } from "express";
import { JobController } from "../controllers/job.controller";
import {
    authorizedMiddleware,
    adminOnlyMiddleware,
    employerOnlyMiddleware,
} from "../middlewares/authorization.middleware";

const router = Router();
const jobController = new JobController();

// Public browsing
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);

// Employer creates job (postedByUserId derived from req.user)
router.post("/", authorizedMiddleware, employerOnlyMiddleware, jobController.createJob);

// Owner employer or admin (ownership check lives in service)
router.put("/:id", authorizedMiddleware, jobController.updateJob);
router.delete("/:id", authorizedMiddleware, jobController.deleteJob);

// Admin verification
router.patch("/:id/verify", authorizedMiddleware, adminOnlyMiddleware, jobController.verifyJob);

export default router;

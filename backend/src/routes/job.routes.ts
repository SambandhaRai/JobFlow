import { Router } from "express";
import { JobController } from "../controllers/job.controller";
import {
    authorizedMiddleware,
    adminOnlyMiddleware,
    employerOnlyMiddleware,
} from "../middlewares/authorization.middleware";

const router = Router();
const jobController = new JobController();

router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);

router.post("/", authorizedMiddleware, employerOnlyMiddleware, jobController.createJob);

router.put("/:id", authorizedMiddleware, jobController.updateJob);
router.delete("/:id", authorizedMiddleware, jobController.deleteJob);

router.patch("/:id/verify", authorizedMiddleware, adminOnlyMiddleware, jobController.verifyJob);

export default router;

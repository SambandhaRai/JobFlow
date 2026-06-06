import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
    authorizedMiddleware,
    adminOnlyMiddleware,
    userOnlyMiddleware
} from "../middlewares/authorization.middleware";

const router = Router();
const userController = new UserController();

// Current user profile
router.get("/me", authorizedMiddleware, userController.getProfile);
router.put("/me", authorizedMiddleware, userController.updateProfile);

// Resume management
router.post("/me/resumes", authorizedMiddleware, userController.addResume);
router.delete("/me/resumes/:resumeId", authorizedMiddleware, userController.removeResume);
router.patch("/me/resumes/:resumeId/default", authorizedMiddleware, userController.setDefaultResume);

// Saved jobs
router.get("/me/saved-jobs", authorizedMiddleware, userOnlyMiddleware, userController.getSavedJobs);
router.post("/me/saved-jobs/:jobId", authorizedMiddleware, userOnlyMiddleware, userController.saveJob);
router.delete("/me/saved-jobs/:jobId", authorizedMiddleware, userOnlyMiddleware, userController.unsaveJob);

// Admin
router.get("/", authorizedMiddleware, adminOnlyMiddleware, userController.getAllUsers);
router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, userController.getUserById);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, userController.deleteUser);

export default router;
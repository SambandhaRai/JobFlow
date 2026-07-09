import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
    authorizedMiddleware,
    adminOnlyMiddleware,
    userOnlyMiddleware
} from "../middlewares/authorization.middleware";
import { uploads, imageUploads } from "../middlewares/upload.middleware";

const router = Router();
const userController = new UserController();

router.get("/me", authorizedMiddleware, userController.getProfile);
router.put("/me", authorizedMiddleware, userController.updateProfile);
router.put("/me/profile-picture", authorizedMiddleware, imageUploads.single("profilePicture"), userController.uploadProfilePicture);

router.post("/me/resumes", authorizedMiddleware, uploads.single("resume"), userController.addResume);
router.delete("/me/resumes/:resumeId", authorizedMiddleware, userController.removeResume);
router.patch("/me/resumes/:resumeId/default", authorizedMiddleware, userController.setDefaultResume);

router.get("/me/saved-jobs", authorizedMiddleware, userOnlyMiddleware, userController.getSavedJobs);
router.post("/me/saved-jobs/:jobId", authorizedMiddleware, userOnlyMiddleware, userController.saveJob);
router.delete("/me/saved-jobs/:jobId", authorizedMiddleware, userOnlyMiddleware, userController.unsaveJob);

router.get("/", authorizedMiddleware, adminOnlyMiddleware, userController.getAllUsers);
router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, userController.getUserById);
router.put("/:id", authorizedMiddleware, adminOnlyMiddleware, userController.updateUserById);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, userController.deleteUser);

export default router;

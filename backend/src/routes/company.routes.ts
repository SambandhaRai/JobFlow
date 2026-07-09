import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";
import { authorizedMiddleware, employerOnlyMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";
import { imageUploads } from "../middlewares/upload.middleware";

const router = Router();
const companyController = new CompanyController();

router.post("/", authorizedMiddleware, employerOnlyMiddleware, companyController.createCompany);
router.get("/", authorizedMiddleware, adminOnlyMiddleware, companyController.getAllCompanies);
router.get("/me", authorizedMiddleware, employerOnlyMiddleware, companyController.getMyCompanies);
router.get("/:id", companyController.getCompanyById);
router.put("/:id", authorizedMiddleware, employerOnlyMiddleware, companyController.updateCompany);
router.put("/:id/logo", authorizedMiddleware, employerOnlyMiddleware, imageUploads.single("logo"), companyController.uploadCompanyLogo);
router.patch("/:id/verify", authorizedMiddleware, adminOnlyMiddleware, companyController.verifyCompany);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, companyController.deleteCompany);

export default router;

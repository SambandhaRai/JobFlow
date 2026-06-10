import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";
import { authorizedMiddleware, employerOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const companyController = new CompanyController();

router.post("/", authorizedMiddleware, employerOnlyMiddleware, companyController.createCompany);
router.get("/me", authorizedMiddleware, employerOnlyMiddleware, companyController.getMyCompanies);
router.get("/:id", companyController.getCompanyById);
router.put("/:id", authorizedMiddleware, employerOnlyMiddleware, companyController.updateCompany);

export default router;

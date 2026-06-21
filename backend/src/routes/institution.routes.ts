import { Router } from "express";
import { InstitutionController } from "../controllers/institution.controller";

const router = Router();
const institutionController = new InstitutionController();

router.get("/", institutionController.getInstitutions);

export default router;

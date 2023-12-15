import express from "express";
import auth from "../middleware/auth";
import { getAllCompanies } from "../controllers/company.controller";

const router = express.Router();

router.get("/", auth, getAllCompanies);

export default router;

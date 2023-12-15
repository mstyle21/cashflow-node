import express from "express";
import auth from "../middleware/auth";
import { getAllCities } from "../controllers/city.controller";

const router = express.Router();

router.get("/", auth, getAllCities);

export default router;

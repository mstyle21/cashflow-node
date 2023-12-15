import express from "express";
import auth from "../middleware/auth";
import { getAutocompleteProducts, getPaginatedProducts } from "../controllers/product.controller";

const router = express.Router();

router.get("/autocomplete", auth, getAutocompleteProducts);

router.get("/", auth, getPaginatedProducts);

export default router;

import express from "express";
import auth from "../middleware/auth";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryStats,
  updateCategory,
} from "../controllers/category.controller";

const router = express.Router();

router.get("/", getAllCategories);

router.get("/stats", auth, getCategoryStats);

router.post("/", auth, createCategory);

router.put("/:categoryId", auth, updateCategory);

router.delete("/:categoryId", auth, deleteCategory);

export default router;

import express from "express";
import auth from "../middleware/auth";
import {
  createUserCategory,
  deleteUserCategory,
  getUserCategories,
  getUserCategoryStats,
  updateUserCategory,
} from "../controllers/category.controller";

const router = express.Router();

router.get("/", auth, getUserCategories);
router.get("/stats", auth, getUserCategoryStats);

router.post("/", auth, createUserCategory);

router.put("/:categoryId", auth, updateUserCategory);

router.delete("/:categoryId", auth, deleteUserCategory);

export default router;

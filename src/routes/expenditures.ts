import express from "express";
import { Request } from "express";
import auth from "../middleware/auth";
import multer from "multer";
import {
  createExpenditure,
  createExpenditureQueue,
  deleteExpenditureImage,
  getUserExpenditureStats,
  getUserExpenditures,
  updateExpenditure,
} from "../controllers/expenditure.controller";

const storage = multer.memoryStorage();
const filter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (["jpeg", "jpg", "png"].includes(file.mimetype.split("/")[1])) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: filter });

const router = express.Router();

router.get("/", auth, getUserExpenditures);
router.get("/stats", auth, getUserExpenditureStats);

router.post("/", auth, upload.array("images"), createExpenditure);
router.post("/queue", auth, upload.array("images"), createExpenditureQueue);

router.put("/:expenditureId", auth, upload.array("images"), updateExpenditure);

router.delete("/image/:imageId", auth, deleteExpenditureImage);

export default router;

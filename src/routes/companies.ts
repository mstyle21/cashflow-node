import express from "express";
import { Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import auth from "../middleware/auth";
import { Company } from "../entity/Company";

const router = express.Router();

router.get("/", auth, async (req: Request, res: Response) => {
  const companies = await MysqlDataSource.manager.find(Company);

  return res.json(companies);
});

export default router;

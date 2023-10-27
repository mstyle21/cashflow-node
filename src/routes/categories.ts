import express from "express";
import { Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import auth from "../middleware/auth";
import { Category } from "../entity/Category";
import { IsNull } from "typeorm";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const { organized } = req.query;

  const queryBuilder = MysqlDataSource.getRepository(Category).createQueryBuilder("category");

  queryBuilder.leftJoinAndSelect("category.parent", "parent");

  if (organized && organized === "true") {
    queryBuilder.leftJoinAndSelect("category.childs", "childs");
  }

  const categories = await queryBuilder.getMany();

  return res.json(categories);
});

export default router;

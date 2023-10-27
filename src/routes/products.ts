import express from "express";
import { Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import auth from "../middleware/auth";
import { Product } from "../entity/Product";
import { Like } from "typeorm";

const router = express.Router();

router.get("/", auth, async (req: Request, res: Response) => {
  const { search } = req.query;
  console.log(search);
  const products = await MysqlDataSource.manager.find(Product, {
    where: {
      name: Like(`%${search}%`),
    },
  });

  return res.json(products);
});

export default router;

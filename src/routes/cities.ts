import express from "express";
import { Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import { Location } from "../entity/Location";
import auth from "../middleware/auth";

const router = express.Router();

router.get("/", auth, async (req: Request, res: Response) => {
  const cities = await MysqlDataSource.manager.find(Location);

  return res.json(cities);
});

export default router;

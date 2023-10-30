import express from "express";
import { Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import auth from "../middleware/auth";
import { Product } from "../entity/Product";
import { FindOperator, Like } from "typeorm";

const router = express.Router();

interface StatsQuery extends qs.ParsedQs {
  search?: string;
  page?: string;
  perPage?: string;
}

router.get("/autocomplete", auth, async (req: Request, res: Response) => {
  const { search } = req.query;

  const where: {
    name?: FindOperator<string>;
  } = {};
  if (search) {
    where.name = Like(`%${search}%`);
  }

  const products = await MysqlDataSource.manager.find(Product, {
    where: where,
  });

  return res.status(200).json(products);
});

router.get("/", auth, async (req: Request<{}, {}, {}, StatsQuery>, res: Response) => {
  const { search, page, perPage } = req.query;

  let pag = 1;
  let limit = 10;
  if (perPage && !isNaN(parseInt(perPage)) && parseInt(perPage) > 0) {
    limit = parseInt(perPage);
  }
  if (page && !isNaN(parseInt(page)) && parseInt(page) > 0) {
    pag = parseInt(page);
  }
  const skip = limit * pag - limit;

  const where: {
    name?: FindOperator<string>;
  } = {};
  if (search) {
    where.name = Like(`%${search}%`);
  }

  const products = await MysqlDataSource.manager.find(Product, {
    where: where,
    relations: {
      expenditureItems: {
        expenditure: true,
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      expenditureItems: {
        quantity: true,
        pricePerUnit: true,
        totalPrice: true,
        expenditure: {
          purchaseDate: true,
        },
      },
    },
    take: limit,
    skip: skip,
  });

  const countFilteredProducts = await MysqlDataSource.manager.find(Product, { where });

  return res.status(200).json({
    items: products,
    count: countFilteredProducts.length,
    pages: Math.floor(countFilteredProducts.length / limit) + 1,
  });
});

export default router;

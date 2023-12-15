import { NextFunction, Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import { Product } from "../entity/Product";
import { FindOptionsWhere, Like } from "typeorm";
import { paginatedResult } from "../utils";
import { PaginationQuery } from "../types";

const productRepository = MysqlDataSource.getRepository(Product);

export const getAutocompleteProducts = async (req: Request, res: Response, next: NextFunction) => {
  const { search } = req.query;

  const where: FindOptionsWhere<Product> = {};
  if (search) {
    where.name = Like(`%${search}%`);
  }

  const products = await productRepository.find({
    where: where,
  });

  return res.status(200).json(products);
};

interface ProductsQuery extends PaginationQuery {
  search?: string;
}
export const getPaginatedProducts = async (req: Request<{}, {}, {}, ProductsQuery>, res: Response) => {
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

  const where: FindOptionsWhere<Product> = {};
  if (search) {
    where.name = Like(`%${search}%`);
  }

  const products = await productRepository.find({
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

  const countFilteredProducts = await productRepository.find({ where });

  return res.status(200).json(paginatedResult(products, countFilteredProducts.length, limit));
};

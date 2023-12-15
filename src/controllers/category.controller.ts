import { NextFunction, Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import { Category } from "../entity/Category";
import { FindOptionsWhere, Like } from "typeorm";
import { ExpenditureItem } from "../entity/ExpenditureItem";
import { MONTHS, CURRENT_YEAR } from "../utils";
import { CategoryStatsQuery } from "../types";

const categoryRepository = MysqlDataSource.getRepository(Category);
const expenditureItemRepository = MysqlDataSource.getRepository(ExpenditureItem);

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  const { organized } = req.query;

  const queryBuilder = categoryRepository.createQueryBuilder("category");

  queryBuilder.leftJoinAndSelect("category.parent", "parent");

  if (organized && organized === "true") {
    queryBuilder.leftJoinAndSelect("category.childs", "childs");
  }

  const categories = await queryBuilder.getMany();

  return res.json(categories);
};

export const getCategoryStats = async (req: Request<{}, {}, {}, CategoryStatsQuery>, res: Response) => {
  const { type, month, year, category } = req.query;
  const user = res.locals.loggedUser;

  if (
    !month ||
    !year ||
    !type ||
    !MONTHS.includes(month) ||
    parseInt(year) < 2020 ||
    parseInt(year) > CURRENT_YEAR ||
    !["allTime", "month", "year"].includes(type) ||
    isNaN(parseInt(category))
  ) {
    return res.status(400).send("Invalid request");
  }

  const parsedMonth = MONTHS.indexOf(month) + 1 < 10 ? `0${MONTHS.indexOf(month) + 1}` : `${MONTHS.indexOf(month) + 1}`;

  let where: FindOptionsWhere<ExpenditureItem> = {
    expenditure: {
      user: {
        id: user.id,
      },
    },
  };

  switch (type) {
    default:
    case "month":
      where = {
        ...where,
        expenditure: {
          purchaseDate: Like(`${year}-${parsedMonth}-%`),
        },
      };
      break;
    case "year":
      where = {
        ...where,
        expenditure: {
          purchaseDate: Like(`${year}-%`),
        },
      };
      break;
    case "allTime":
      break;
  }

  if (parseInt(category) > 0) {
    where.category = {
      parent: {
        id: parseInt(category),
      },
    };
  }

  const userExpenditureItems = await expenditureItemRepository.find({
    where: where,
    relations: {
      category: {
        parent: true,
      },
    },
    select: {
      category: {
        id: true,
        name: true,
        parent: {
          id: true,
          name: true,
        },
      },
    },
  });

  return res.json(userExpenditureItems);
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, parentId } = req.body;
  const user = res.locals.loggedUser;
  //TODO: to be implemented user defined categories

  if (!name || parentId === undefined) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  const category = new Category();
  category.name = name;

  if (parentId !== 0) {
    const parentCategory = await categoryRepository.findOneBy({ id: parentId });
    if (parentCategory) {
      category.parent = parentCategory;
    }
  }

  await categoryRepository.save(category);

  return res.status(201).json({ message: "Category created!" });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { name, parentId } = req.body;
  const categoryId = req.params.categoryId;

  if (!categoryId || !name || parentId === undefined) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  const category = await categoryRepository.findOne({
    where: { id: parseInt(categoryId) },
    relations: { parent: true },
  });

  if (!category) {
    return res.status(400).json({ message: "Something went wrong. Category not found!" });
  }

  category.name = name;
  if (parentId !== 0) {
    const parentCategory = await categoryRepository.findOneBy({ id: parentId });
    if (!parentCategory) {
      return res.status(400).json({ message: "Something went wrong. Parent category not found!" });
    }
    category.parent = parentCategory;
  } else {
    category.parent = null;
  }

  await categoryRepository.save(category);

  return res.status(201).json({ message: "Category updated!" });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.categoryId;

  const category = await categoryRepository.findOneBy({ id: parseInt(categoryId) });
  //TODO: to be implemented user defined categories
  //right now deleting the base categories

  if (!category) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  await categoryRepository.remove(category);

  return res.status(204).json({ message: "Category removed!" });
};

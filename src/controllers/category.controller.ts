import { NextFunction, Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import { Category } from "../entity/Category";
import { FindOptionsWhere, IsNull, Like } from "typeorm";
import { ExpenditureItem } from "../entity/ExpenditureItem";
import { MONTHS, CURRENT_YEAR } from "../utils";
import { CategoryStatsQuery } from "../types";
import { UserCategory } from "../entity/UserCategory";
import { User } from "../entity/User";

const categoryRepository = MysqlDataSource.getRepository(Category);
const userCategoryRepository = MysqlDataSource.getRepository(UserCategory);
const expenditureItemRepository = MysqlDataSource.getRepository(ExpenditureItem);

export const getUserCategories = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.loggedUser;

  let categories = await userCategoryRepository.find({
    where: {
      user: {
        id: user.id,
      },
    },
    relations: {
      parent: true,
      childs: {
        parent: true,
      },
    },
  });

  if (categories.length === 0) {
    copyBaseCategoriesToUser(user);

    categories = await userCategoryRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: {
        parent: true,
        childs: {
          parent: true,
        },
      },
    });
  }

  return res.json(categories);
};

export const getUserCategoryStats = async (req: Request<{}, {}, {}, CategoryStatsQuery>, res: Response) => {
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

export const createUserCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { name, parentId } = req.body;
  const user = res.locals.loggedUser;

  if (!name || parentId === undefined) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  const userCategory = new UserCategory();
  userCategory.user = user;
  userCategory.name = name;

  if (parentId !== 0) {
    const parentCategory = await userCategoryRepository.findOneBy({ id: parentId });
    if (parentCategory) {
      userCategory.parent = parentCategory;
    }
  }

  await userCategoryRepository.save(userCategory);

  return res.status(201).json({ message: "Category created!" });
};

export const updateUserCategory = async (req: Request, res: Response) => {
  const { name, parentId } = req.body;
  const categoryId = req.params.categoryId;
  const user = res.locals.loggedUser;

  if (!categoryId || !name || parentId === undefined) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  const userCategory = await userCategoryRepository.findOne({
    where: { id: parseInt(categoryId), user: { id: user.id } },
    relations: { parent: true, user: true },
  });

  if (!userCategory) {
    return res.status(400).json({ message: "Something went wrong. Category not found!" });
  }

  userCategory.name = name;

  if (parentId !== 0) {
    const parentCategory = await userCategoryRepository.findOneBy({ id: parentId });
    if (!parentCategory) {
      return res.status(400).json({ message: "Something went wrong. Parent category not found!" });
    }
    userCategory.parent = parentCategory;
  } else {
    userCategory.parent = null;
  }

  await userCategoryRepository.save(userCategory);

  return res.status(201).json({ message: "Category updated!" });
};

export const deleteUserCategory = async (req: Request, res: Response, next: NextFunction) => {
  const categoryId = req.params.categoryId;
  const user = res.locals.loggedUser;

  const userCategory = await userCategoryRepository.findOne({
    where: { id: parseInt(categoryId), user: { id: user.id } },
    relations: { parent: true, user: true },
  });

  if (!userCategory) {
    return res.status(400).json({ message: "Something went wrong. Category not found!" });
  }

  await userCategoryRepository.remove(userCategory);

  return res.status(204).json({ message: "Category removed!" });
};

const copyBaseCategoriesToUser = async (user: User) => {
  const baseCategories = await categoryRepository.find({
    where: {
      parent: IsNull(),
    },
    relations: {
      childs: true,
    },
  });

  for (const baseCategory of baseCategories) {
    const parentCategory = new UserCategory();

    parentCategory.name = baseCategory.name;
    parentCategory.keywords = parentCategory.keywords;
    parentCategory.user = user;
    parentCategory.childs = [];

    if (baseCategory.childs) {
      for (const childBaseCategory of baseCategory.childs) {
        const childCategory = new UserCategory();

        childCategory.name = childBaseCategory.name;
        childCategory.keywords = childBaseCategory.keywords;
        childCategory.user = user;
        childCategory.parent = parentCategory;

        parentCategory.childs.push(childCategory);
      }
    }

    await userCategoryRepository.save(parentCategory);
  }
};

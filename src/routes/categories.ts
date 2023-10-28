import express from "express";
import { Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import auth from "../middleware/auth";
import { Category } from "../entity/Category";
import { Equal, EqualOperator, FindOperator, IsNull, Like } from "typeorm";
import { Expenditure } from "../entity/Expenditure";
import { MONTHS, CURRENT_YEAR } from "../helpers/utils";
import { ExpenditureItem } from "../entity/ExpenditureItem";

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

interface StatsQuery extends qs.ParsedQs {
  type: "allTime" | "month" | "year";
  month: string;
  year: string;
  category: string;
}
/**
 * Get statistics of category expenses
 */
router.get("/stats", auth, async (req: Request<{}, {}, {}, StatsQuery>, res: Response) => {
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

  let where: {
    expenditure: { user: { id: number }; purchaseDate?: FindOperator<string> };
    category?: {
      parent: {
        id: number;
      };
    };
  } = {
    expenditure: {
      user: {
        id: user.id,
      },
    },
  };

  switch (type) {
    default:
    case "month":
      where.expenditure.purchaseDate = Like(`${year}-${parsedMonth}-%`);
      break;
    case "year":
      where.expenditure.purchaseDate = Like(`${year}-%`);
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

  const userExpenditureItems = await MysqlDataSource.manager.find(ExpenditureItem, {
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
});

export default router;

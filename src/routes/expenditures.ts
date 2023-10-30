import express from "express";
import { Request, Response } from "express";
import auth from "../middleware/auth";
import MysqlDataSource from "../config/data-source";
import { Expenditure } from "../entity/Expenditure";
import { FindOperator, Like } from "typeorm";
import { CURRENT_YEAR, MONTHS, randomHash } from "../helpers/utils";
import multer from "multer";
import { Company } from "../entity/Company";
import { Location } from "../entity/Location";
import moment from "moment";
import { ExpenditureItem } from "../entity/ExpenditureItem";
import { Category } from "../entity/Category";
import { Product } from "../entity/Product";
import path from "path";
import * as fs from "fs";
import { ExpenditureImage } from "../entity/ExpenditureImage";
import { log } from "console";

const router = express.Router();

interface StatsQuery extends qs.ParsedQs {
  type: "allTime" | "month" | "year";
  month: string;
  year: string;
}

router.get("/stats", auth, async (req: Request<{}, {}, {}, StatsQuery>, res: Response) => {
  const { type, month, year } = req.query;
  const user = res.locals.loggedUser;

  if (
    !month ||
    !year ||
    !type ||
    !MONTHS.includes(month) ||
    parseInt(year) < 2023 ||
    parseInt(year) > CURRENT_YEAR ||
    !["allTime", "month", "year"].includes(type)
  ) {
    return res.status(400).send("Invalid request");
  }

  const parsedMonth = MONTHS.indexOf(month) + 1 < 10 ? `0${MONTHS.indexOf(month) + 1}` : `${MONTHS.indexOf(month) + 1}`;

  let where: { user: { id: number }; purchaseDate?: FindOperator<string> } = {
    user: { id: Number(user.id) },
  };

  switch (type) {
    default:
    case "month":
      where.purchaseDate = Like(`${year}-${parsedMonth}-%`);
      break;
    case "year":
      where.purchaseDate = Like(`${year}-%`);
      break;
    case "allTime":
      break;
  }

  const userExpenditures = await MysqlDataSource.manager.find(Expenditure, {
    where: where,
    order: {
      purchaseDate: "DESC",
    },
  });

  return res.json(userExpenditures);
});

interface ExpenditureQuery extends qs.ParsedQs {
  userId: string;
  month: string;
  year: string;
}
/**
 * GET METHOD
 * Get all user's expenditures
 */
router.get("/", auth, async (req: Request<{}, {}, {}, ExpenditureQuery>, res: Response) => {
  const { month, year } = req.query;
  const user = res.locals.loggedUser;
  const parsedMonth = MONTHS.indexOf(month) + 1 < 10 ? `0${MONTHS.indexOf(month) + 1}` : `${MONTHS.indexOf(month) + 1}`;

  const userExpenditures = await MysqlDataSource.manager.find(Expenditure, {
    relations: {
      company: true,
      images: true,
      items: {
        product: true,
        category: true,
      },
    },
    select: {
      company: {
        name: true,
      },
      images: {
        id: true,
        path: true,
      },
    },
    where: {
      user: {
        id: Number(user.id),
      },
      purchaseDate: Like(`${year}-${parsedMonth}-%`),
    },
    order: {
      purchaseDate: "DESC",
    },
  });

  return res.json(userExpenditures);
});

const storage = multer.memoryStorage();
const filter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (["jpeg", "jpg", "png"].includes(file.mimetype.split("/")[1])) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: filter });

type ReqExpenditureItem = {
  hash: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  category: number;
};

/**
 * POST METHOD
 * Create new expenditure for user
 */
router.post("/", auth, upload.array("images"), async (req, res) => {
  const { date, totalPrice, company: companyName, location, items } = req.body;
  const user = res.locals.loggedUser;

  if (!date || date === "") {
    return res.status(400).json({ message: "Missing or invalid 'date'." });
  }
  if (!totalPrice || totalPrice === 0) {
    return res.status(400).json({ message: "Missing or invalid 'total price'." });
  }
  if (!companyName || companyName === "") {
    return res.status(400).json({ message: "Missing or invalid 'company'." });
  }

  let company = await MysqlDataSource.manager.findOneBy(Company, { name: Like(companyName) });
  if (!company) {
    const newCompany = new Company();
    newCompany.name = companyName;
    company = await MysqlDataSource.getRepository(Company).save(newCompany);
  }

  let city = await MysqlDataSource.manager.findOneBy(Location, { id: location });
  if (!city) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  const expenditure = new Expenditure();
  expenditure.purchaseDate = moment(new Date(date)).format("YYYY-MM-DD");
  expenditure.totalPrice = totalPrice;
  expenditure.company = company;
  expenditure.location = city;
  expenditure.user = user;
  expenditure.items = [];
  expenditure.images = [];

  const postItems: [] = JSON.parse(items);
  if (postItems.length) {
    await Promise.all(
      postItems.map(async (item: ReqExpenditureItem) => {
        const itemCategory = await MysqlDataSource.manager.findOneBy(Category, { id: item.category });
        if (!itemCategory) {
          return false;
        }
        let itemProduct = await MysqlDataSource.manager.findOneBy(Product, { name: Like(item.name) });
        if (!itemProduct) {
          const newProduct = new Product();
          newProduct.name = item.name;
          newProduct.description = "";
          itemProduct = await MysqlDataSource.getRepository(Product).save(newProduct);
        }

        const expenditureItem = new ExpenditureItem();
        expenditureItem.expenditure = expenditure;
        expenditureItem.pricePerUnit = item.pricePerUnit;
        expenditureItem.product = itemProduct;
        expenditureItem.quantity = item.quantity;
        expenditureItem.totalPrice = item.pricePerUnit * item.quantity;
        expenditureItem.category = itemCategory;

        expenditure.items.push(expenditureItem);
      })
    );
  }

  const createdExpenditure = await MysqlDataSource.getRepository(Expenditure).save(expenditure);

  const images = req.files as Express.Multer.File[];
  if (images.length) {
    const folderPath = path.join("uploads", createdExpenditure.id.toString());
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    images.forEach((image) => {
      const imageHash = randomHash(6);
      const imageName = `${imageHash}.${image.originalname.split(".").pop()}`;

      fs.writeFileSync(path.join(folderPath, imageName), image.buffer);

      const expenditureImage = new ExpenditureImage();
      expenditureImage.expenditure = expenditure;
      expenditureImage.path = imageName;

      MysqlDataSource.getRepository(ExpenditureImage).save(expenditureImage);
    });
  }

  return res.status(201).json({ message: "Expenditure saved!" });
});

/**
 * PUT METHOD
 * Update user's expenditure
 */
router.put("/:expenditureId", auth, upload.array("images"), async (req, res) => {
  const { date, totalPrice, company: companyName, location, items } = req.body;
  const user = res.locals.loggedUser;
  const expenditureId = req.params.expenditureId;

  const userExpenditure = await MysqlDataSource.getRepository(Expenditure).findOne({
    where: { id: parseInt(expenditureId) },
    relations: { user: true, items: true, images: true },
  });
  if (!userExpenditure || userExpenditure.user.id !== user.id) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  if (!date || date === "") {
    console.log(req.body);
    return res.status(400).json({ message: "Missing or invalid 'date'." });
  }
  if (!totalPrice || totalPrice === 0) {
    return res.status(400).json({ message: "Missing or invalid 'total price'." });
  }
  if (!companyName || companyName === "") {
    return res.status(400).json({ message: "Missing or invalid 'company'." });
  }

  let company = await MysqlDataSource.manager.findOneBy(Company, { name: Like(companyName) });
  if (!company) {
    const newCompany = new Company();
    newCompany.name = companyName;
    company = await MysqlDataSource.getRepository(Company).save(newCompany);
  }

  let city = await MysqlDataSource.manager.findOneBy(Location, { id: location });
  if (!city) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  userExpenditure.purchaseDate = moment(new Date(date)).format("YYYY-MM-DD");
  userExpenditure.totalPrice = totalPrice;
  userExpenditure.company = company;
  userExpenditure.location = city;
  userExpenditure.user = user;
  userExpenditure.items.map(async (item) => {
    await MysqlDataSource.getRepository(ExpenditureItem).remove(item);
  });
  userExpenditure.items = [];

  const postItems: ReqExpenditureItem[] = JSON.parse(items);
  if (postItems.length) {
    await Promise.all(
      postItems.map(async (item) => {
        const itemCategory = await MysqlDataSource.manager.findOneBy(Category, { id: item.category });
        if (!itemCategory) {
          return false;
        }
        let itemProduct = await MysqlDataSource.manager.findOneBy(Product, { name: Like(item.name) });
        if (!itemProduct) {
          const newProduct = new Product();
          newProduct.name = item.name;
          newProduct.description = "";
          itemProduct = await MysqlDataSource.getRepository(Product).save(newProduct);
        }

        const expenditureItem = new ExpenditureItem();
        expenditureItem.expenditure = userExpenditure;
        expenditureItem.pricePerUnit = item.pricePerUnit;
        expenditureItem.product = itemProduct;
        expenditureItem.quantity = item.quantity;
        expenditureItem.totalPrice = item.pricePerUnit * item.quantity;
        expenditureItem.category = itemCategory;

        userExpenditure.items.push(expenditureItem);
      })
    );
  }

  await MysqlDataSource.getRepository(Expenditure).save(userExpenditure);

  const images = req.files as Express.Multer.File[];
  if (images.length) {
    const folderPath = path.join("uploads", userExpenditure.id.toString());
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    images.forEach((image) => {
      const imageHash = randomHash(6);
      const imageName = `${imageHash}.${image.originalname.split(".").pop()}`;

      fs.writeFileSync(path.join(folderPath, imageName), image.buffer);

      const expenditureImage = new ExpenditureImage();
      expenditureImage.expenditure = userExpenditure;
      expenditureImage.path = imageName;

      MysqlDataSource.getRepository(ExpenditureImage).save(expenditureImage);
    });
  }

  return res.status(201).json({ message: "Expenditure updated!" });
});

router.delete("/image/:imageId", auth, async (req, res) => {
  const user = res.locals.loggedUser;
  const imageId = req.params.imageId;
  const expenditureImageRepository = MysqlDataSource.getRepository(ExpenditureImage);

  const expenditureImage = await expenditureImageRepository.findOne({
    where: { id: Number(imageId) },
    relations: {
      expenditure: {
        user: true,
      },
    },
  });
  if (!expenditureImage || user.id !== expenditureImage?.expenditure.user.id) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  const folderPath = path.join("uploads", expenditureImage.expenditure.id.toString());
  const filePath = path.join(folderPath, expenditureImage.path);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await expenditureImageRepository.remove(expenditureImage);

  return res.status(204).json({ message: "Expenditure image deleted" });
});

export default router;

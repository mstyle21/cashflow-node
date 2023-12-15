import { NextFunction, Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import { Expenditure } from "../entity/Expenditure";
import { ExpenditureItemRequest, ExpenditureQuery, ExpenditureStatsQuery } from "../types";
import { FindOptionsWhere, Like } from "typeorm";
import { MONTHS, CURRENT_YEAR, randomHash } from "../utils";
import moment from "moment";
import path from "path";
import * as fs from "fs";
import { Category } from "../entity/Category";
import { Company } from "../entity/Company";
import { ExpenditureImage } from "../entity/ExpenditureImage";
import { ExpenditureItem } from "../entity/ExpenditureItem";
import { Product } from "../entity/Product";
import { Location } from "../entity/Location";

const expenditureRepository = MysqlDataSource.getRepository(Expenditure);
const expenditureItemRepository = MysqlDataSource.getRepository(ExpenditureItem);
const expenditureImageRepository = MysqlDataSource.getRepository(ExpenditureImage);
const productRepository = MysqlDataSource.getRepository(Product);
const categoryRepository = MysqlDataSource.getRepository(Category);
const locationRepository = MysqlDataSource.getRepository(Location);
const companyRepository = MysqlDataSource.getRepository(Company);

export const getExpenditureStats = async (
  req: Request<{}, {}, {}, ExpenditureStatsQuery>,
  res: Response,
  next: NextFunction
) => {
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

  let where: FindOptionsWhere<Expenditure> = {
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

  const userExpenditures = await expenditureRepository.find({
    where: where,
    order: {
      purchaseDate: "DESC",
    },
  });

  return res.json(userExpenditures);
};

export const getUserExpenditures = async (req: Request<{}, {}, {}, ExpenditureQuery>, res: Response) => {
  const { month, year } = req.query;
  const user = res.locals.loggedUser;
  const parsedMonth = MONTHS.indexOf(month) + 1 < 10 ? `0${MONTHS.indexOf(month) + 1}` : `${MONTHS.indexOf(month) + 1}`;

  const userExpenditures = await expenditureRepository.find({
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
};

export const createExpenditure = async (req: Request, res: Response, next: NextFunction) => {
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

  let company = await companyRepository.findOneBy({ name: Like(companyName) });
  if (!company) {
    const newCompany = new Company();
    newCompany.name = companyName;
    company = await companyRepository.save(newCompany);
  }

  let city = await locationRepository.findOneBy({ id: location });
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
      postItems.map(async (item: ExpenditureItemRequest) => {
        const itemCategory = await categoryRepository.findOneBy({ id: item.category });
        if (!itemCategory) {
          return false;
        }
        let itemProduct = await productRepository.findOneBy({ name: Like(item.name) });
        if (!itemProduct) {
          const newProduct = new Product();
          newProduct.name = item.name;
          newProduct.description = "";
          itemProduct = await productRepository.save(newProduct);
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

  const createdExpenditure = await expenditureRepository.save(expenditure);

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

      expenditureImageRepository.save(expenditureImage);
    });
  }

  return res.status(201).json({ message: "Expenditure saved!" });
};

export const updateExpenditure = async (req: Request, res: Response, next: NextFunction) => {
  const { date, totalPrice, company: companyName, location, items } = req.body;
  const user = res.locals.loggedUser;
  const expenditureId = req.params.expenditureId;

  const userExpenditure = await expenditureRepository.findOne({
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

  let company = await companyRepository.findOneBy({ name: Like(companyName) });
  if (!company) {
    const newCompany = new Company();
    newCompany.name = companyName;
    company = await companyRepository.save(newCompany);
  }

  let city = await locationRepository.findOneBy({ id: location });
  if (!city) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  userExpenditure.purchaseDate = moment(new Date(date)).format("YYYY-MM-DD");
  userExpenditure.totalPrice = totalPrice;
  userExpenditure.company = company;
  userExpenditure.location = city;
  userExpenditure.user = user;
  userExpenditure.items.map(async (item) => {
    await expenditureItemRepository.remove(item);
  });
  userExpenditure.items = [];

  const postItems: ExpenditureItemRequest[] = JSON.parse(items);
  if (postItems.length) {
    await Promise.all(
      postItems.map(async (item) => {
        const itemCategory = await categoryRepository.findOneBy({ id: item.category });
        if (!itemCategory) {
          return false;
        }
        let itemProduct = await productRepository.findOneBy({ name: Like(item.name) });
        if (!itemProduct) {
          const newProduct = new Product();
          newProduct.name = item.name;
          newProduct.description = "";
          itemProduct = await productRepository.save(newProduct);
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

  await expenditureRepository.save(userExpenditure);

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

      expenditureImageRepository.save(expenditureImage);
    });
  }

  return res.status(201).json({ message: "Expenditure updated!" });
};

export const deleteExpenditureImage = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.loggedUser;
  const imageId = req.params.imageId;

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
};

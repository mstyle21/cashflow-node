import { Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import { Company } from "../entity/Company";

const companyRepository = MysqlDataSource.getRepository(Company);

export const getAllCompanies = async (req: Request, res: Response) => {
  const companies = await companyRepository.find();

  return res.json(companies);
};

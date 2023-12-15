import { Request, Response } from "express";
import MysqlDataSource from "../config/data-source";
import { Location } from "../entity/Location";

const locationRepository = MysqlDataSource.getRepository(Location);

export const getAllCities = async (req: Request, res: Response) => {
  const cities = await locationRepository.find();

  return res.json(cities);
};

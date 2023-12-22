import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import MysqlDataSource from "../config/data-source";
import { User } from "../entity/User";
import { JWTPayloadData } from "../types";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();

let jwtSecretKey: string;
if (process.env.JWT_SECRET_KEY) {
  jwtSecretKey = process.env.JWT_SECRET_KEY;
} else {
  throw new Error("JWT_SECRET_KEY is not set. Please check .env file.");
}

const userRepository = MysqlDataSource.getRepository(User);

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return res.status(400).json({ message: "Invalid inputs!" });
  }

  let user = await userRepository.findOne({
    where: { email: email },
    relations: ["role"],
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.token) {
      const payload = jwt.decode(user.token) as JwtPayload;
      const nowUnixSeconds = Math.round(Number(new Date()) / 1000);

      if (payload.exp && payload.exp > nowUnixSeconds) {
        return res.json({
          email: user.email,
          token: user.token,
        });
      }
    }

    const payload: JWTPayloadData = {
      time: Date(),
      userId: user.id,
      email: user.email,
      role: user.role.name,
    };
    const token = jwt.sign(payload, jwtSecretKey, {
      expiresIn: "1h",
    });

    user.token = token;
    await userRepository.save(user);

    return res.json({
      email: user.email,
      token: token,
    });
  }

  return res.status(400).json({ message: "Invalid credentials!" });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {};

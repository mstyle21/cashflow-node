/**
 * Required External Modules
 */
import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import bodyParser from "body-parser";

import expenditureRouter from "./routes/expenditures";
import userRouter from "./routes/user";
import companyRouter from "./routes/companies";
import locationRouter from "./routes/cities";
import productRouter from "./routes/products";
import categoryRouter from "./routes/categories";
import { IMG_FOLDER } from "./config";

/**
 * App Variables
 */
dotenv.config();

if (!process.env.APP_PORT || !process.env.APP_URL) {
  console.error("Missing config items: APP_PORT or APP_URL. Please check .env file!");
  process.exit(1);
}

const URL: string = process.env.APP_URL as string;
const PORT: number = parseInt(process.env.APP_PORT as string, 10);

const app = express();

/**
 *  App Configuration
 */

app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());

app.use(cookieParser());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(IMG_FOLDER));

/**
 * Server Activation
 */

app.use("/api/user", userRouter);

app.use("/api/expenditures", expenditureRouter);

app.use("/api/companies", companyRouter);

app.use("/api/cities", locationRouter);

app.use("/api/products", productRouter);

app.use("/api/categories", categoryRouter);

app.listen(PORT, () => {
  console.log(`Server running on ${URL}:${PORT}/`);
});

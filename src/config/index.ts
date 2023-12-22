import dotenv from "dotenv";

dotenv.config();

export const CURRENCY_SIGN = process.env.CURRENCY_SIGN;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const IMG_FOLDER = "uploads/";
export const EXPENDITURES_FOLDER = "uploads/expenditure";
export const EXPENDITURE_QUEUE_FOLDER = "uploads/expenditure_queue";

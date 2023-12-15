export const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
export const CURRENT_YEAR = new Date().getFullYear();
export const CURRENT_MONTH = MONTHS[new Date().getMonth()];
export const CURRENCY_SIGN = "RON";
export const FRONTEND_URL = "http://localhost:5173";

export default function arrayRange(start: number, end: number, step: number = 1) {
  const array = [];

  for (let i = start; i <= end; i += step) {
    array.push(i);
  }

  return array;
}

export function randomHash(length: number = 5): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let hash = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    hash += characters.charAt(randomIndex);
  }

  return hash;
}

export function paginatedResult(filteredItems: unknown[], totalItems: number, perPage: number) {
  return {
    items: filteredItems,
    count: totalItems,
    pages: Math.ceil(totalItems / perPage),
  };
}

export function sleep(time: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

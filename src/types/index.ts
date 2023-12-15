export interface CategoryStatsQuery extends qs.ParsedQs {
  type: "allTime" | "month" | "year";
  month: string;
  year: string;
  category: string;
}
export interface ExpenditureStatsQuery extends qs.ParsedQs {
  type: "allTime" | "month" | "year";
  month: string;
  year: string;
}
export interface PaginationQuery extends qs.ParsedQs {
  page?: string;
  perPage?: string;
}
export type JWTPayloadData = {
  time: string;
  userId: number;
  email: string;
  role: string;
};
export interface ExpenditureQuery extends qs.ParsedQs {
  userId: string;
  month: string;
  year: string;
}
export type ExpenditureItemRequest = {
  hash: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  category: number;
};

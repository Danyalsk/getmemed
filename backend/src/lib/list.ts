import type { ListQuery } from "../contracts/common";

export function toSearchRegex(search: string): RegExp {
  return new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

export function toSkipLimit({ page, pageSize }: ListQuery) {
  return { skip: (page - 1) * pageSize, limit: pageSize };
}

export function toPageResult<T>(items: T[], total: number, { page, pageSize }: ListQuery) {
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

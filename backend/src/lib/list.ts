import type { ListQuery } from "../contracts/common";

/** Case-insensitive "contains" match for user-typed search text. */
export function searchPattern(search: string): RegExp {
  return new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

export function pageWindow({ page, pageSize }: ListQuery) {
  return { skip: (page - 1) * pageSize, limit: pageSize };
}

export function toPage<T>(items: T[], total: number, { page, pageSize }: ListQuery) {
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

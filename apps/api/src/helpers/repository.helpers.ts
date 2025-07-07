import {
  sql,
  SQL,
  and,
  eq,
  ne,
  lt,
  lte,
  gt,
  gte,
  inArray,
  notInArray,
  like,
  ilike,
  isNull,
  isNotNull,
  desc,
  asc,
} from "drizzle-orm";

import type { PgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";
import type {
  FilterOperator,
  Filters,
  Sort,
} from "@miltera/helpers/query-builder";

class QueryBuilder {
  constructor(
    private readonly table: PgTableWithColumns<any>,
    private readonly defaultSort: Sort,
    private readonly allowedFilterFields: string[],
    private readonly allowedSortFields: string[]
  ) {
    this.table = table;
    this.allowedFilterFields = allowedFilterFields;
    this.allowedSortFields = allowedSortFields;
  }

  buildWhereClause(filters: Filters | undefined): SQL | undefined {
    if (!filters || Object.keys(filters).length === 0) return;

    const conditions: SQL[] = [];

    for (const [field, filterValue] of Object.entries(filters)) {
      if (!this.allowedFilterFields.includes(field)) continue;

      const column = this.table[field] as PgColumn;
      if (!column) continue;

      if (typeof filterValue === "object" && filterValue !== null) {
        // Handle operator-based filters
        for (let [operator, value] of Object.entries(filterValue)) {
          // TODO: hotfix for date filters
          if (this.table[field]?.dataType === "date") {
            value = new Date(value as string);
          }

          const condition = this.buildCondition(
            column,
            operator as FilterOperator,
            value
          );
          if (condition) conditions.push(condition);
        }
      } else {
        // Handle simple equality
        conditions.push(eq(column, filterValue));
      }
    }

    return and(...conditions);
  }

  buildOrderByClause(sort: Sort | undefined): SQL {
    if (!sort || sort.length === 0) {
      sort = this.defaultSort;
    }

    return and(
      ...sort
        .filter((s) => this.allowedSortFields.includes(s.field))
        .map((s) => {
          const column = this.table[s.field] as PgColumn;
          return s.order === "desc" ? desc(column) : asc(column);
        })
        .filter(Boolean)
    )!;
  }

  private buildCondition(
    column: PgColumn,
    operator: FilterOperator,
    value: any
  ): SQL | undefined {
    switch (operator) {
      case "$eq":
        return eq(column, value);
      case "$ne":
        return ne(column, value);
      case "$lt":
        return lt(column, value);
      case "$lte":
        return lte(column, value);
      case "$gt":
        return gt(column, value);
      case "$gte":
        return gte(column, value);
      case "$in":
        return Array.isArray(value) ? inArray(column, value) : undefined;
      case "$notIn":
        return Array.isArray(value) ? notInArray(column, value) : undefined;
      case "$contains":
        return like(column, `%${value}%`);
      case "$notContains":
        return sql`${column} NOT LIKE ${`%${value}%`}`;
      case "$containsi":
        return ilike(column, `%${value}%`);
      case "$notContainsi":
        return sql`${column} NOT ILIKE ${`%${value}%`}`;
      case "$startsWith":
        return like(column, `${value}%`);
      case "$endsWith":
        return like(column, `%${value}`);
      case "$null":
        return value ? isNull(column) : isNotNull(column);
      case "$notNull":
        return value ? isNotNull(column) : isNull(column);
      default:
        return undefined;
    }
  }
}

export { QueryBuilder };

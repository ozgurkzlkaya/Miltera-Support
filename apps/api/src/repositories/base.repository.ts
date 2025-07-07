import {
  getTableColumns,
  eq,
  and,
  isNull,
  sql,
  SQL,
  count,
  type BuildQueryResult,
  type DBQueryConfig,
  type ExtractTablesWithRelations,
  getTableName,
} from "drizzle-orm";
import type { PgTableWithColumns, SelectedFields } from "drizzle-orm/pg-core";
import type { Database, Schema } from "../db";
import { QueryBuilder } from "../helpers/repository.helpers";
import {
  type Query,
  defaultPageSize,
  maxPageSize,
  type PaginationResult,
} from "@miltera/helpers/query-builder";
import type { Exact, SetRequired } from "type-fest";

type QueryOptions = Partial<Query> & {
  allowedFilterFields?: string[];
  allowedSortFields?: string[];
};

type ListResultType<T extends any> = Promise<{
  data: T;
  pagination: PaginationResult;
}>;

interface BaseRepository<
  TTable extends PgTableWithColumns<any>,
  TEntity extends Omit<TTable["$inferSelect"], "deletedAt"> = Omit<
    TTable["$inferSelect"],
    "deletedAt"
  >,
> {
  findAll(options?: QueryOptions): ListResultType<TEntity[]>;
  findById(id: string): Promise<TEntity | null>;

  create(data: Omit<TTable["$inferInsert"], "deletedAt">): Promise<TEntity>;
  update(id: string, data: Partial<TEntity>): Promise<TEntity | null>;

  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;

  $TEntity: TEntity;
  $TEntityInsert: Omit<TTable["$inferInsert"], "deletedAt">;
}

abstract class BaseRepositoryImpl<
  TTable extends PgTableWithColumns<any>,
  TEntity extends Omit<TTable["$inferSelect"], "deletedAt"> = Omit<
    TTable["$inferSelect"],
    "deletedAt"
  >,
> implements BaseRepository<TTable, TEntity>
{
  protected abstract readonly table: TTable;

  protected abstract readonly allowedFilterFields: (keyof TTable["_"]["columns"])[];
  protected abstract readonly allowedSortFields: (keyof TTable["_"]["columns"])[];

  protected readonly defaultPageSize = defaultPageSize;
  protected readonly maxPageSize = maxPageSize;

  protected readonly defaultSort = [
    { field: "createdAt", order: "desc" } as const,
  ];

  protected readonly listQueryWithRelationsDefinition =
    {} as const satisfies QueryConfig<TTable["_"]["name"]>;

  protected get idColumn(): TTable["id"] {
    return this.table.id;
  }

  protected get deletedAtColumn(): TTable["deletedAt"] {
    return this.table.deletedAt;
  }

  protected readonly excludeSelectColumns = [
    "deletedAt",
  ] as const satisfies (keyof TTable["_"]["columns"])[];

  constructor(protected readonly db: Database) {}

  /**
   * Find all active (non-deleted) records
   */
  async findAll(options?: QueryOptions): ListResultType<TEntity[]> {
    const allowedFilterFields = (options?.allowedFilterFields ||
      this.allowedFilterFields) as string[];
    const allowedSortFields = (options?.allowedSortFields ||
      this.allowedSortFields) as string[];

    const { where, orderBy, limit, offset, getPagination } =
      await this._findAll({
        ...options,
        allowedFilterFields,
        allowedSortFields,
      });

    const data = (await this._select()
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)) as TEntity[];

    return { data, pagination: await getPagination() };
  }

  async findAllWithRelations(options?: QueryOptions): ListResultType<
    InferQueryModel<
      TTable["_"]["name"],
      //@ts-expect-error
      this["listQueryWithRelationsDefinition"]
    >
  > {
    const allowedFilterFields =
      options?.allowedFilterFields || this.allowedFilterFields;
    const allowedSortFields =
      options?.allowedSortFields || this.allowedSortFields;

    const { where, orderBy, limit, offset, getPagination } =
      await this._findAll({
        ...options,
        allowedFilterFields,
        allowedSortFields,
      });

    const query = this.db.query[getTableName(this.table)].findMany({
      where,
      orderBy,
      ...this.listQueryWithRelationsDefinition,
      limit,
      offset,
    });

    const data = await query;

    return {
      data,
      pagination: await getPagination(),
    };
  }

  /**
   * Internal method to handle query building
   * @internal
   */
  protected async _findAll(
    options: SetRequired<
      QueryOptions,
      "allowedFilterFields" | "allowedSortFields"
    >
  ): Promise<{
    where: SQL | undefined;
    orderBy: SQL;
    limit: number;
    offset: number;
    getPagination: () => Promise<PaginationResult>;
  }> {
    const {
      filters,
      pagination = { page: 1, pageSize: this.defaultPageSize },
      sort,
      allowedFilterFields,
      allowedSortFields,
    } = options;

    const queryBuilder = new QueryBuilder(
      this.table,
      this.defaultSort,
      allowedFilterFields,
      allowedSortFields
    );

    const where = and(
      isNull(this.deletedAtColumn),
      queryBuilder.buildWhereClause(filters)
    );

    const orderBy = queryBuilder.buildOrderByClause(sort);

    const limit = pagination.pageSize;
    const offset = (pagination.page - 1) * pagination.pageSize;

    const getPagination = async () => {
      const total = await this.count(where);
      const pageCount = Math.ceil(total / pagination.pageSize);

      return {
        ...pagination,
        pageCount,
        total,
      };
    };

    return {
      where,
      orderBy,
      limit,
      offset,
      getPagination,
    };
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<TEntity | null> {
    const result = await this._select()
      .where(and(eq(this.idColumn, id), isNull(this.deletedAtColumn)))
      .limit(1);

    return result.length ? (result[0] as TEntity) : null;
  }

  /**
   * Create a new record
   */
  async create(
    data: Omit<TTable["$inferInsert"], "deletedAt">
  ): Promise<TEntity> {
    const result = await this._insert()
      .values(data as any)
      .returning();

    return result[0] as TEntity;
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: Partial<TEntity>): Promise<TEntity | null> {
    const result = (await this._update()
      .set(data)
      .where(and(eq(this.idColumn, id), isNull(this.deletedAtColumn)))
      .returning()) as TEntity[];

    return result.length ? result[0] : null;
  }

  /**
   * Soft delete a record (default delete behavior)
   */
  async delete(id: string): Promise<boolean> {
    return this.softDelete(id);
  }

  /**
   * Soft delete a record by setting deletedAt timestamp
   */
  async softDelete(id: string): Promise<boolean> {
    const result = (await this._update()
      .set({
        deletedAt: sql`now()`,
      })
      .where(eq(this.idColumn, id))
      .returning()) as TEntity[];

    return result.length > 0;
  }

  /**
   * Permanently delete a record from the database
   */
  async hardDelete(id: string): Promise<boolean> {
    const result = await this._delete()
      .where(eq(this.idColumn, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Count the number of records that match the where clause
   */
  async count<T extends SQL>(where?: T): Promise<number> {
    const result = await this._select({ count: count() }).where(where);

    return result.length ? result[0].count : 0;
  }

  /** @internal */
  protected _select<TSelection extends SelectedFields>(fields?: TSelection) {
    const { deletedAt: _, ...columns } = (fields ??
      getTableColumns(this.table)) as any;

    return this.db.select(columns).from(this.table as any);
  }

  /** @internal */
  protected _insert() {
    return this.db.insert(this.table);
  }

  /** @internal */
  protected _update() {
    return this.db.update(this.table);
  }

  /** @internal */
  protected _delete() {
    return this.db.delete(this.table);
  }
}

type DBSchema = ExtractTablesWithRelations<Schema>;

type QueryConfig<TableName extends keyof DBSchema> = DBQueryConfig<
  "one" | "many",
  boolean,
  DBSchema,
  DBSchema[TableName]
>;

type InferQueryModel<
  TableName extends keyof DBSchema,
  QBConfig extends Exact<QueryConfig<TableName>, QBConfig> = {},
> = BuildQueryResult<DBSchema, DBSchema[TableName], QBConfig>;

export { BaseRepositoryImpl };
export type { BaseRepository, QueryOptions };
export type { InferQueryModel, QueryConfig };

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';
import type { Schema } from '../db';

export interface BaseRepository<T> {
  findAll(options?: {
    filters?: Record<string, any>;
    pagination?: { page: number; limit: number };
    sort?: { field: string; direction: 'asc' | 'desc' };
  }): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
}

export abstract class BaseRepositoryImpl<T extends { id: string }> implements BaseRepository<T> {
  protected abstract table: PgTableWithColumns<any>;
  protected abstract idColumn: PgColumn<any>;

  constructor(protected readonly db: PostgresJsDatabase<Schema>) { }

  async findAll(options?: {
    filters?: Record<string, any>;
    pagination?: { page: number; limit: number };
    sort?: { field: string; direction: 'asc' | 'desc' };
  }): Promise<T[]> {
    const { filters, pagination, sort } = options || {};
    const conditions: any[] = [];

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          conditions.push(eq(this.table[key], value));
        }
      });
    }

    const query = this.db.select().from(this.table);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    if (sort) {
      query.orderBy(sort.direction === 'desc' ? desc(this.table[sort.field]) : asc(this.table[sort.field]));
    }

    return query as Promise<T[]>;
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1);

    return result.length ? (result[0] as T) : null;
  }

  async create(data: Partial<T>): Promise<T> {
    const result = await this.db.insert(this.table).values(data as any).returning();
    return result[0] as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const result = await this.db
      .update(this.table)
      .set(data as any)
      .where(eq(this.idColumn, id))
      .returning();

    return result.length ? (result[0] as T) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.idColumn, id))
      .returning();

    return result.length > 0;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const conditions: any[] = [];

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          conditions.push(eq(this.table[key], value));
        }
      });
    }

    const result = await this.db
      .select()
      .from(this.table)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.length;
  }
} 
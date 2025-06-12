import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq, like } from "drizzle-orm";
import { products, productTypes, productModels } from "../db/schema";
import type { Schema } from "../db";
import { BaseRepositoryImpl, type BaseRepository } from "./base.repository";
import type { Product, ProductInsert } from "../schemas/product.schema";

export class ProductRepository
  extends BaseRepositoryImpl<Product>
  implements BaseRepository<Product>
{
  protected table = products;
  protected idColumn = products.id;

  constructor(db: PostgresJsDatabase<Schema>) {
    super(db);
  }

  async create(data: ProductInsert): Promise<Product> {
    return super.create(data);
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    return super.update(id, data);
  }

  async findByName(name: string): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.name, name))
      .limit(1);

    return result.length ? (result[0] as Product) : null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(like(this.table.category, `%${category}%`));

    return result as Product[];
  }

  async findBySerialNumber(serialNumber: string): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.serialNumber, serialNumber))
      .limit(1);

    return result.length ? (result[0] as Product) : null;
  }

  async findByProductType(productTypeId: string): Promise<Product[]> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.productTypeId, productTypeId));

    return result as Product[];
  }

  async findByProductModel(productModelId: string): Promise<Product[]> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.productModelId, productModelId));

    return result as Product[];
  }

  async getProductTypes(): Promise<(typeof productTypes.$inferSelect)[]> {
    const result = await this.db.select().from(productTypes);
    return result;
  }

  async getProductModels(
    productTypeId?: string
  ): Promise<(typeof productModels.$inferSelect)[]> {
    const result = await this.db
      .select()
      .from(productModels)
      .where(
        productTypeId
          ? eq(productModels.productTypeId, productTypeId)
          : undefined
      );

    return result;
  }
}

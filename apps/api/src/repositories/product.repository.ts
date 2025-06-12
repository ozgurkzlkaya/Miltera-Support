import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { products } from "../db/schema";
import type { Schema } from "../db";
import { BaseRepositoryImpl, type BaseRepository } from "./base.repository";
import type {
  Product,
  ProductCreateParams,
  ProductRaw,
  ProductUpdateParams,
} from "../schemas/product.schema";

export class ProductRepository
  extends BaseRepositoryImpl<ProductRaw>
  implements BaseRepository<Product>
{
  protected table = products;
  protected idColumn = products.id;

  constructor(db: PostgresJsDatabase<Schema>) {
    super(db);
  }

  async create(data: ProductCreateParams): Promise<Product> {
    return super.create(data);
  }

  async update(id: string, data: ProductUpdateParams): Promise<Product | null> {
    return super.update(id, data);
  }
}

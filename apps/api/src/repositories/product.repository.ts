import { products } from "../db/schema";
import {
  BaseRepositoryImpl,
  type BaseRepository,
  type InferQueryModel,
  type QueryConfig,
  type QueryOptions,
} from "./base.repository";
import type { PaginationResult } from "../dtos/base.schema";

type ProductsTable = typeof products;
type Repository = BaseRepository<ProductsTable>;

class ProductRepository
  extends BaseRepositoryImpl<ProductsTable>
  implements Repository
{
  protected readonly table = products;

  protected readonly allowedFilterFields = [
    "status",
    "productModelId",
    "ownerId",
    "locationId",
  ] as const satisfies [string, ...string[]];

  protected readonly allowedSortFields = [
    "createdAt",
    "updatedAt",
  ] as const satisfies [string, ...string[]];

  protected static listQueryWithRelationsDefinition = {
    columns: {
      deletedAt: false,
      productModelId: false,
      ownerId: false,
      locationId: false,
    },
    with: {
      productModel: {
        columns: {
          id: true,
          name: true,
          productTypeId: false,
          manufacturerId: false,
        },
        with: {
          productType: {
            columns: {
              id: true,
              name: true,
            },
          },
          manufacturer: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
      owner: {
        columns: {
          id: true,
          name: true,
        },
      },
      location: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  } as const satisfies QueryConfig<"products">;

  async findAllWithRelations(options?: QueryOptions): Promise<{
    data: ProductListWithRelations[];
    pagination: PaginationResult;
  }> {
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

    const query = this.db.query.products.findMany({
      where,
      orderBy,
      ...(this.constructor as typeof ProductRepository)
        .listQueryWithRelationsDefinition,
      limit,
      offset,
    });

    const data = await query;

    return {
      data,
      pagination: await getPagination(),
    };
  }

  async createBulk(data: ProductsTable["$inferInsert"][]) {
    return this._insert().values(data).returning();
  }
}

type ProductListWithRelations = InferQueryModel<
  "products",
  (typeof ProductRepository)["listQueryWithRelationsDefinition"]
>;

export { ProductRepository };
export type { ProductListWithRelations };

import { productModels } from "../db/schema";
import {
  BaseRepositoryImpl,
  type BaseRepository,
  type InferQueryModel,
  type QueryConfig,
  type QueryOptions,
} from "./base.repository";
import type { PaginationResult } from "../dtos/base.schema";

type ProductModelsTable = typeof productModels;
type Repository = BaseRepository<ProductModelsTable>;

class ProductModelRepository
  extends BaseRepositoryImpl<ProductModelsTable>
  implements Repository
{
  protected readonly table = productModels;

  protected readonly allowedFilterFields = ["id", "name"] as const satisfies [
    string,
    ...string[],
  ];

  protected readonly allowedSortFields = [
    "name",
    "createdAt",
    "description",
    "productTypeId",
    "manufacturerId",
  ] as const satisfies [string, ...string[]];

  protected static listQueryWithRelationsDefinition = {
    columns: {
      deletedAt: false,
      productTypeId: false,
      manufacturerId: false,
    },
    with: {
      manufacturer: {
        columns: {
          id: true,
          name: true,
        },
      },
      productType: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  } as const satisfies QueryConfig<"productModels">;

  async findAllWithRelations(options?: QueryOptions): Promise<{
    data: ProductModelListWithRelations[];
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

    const query = this.db.query.productModels.findMany({
      where,
      orderBy,
      ...(this.constructor as typeof ProductModelRepository)
        .listQueryWithRelationsDefinition,
      limit,
      offset,
    });

    const data = await query;

    return {
      data: data as any,
      pagination: await getPagination(),
    };
  }
}

type ProductModelListWithRelations = InferQueryModel<
  "productModels",
  (typeof ProductModelRepository)["listQueryWithRelationsDefinition"]
>;

export { ProductModelRepository };
export type { ProductModelListWithRelations };

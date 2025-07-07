import { productTypes } from "../db/schema";
import { BaseRepositoryImpl, type BaseRepository } from "./base.repository";

type ProductTypesTable = typeof productTypes;
type Repository = BaseRepository<ProductTypesTable>;

class ProductTypeRepository
  extends BaseRepositoryImpl<ProductTypesTable>
  implements Repository
{
  protected readonly table = productTypes;

  protected readonly allowedFilterFields = [
    "name",
    "createdAt",
    "description",
  ] as const satisfies [string, ...string[]];

  protected readonly allowedSortFields = [
    "name",
    "createdAt",
    "description",
  ] as const satisfies [string, ...string[]];
}

export { ProductTypeRepository };

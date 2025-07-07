import { companies } from "../db/schema";
import { BaseRepositoryImpl, type BaseRepository } from "./base.repository";

type CompaniesTable = typeof companies;
type Repository = BaseRepository<CompaniesTable>;

class CompanyRepository
  extends BaseRepositoryImpl<CompaniesTable>
  implements Repository
{
  protected readonly table = companies;

  protected readonly allowedFilterFields = [
    "name",
    "createdAt",
    "address",
    "phone",
    "email",
  ] as const satisfies [string, ...string[]];

  protected readonly allowedSortFields = [
    "name",
    "createdAt",
    "address",
    "phone",
    "email",
  ] as const satisfies [string, ...string[]];
}

export { CompanyRepository };

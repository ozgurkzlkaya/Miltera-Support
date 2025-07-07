import { locations } from "../db/schema";
import { BaseRepositoryImpl, type BaseRepository } from "./base.repository";

type LocationsTable = typeof locations;
type Repository = BaseRepository<LocationsTable>;

class LocationRepository
  extends BaseRepositoryImpl<LocationsTable>
  implements Repository
{
  protected readonly table = locations;

  protected readonly allowedFilterFields = [
    "name",
    "createdAt",
  ] as const satisfies [string, ...string[]];

  protected readonly allowedSortFields = [
    "name",
    "createdAt",
  ] as const satisfies [string, ...string[]];
}

export { LocationRepository };

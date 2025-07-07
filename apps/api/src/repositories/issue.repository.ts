import { issues } from "../db/schema";
import {
  BaseRepositoryImpl,
  type BaseRepository,
  type InferQueryModel,
  type QueryConfig,
  type QueryOptions,
} from "./base.repository";
import type { PaginationResult } from "../dtos/base.schema";

type IssuesTable = typeof issues;
type Repository = BaseRepository<IssuesTable>;

class IssueRepository
  extends BaseRepositoryImpl<IssuesTable>
  implements Repository
{
  protected readonly table = issues;

  protected readonly allowedFilterFields = [
    "id",
    "issueNumber",
  ] as const satisfies [string, ...string[]];

  protected readonly allowedSortFields = [
    "issueNumber",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "companyId",
    "categoryId",
    "internalCategoryId",
    "status",
    "priority",
    "customerDescription",
    "technicianDescription",
  ] as const satisfies [string, ...string[]];

  protected static listQueryWithRelationsDefinition = {
    columns: {
      deletedAt: false,
    },
    with: {
      issueProducts: {
        columns: {
          id: true,
          issueId: true,
          productId: true,
        },
      },
    },
  } as const satisfies QueryConfig<"issues">;

  async findAllWithRelations(options?: QueryOptions): Promise<{
    data: IssueListWithRelations[];
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

    const query = this.db.query.issues.findMany({
      where,
      orderBy,
      ...(this.constructor as typeof IssueRepository)
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

type IssueListWithRelations = InferQueryModel<
  "issues",
  (typeof IssueRepository)["listQueryWithRelationsDefinition"]
>;

export { IssueRepository };
export type { IssueListWithRelations };

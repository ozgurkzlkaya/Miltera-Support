import type { Database } from "../db";
import { IssueRepository } from "../repositories/issue.repository";
import {
  IssueListRequestDto,
  IssueListDto,
  IssueDto,
  IssueCreateDto,
  IssueUpdateDto,
} from "../dtos/issue.dto";

class IssueService {
  private repository: IssueRepository;

  constructor(private db: Database) {
    this.repository = new IssueRepository(db);
  }

  async getAllIssues(
    issueListRequestDto: IssueListRequestDto
  ): Promise<IssueListDto> {
    const options = issueListRequestDto.value;
    const { data, pagination } =
      await this.repository.findAllWithRelations(options);

    return IssueListDto.create({
      data,
      meta: {
        filters: options?.filters,
        sort: options?.sort,
        pagination,
      } as any,
    });
  }

  /**
   * Get issue
   */
  async getIssue(id: string) {
    const issue = await this.repository.findById(id);

    if (!issue) {
      throw new Error("Issue not found");
    }

    return IssueDto.create(issue);
  }

  /**
   * Create a new issue
   */
  async createIssue(issueCreateDto: IssueCreateDto) {
    const issue = await this.repository.create(issueCreateDto.value);

    return IssueDto.create(issue);
  }

  /**
   * Update an existing issue
   */
  async updateIssue(id: string, issueUpdateDto: IssueUpdateDto) {
    const issue = await this.repository.update(id, issueUpdateDto.value);

    if (!issue) {
      throw new Error("Issue not found");
    }

    return IssueDto.create(issue);
  }

  /**
   * Soft delete an issue
   */
  async deleteIssue(id: string): Promise<void> {
    const isFound = await this.repository.delete(id);

    if (!isFound) {
      throw new Error("Issue not found");
    }
  }
}

export { IssueService };

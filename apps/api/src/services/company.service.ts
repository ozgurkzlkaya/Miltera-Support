import type { Database } from "../db";
import { CompanyRepository } from "../repositories/company.repository";
import {
  CompanyDto,
  CompanyListDto,
  CompanyListRequestDto,
  CompanyUpdateDto,
  CompanyCreateDto,
} from "../dtos/company.dto";

class CompanyService {
  private repository: CompanyRepository;

  constructor(private db: Database) {
    this.repository = new CompanyRepository(db);
  }

  /**
   * Get all companies
   */
  async getAllCompanies(companyListRequestDto: CompanyListRequestDto) {
    const options = companyListRequestDto.value;

    const { data, pagination } = await this.repository.findAll(options);

    return CompanyListDto.create({
      data,
      meta: {
        filters: options?.filters,
        sort: options?.sort,
        pagination,
      } as any,
    });
  }

  /**
   * Get company by ID
   */
  async getCompany(id: string): Promise<CompanyDto> {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new Error("Company not found");
    }
    return CompanyDto.create(company);
  }

  /**
   * Create a new company
   */
  async createCompany(companyCreateDto: CompanyCreateDto): Promise<CompanyDto> {
    const company = await this.repository.create(companyCreateDto.value);

    return CompanyDto.create(company);
  }

  /**
   * Update an existing company
   */
  async updateCompany(
    id: string,
    companyUpdateDto: CompanyUpdateDto
  ): Promise<CompanyDto> {
    const company = await this.repository.update(id, companyUpdateDto.value);
    if (!company) {
      throw new Error("Company not found");
    }

    return CompanyDto.create(company);
  }

  /**
   * Soft delete a company
   */
  async deleteCompany(id: string): Promise<void> {
    const isFound = await this.repository.delete(id);

    if (!isFound) {
      throw new Error("Company not found");
    }
  }
}

export { CompanyService };

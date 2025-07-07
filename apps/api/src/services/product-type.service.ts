import type { Database } from "../db";
import { ProductTypeRepository } from "../repositories/product-type.repository";
import {
  ProductTypeListRequestDto,
  ProductTypeListDto,
  ProductTypeCreateDto,
  ProductTypeDto,
  ProductTypeUpdateDto,
} from "../dtos/product-type.dto";

class ProductTypeService {
  private repository: ProductTypeRepository;

  constructor(private db: Database) {
    this.repository = new ProductTypeRepository(db);
  }

  async getAllProductTypes(
    productTypeListRequestDto: ProductTypeListRequestDto
  ): Promise<ProductTypeListDto> {
    const options = productTypeListRequestDto.value;
    const { data, pagination } = await this.repository.findAll(options);

    return ProductTypeListDto.create({
      data,
      meta: {
        filters: options?.filters,
        sort: options?.sort,
        pagination,
      } as any
    });
  }

  /**
   * Get product type by ID
   */
  async getProductType(id: string): Promise<ProductTypeDto> {
    const productType = await this.repository.findById(id);

    if (!productType) {
      throw new Error("Product type not found");
    }

    return ProductTypeDto.create(productType);
  }

  /**
   * Create a new product type
   */
  async createProductType(
    productTypeCreateDto: ProductTypeCreateDto
  ): Promise<ProductTypeDto> {
    const productType = await this.repository.create(
      productTypeCreateDto.value
    );

    return ProductTypeDto.create(productType);
  }

  /**
   * Update an existing product type
   */
  async updateProductType(
    id: string,
    productTypeUpdateDto: ProductTypeUpdateDto
  ): Promise<ProductTypeDto> {
    const productType = await this.repository.update(
      id,
      productTypeUpdateDto.value
    );

    if (!productType) {
      throw new Error("Product type not found");
    }

    return ProductTypeDto.create(productType);
  }

  /**
   * Soft delete a product type
   */
  async deleteProductType(id: string): Promise<void> {
    const isFound = await this.repository.delete(id);

    if (!isFound) {
      throw new Error("Product type not found");
    }
  }
}

export { ProductTypeService };

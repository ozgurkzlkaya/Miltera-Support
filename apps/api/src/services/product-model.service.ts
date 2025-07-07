import type { Database } from "../db";
import { ProductModelRepository } from "../repositories/product-model.repository";
import {
  ProductModelListRequestDto,
  ProductModelListDto,
  ProductModelDto,
  ProductModelCreateDto,
  ProductModelUpdateDto,
} from "../dtos/product-model.dto";

class ProductModelService {
  private repository: ProductModelRepository;

  constructor(private db: Database) {
    this.repository = new ProductModelRepository(db);
  }

  /**
   * Get all product models with optional pagination and sorting
   */
  async getAllProductModels(
    productModelListRequestDto: ProductModelListRequestDto
  ) {
    const options = productModelListRequestDto.value;
    const { data, pagination } =
      await this.repository.findAllWithRelations(options);

    return ProductModelListDto.create({
      data,
      meta: {
        filters: options?.filters,
        sort: options?.sort,
        pagination,
      },
    } as any);
  }

  /**
   * Get product model by ID
   */
  async getProductModel(id: string): Promise<ProductModelDto> {
    const productModel = await this.repository.findById(id);

    if (!productModel) {
      throw new Error("Product model not found");
    }

    return ProductModelDto.create(productModel);
  }

  /**
   * Create a new product model
   */
  async createProductModel(
    productModelCreateDto: ProductModelCreateDto
  ): Promise<ProductModelDto> {
    const productModel = await this.repository.create(
      productModelCreateDto.value
    );

    return ProductModelDto.create(productModel);
  }

  /**
   * Update an existing product model
   */
  async updateProductModel(
    id: string,
    productModelUpdateDto: ProductModelUpdateDto
  ): Promise<ProductModelDto> {
    const productModel = await this.repository.update(
      id,
      productModelUpdateDto.value
    );

    if (!productModel) {
      throw new Error("Product model not found");
    }

    return ProductModelDto.create(productModel);
  }

  /**
   * Soft delete a product model
   */
  async deleteProductModel(id: string): Promise<void> {
    const isFound = await this.repository.delete(id);

    if (!isFound) {
      throw new Error("Product model not found");
    }
  }
}

export { ProductModelService };

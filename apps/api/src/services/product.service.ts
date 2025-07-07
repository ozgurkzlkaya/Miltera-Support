import type { Database } from "../db";
import { ProductRepository } from "../repositories/product.repository";
import { UserRepository } from "../repositories/user.repository";
import {
  ProductListRequestDto,
  ProductListDto,
  ProductDto,
  ProductCreateDto,
  ProductCreateBulkDto,
  ProductUpdateDto,
} from "../dtos/product.dto";
import type { User } from "better-auth";

class ProductService {
  private repository: ProductRepository;
  private userRepository: UserRepository;

  constructor(private db: Database) {
    this.repository = new ProductRepository(db);
    this.userRepository = new UserRepository(db);
  }

  async getAllProductsWithRelations(
    productListRequestDto: ProductListRequestDto
  ): Promise<ProductListDto> {
    const options = productListRequestDto.value;
    const { data, pagination } =
      await this.repository.findAllWithRelations(options);

    return ProductListDto.create({
      data: data as any,
      meta: {
        filters: options?.filters,
        sort: options?.sort,
        pagination,
      } as any,
    });
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    return ProductDto.create(product);
  }

  /**
   * Create a new product
   */
  async createProduct(productCreateDto: ProductCreateDto, user: User | null) {
    if (!user) {
      throw new Error("User not found");
    }

    const productCreationData = {
      ...productCreateDto.value,
      createdBy: user.id,
      updatedBy: user.id,
    };

    const product = await this.repository.create(productCreationData);

    return ProductDto.create(product);
  }

  async createBulkProduct(productCreateBulkDto: ProductCreateBulkDto, user: User | null) {
    if (!user) {
      throw new Error("User not found");
    }

    const productCreationBulkData = productCreateBulkDto.value.resources.map(
      (product) => ({
        ...productCreateBulkDto.value.common,
        ...product,
        createdBy: user.id,
        updatedBy: user.id,
      })
    );

    const products = (await this.repository.createBulk(
      productCreationBulkData as any
    )) as any as any[];

    return ProductListDto.create({
      data: products as any,
      meta: {
        pagination: {
          page: 1,
          pageSize: 10,
          pageCount: 1,
          total: products.length,
        },
      },
    });
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, productUpdateDto: ProductUpdateDto) {
    const product = await this.repository.update(id, productUpdateDto.value);

    if (!product) {
      throw new Error("Product not found");
    }

    return ProductDto.create(product);
  }

  /**
   * Soft delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    const isFound = await this.repository.delete(id);

    if (!isFound) {
      throw new Error("Product not found");
    }
  }
}

export { ProductService };

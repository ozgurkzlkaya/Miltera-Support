import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Schema } from "../db";
import { ResponseHandler } from "../helpers/response.helpers";
import { ProductRepository } from "../repositories/product.repository";
import { serializeProduct } from "../serializers/product.serializer";
import {
  ProductCreateParamsSchema,
  ProductUpdateParamsSchema,
  type ProductCreateParams,
  type ProductUpdateParams,
} from "../schemas/product.schema";

export class ProductService {
  private repository: ProductRepository;

  constructor(private db: PostgresJsDatabase<Schema>) {
    this.repository = new ProductRepository(db);
  }

  async getAllProducts(options?: {
    filters?: Record<string, any>;
    pagination?: { page: number; limit: number };
    sort?: { field: string; direction: "asc" | "desc" };
  }) {
    try {
      const products = (await this.repository.findAll(options)).map((product) =>
        serializeProduct(product)
      );

      return ResponseHandler.success(products);
    } catch (error) {
      return ResponseHandler.internalError("Failed to fetch products");
    }
  }

  async getProductById(id: string) {
    try {
      const product = await this.repository.findById(id);
      if (!product) {
        return ResponseHandler.notFound("Product not found");
      }
      return ResponseHandler.success(serializeProduct(product));
    } catch (error) {
      return ResponseHandler.internalError("Failed to fetch product");
    }
  }

  async createProduct(data: ProductCreateParams) {
    const { data: productData, error: validationError } =
      await ProductCreateParamsSchema.safeParseAsync(data);

    if (validationError) {
      return ResponseHandler.validationError(validationError.message);
    }

    try {
      const product = await this.repository.create(productData);
      return ResponseHandler.success(serializeProduct(product));
    } catch (error) {
      return ResponseHandler.internalError("Failed to create product");
    }
  }

  async updateProduct(id: string, data: ProductUpdateParams) {
    const { data: productData, error: validationError } =
      await ProductUpdateParamsSchema.safeParseAsync(data);

    if (validationError) {
      return ResponseHandler.validationError(validationError.message);
    }

    try {
      const product = await this.repository.update(id, productData);
      if (!product) {
        return ResponseHandler.notFound("Product not found");
      }

      return ResponseHandler.success(serializeProduct(product));
    } catch (error) {
      return ResponseHandler.internalError("Failed to update product");
    }
  }

  async deleteProduct(id: string) {
    try {
      const success = await this.repository.delete(id);
      if (!success) {
        return ResponseHandler.notFound("Product not found");
      }
      return ResponseHandler.status(204);
    } catch (error) {
      return ResponseHandler.internalError("Failed to delete product");
    }
  }
}

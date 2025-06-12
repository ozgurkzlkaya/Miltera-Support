import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Schema } from "../db";
import { ResponseHandler } from "../helpers/response.helpers";
import { ProductRepository } from "../repositories/product.repository";
import { serializeProduct } from "../serializers/product.serializer";
import {
  ProductInsertSchema,
  ProductUpdateSchema,
  type ProductInsert,
  type ProductUpdate,
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

  async createProduct(data: ProductInsert) {
    const { data: productData, error: validationError } =
      await ProductInsertSchema.safeParseAsync(data);

    if (validationError) {
      return ResponseHandler.validationError(validationError.message);
    }

    // Check if product with serial number already exists
    if (productData.serialNumber) {
      const existingProduct = await this.repository.findBySerialNumber(
        productData.serialNumber
      );
      if (existingProduct) {
        return ResponseHandler.validationError(
          "Product with this serial number already exists"
        );
      }
    }

    try {
      const product = await this.repository.create(productData);
      return ResponseHandler.success(serializeProduct(product));
    } catch (error) {
      return ResponseHandler.internalError("Failed to create product");
    }
  }

  async updateProduct(id: string, data: ProductUpdate) {
    const { data: productData, error: validationError } =
      await ProductUpdateSchema.safeParseAsync(data);

    if (validationError) {
      return ResponseHandler.validationError(validationError.message);
    }

    if (productData.serialNumber) {
      const existingProduct = await this.repository.findBySerialNumber(
        productData.serialNumber
      );
      if (existingProduct && existingProduct.id !== id) {
        return ResponseHandler.validationError(
          "Serial number is already in use"
        );
      }
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

  async getProductsByType(productTypeId: string) {
    try {
      const products = (
        await this.repository.findByProductType(productTypeId)
      ).map((product) => serializeProduct(product));
      return ResponseHandler.success(products);
    } catch (error) {
      return ResponseHandler.internalError("Failed to fetch products by type");
    }
  }

  async getProductsByModel(productModelId: string) {
    try {
      const products = (
        await this.repository.findByProductModel(productModelId)
      ).map((product) => serializeProduct(product));
      return ResponseHandler.success(products);
    } catch (error) {
      return ResponseHandler.internalError("Failed to fetch products by model");
    }
  }

  async getProductTypes() {
    try {
      const types = await this.repository.getProductTypes();
      return ResponseHandler.success(types);
    } catch (error) {
      return ResponseHandler.internalError("Failed to fetch product types");
    }
  }

  async getProductModels(productTypeId?: string) {
    try {
      const models = await this.repository.getProductModels(productTypeId);
      return ResponseHandler.success(models);
    } catch (error) {
      return ResponseHandler.internalError("Failed to fetch product models");
    }
  }
}

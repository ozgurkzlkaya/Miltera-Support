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
    // try {
    //   const products = (await this.repository.findAll(options)).map((product) =>
    //     serializeProduct(product)
    //   );

    //   return ResponseHandler.success(products);
    // } catch (error) {
    //   return ResponseHandler.internalError("Failed to fetch products");
    // }

    const d = [
      {
        id: 1,
        name: "Gateway-2000-001",
        serial: "SN123456",
        productTypeId: 1,
        productTypeName: "Gateway",
        productModelId: 1,
        productModelName: "GW-2000",
        manufacturer: "Miltera",
        currentStatus: "ACTIVE",
        warrantyStartDate: "2024-01-15",
        warrantyPeriodMonths: 24,
        productionDate: "2024-01-10",
        companyId: 1,
        companyName: "ABC Enerji",
        stockLocationId: 1,
        stockLocationName: "Ana Depo",
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        name: "EA-100-005",
        serial: "SN654321",
        productTypeId: 2,
        productTypeName: "Energy Analyzer",
        productModelId: 2,
        productModelName: "EA-100",
        manufacturer: "Miltera",
        currentStatus: "IN_SERVICE",
        warrantyStartDate: "2024-02-01",
        warrantyPeriodMonths: 36,
        productionDate: "2024-01-25",
        companyId: 2,
        companyName: "XYZ Elektrik",
        stockLocationId: null, // Customer-owned product
        stockLocationName: null,
        createdAt: "2024-02-01T14:20:00Z",
      },
      {
        id: 3,
        name: "VR-500-012",
        serial: "SN987654",
        productTypeId: 3,
        productTypeName: "VPN Router",
        productModelId: 3,
        productModelName: "VR-500",
        manufacturer: "Miltera",
        currentStatus: "SHIPPED",
        warrantyStartDate: "2024-02-15",
        warrantyPeriodMonths: 12,
        productionDate: "2024-02-10",
        companyId: 3,
        companyName: "DEF Teknoloji",
        stockLocationId: 6,
        stockLocationName: "İkincil Depo",
        createdAt: "2024-02-15T09:15:00Z",
      },
      {
        id: 4,
        name: "SM-300-003",
        serial: "SN456789",
        productTypeId: 4,
        productTypeName: "Smart Meter",
        productModelId: 4,
        productModelName: "SM-300",
        manufacturer: "Miltera",
        currentStatus: "IN_REPAIR",
        warrantyStartDate: "2023-12-01",
        warrantyPeriodMonths: 60,
        productionDate: "2023-11-20",
        companyId: 1,
        companyName: "ABC Enerji",
        stockLocationId: 4,
        stockLocationName: "Servis Merkezi",
        createdAt: "2023-12-01T16:45:00Z",
      },
    ];

    // return ResponseHandler.error("e", "e", 400)

    return ResponseHandler.success(d)
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

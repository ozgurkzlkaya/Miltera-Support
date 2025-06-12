import type { Product } from '../schemas/product.schema';

export function serializeProduct(product: Product) {
  return {
    id: product.id,
    manufacturerId: product.manufacturerId,
    productTypeId: product.productTypeId,
    productModelId: product.productModelId,
    serialNumber: product.serialNumber,
    productionDate: product.productionDate,
    currentStatus: product.currentStatus,
    warrantyStartDate: product.warrantyStartDate,
    warrantyPeriodMonths: product.warrantyPeriodMonths,
    companyId: product.companyId,
    createdById: product.createdById,
    lastUpdatedById: product.lastUpdatedById,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
} 
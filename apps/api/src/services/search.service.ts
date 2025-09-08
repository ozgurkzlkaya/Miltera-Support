import { db } from '../db';
import { 
  products, 
  issues, 
  shipments, 
  companies, 
  users, 
  productTypes, 
  productModels,
  serviceOperations 
} from '../db/schema';
import { 
  eq, 
  and, 
  or, 
  like, 
  ilike, 
  desc, 
  asc, 
  count, 
  sql, 
  between,
  gte,
  lte,
  inArray,
  isNull,
  isNotNull
} from 'drizzle-orm';

export interface SearchFilters {
  status?: string | string[];
  priority?: string | string[];
  type?: string | string[];
  dateRange?: {
    field: string;
    from?: string;
    to?: string;
  };
  companyId?: string;
  assignedTo?: string;
  locationId?: string;
  warrantyStatus?: string;
  productTypeId?: string;
  productModelId?: string;
}

export interface SearchOptions {
  entityType: 'products' | 'issues' | 'shipments' | 'companies' | 'users';
  query?: string;
  filters?: SearchFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeArchived?: boolean;
}

export interface SearchResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  facets?: Record<string, any>;
}

export class SearchService {
  
  /**
   * Advanced search across all entities
   */
  async search<T>(options: SearchOptions): Promise<SearchResult<T>> {
    const {
      entityType,
      query,
      filters = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      includeArchived = false
    } = options;

    const offset = (page - 1) * limit;

    switch (entityType) {
      case 'products':
        return await this.searchProducts(query, filters, sortBy, sortOrder, page, limit, includeArchived);
      case 'issues':
        return await this.searchIssues(query, filters, sortBy, sortOrder, page, limit, includeArchived);
      case 'shipments':
        return await this.searchShipments(query, filters, sortBy, sortOrder, page, limit, includeArchived);
      case 'companies':
        return await this.searchCompanies(query, filters, sortBy, sortOrder, page, limit, includeArchived);
      case 'users':
        return await this.searchUsers(query, filters, sortBy, sortOrder, page, limit, includeArchived);
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  /**
   * Product search with advanced filters
   */
  private async searchProducts(
    query?: string,
    filters: SearchFilters = {},
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page = 1,
    limit = 20,
    includeArchived = false
  ): Promise<SearchResult<any>> {
    const conditions: any[] = [];

    // Text search
    if (query) {
      conditions.push(
        or(
          ilike(products.serialNumber, `%${query}%`),
          ilike(products.notes, `%${query}%`),
          sql`EXISTS (
            SELECT 1 FROM ${productModels} pm 
            WHERE pm.id = ${products.productModelId} 
            AND pm.name ILIKE ${`%${query}%`}
          )`,
          sql`EXISTS (
            SELECT 1 FROM ${productTypes} pt 
            WHERE pt.id = ${products.productTypeId} 
            AND pt.name ILIKE ${`%${query}%`}
          )`
        )
      );
    }

    // Status filter
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(inArray(products.currentStatus, filters.status));
      } else {
        conditions.push(eq(products.currentStatus, filters.status));
      }
    }

    // Company filter
    if (filters.companyId) {
      conditions.push(eq(products.companyId, filters.companyId));
    }

    // Location filter
    if (filters.locationId) {
      conditions.push(eq(products.locationId, filters.locationId));
    }

    // Product type filter
    if (filters.productTypeId) {
      conditions.push(eq(products.productTypeId, filters.productTypeId));
    }

    // Product model filter
    if (filters.productModelId) {
      conditions.push(eq(products.productModelId, filters.productModelId));
    }

    // Warranty status filter
    if (filters.warrantyStatus) {
      const now = new Date();
      switch (filters.warrantyStatus) {
        case 'active':
          conditions.push(
            and(
              isNotNull(products.warrantyStartDate),
              gte(products.warrantyStartDate, now)
            )
          );
          break;
        case 'expired':
          conditions.push(
            and(
              isNotNull(products.warrantyStartDate),
              lte(products.warrantyStartDate, now)
            )
          );
          break;
        case 'no_warranty':
          conditions.push(isNull(products.warrantyStartDate));
          break;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const { field, from, to } = filters.dateRange;
      if (from && to) {
        conditions.push(between(products[field as keyof typeof products], from, to));
      } else if (from) {
        conditions.push(gte(products[field as keyof typeof products], from));
      } else if (to) {
        conditions.push(lte(products[field as keyof typeof products], to));
      }
    }

    // Build query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(products)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get data with relations
    const data = await db
      .select({
        id: products.id,
        serialNumber: products.serialNumber,
        currentStatus: products.currentStatus,
        productionDate: products.productionDate,
        warrantyStartDate: products.warrantyStartDate,
        warrantyPeriodMonths: products.warrantyPeriodMonths,
        locationId: products.locationId,
        companyId: products.companyId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        productType: {
          id: productTypes.id,
          name: productTypes.name,
        },
        productModel: {
          id: productModels.id,
          name: productModels.name,
        },
        company: {
          id: companies.id,
          name: companies.name,
        },
      })
      .from(products)
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .leftJoin(productModels, eq(products.productModelId, productModels.id))
      .leftJoin(companies, eq(products.companyId, companies.id))
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(products[sortBy as keyof typeof products]) : asc(products[sortBy as keyof typeof products]))
      .limit(limit)
      .offset(offset);

    return {
      data,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Issue search with advanced filters
   */
  private async searchIssues(
    query?: string,
    filters: SearchFilters = {},
    sortBy = 'reportedAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page = 1,
    limit = 20,
    includeArchived = false
  ): Promise<SearchResult<any>> {
    const conditions: any[] = [];

    // Text search
    if (query) {
      conditions.push(
        or(
          ilike(issues.issueNumber, `%${query}%`),
          ilike(issues.customerDescription, `%${query}%`),
          ilike(issues.title, `%${query}%`),
          sql`EXISTS (
            SELECT 1 FROM ${products} p 
            WHERE p.id = ${issues.productId} 
            AND p.serial_number ILIKE ${`%${query}%`}
          )`
        )
      );
    }

    // Status filter
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(inArray(issues.status, filters.status));
      } else {
        conditions.push(eq(issues.status, filters.status));
      }
    }

    // Priority filter
    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        conditions.push(inArray(issues.priority, filters.priority));
      } else {
        conditions.push(eq(issues.priority, filters.priority));
      }
    }

    // Company filter
    if (filters.companyId) {
      conditions.push(eq(issues.companyId, filters.companyId));
    }

    // Assigned to filter
    if (filters.assignedTo) {
      conditions.push(eq(issues.assignedTo, filters.assignedTo));
    }

    // Date range filter
    if (filters.dateRange) {
      const { field, from, to } = filters.dateRange;
      if (from && to) {
        conditions.push(between(issues[field as keyof typeof issues], from, to));
      } else if (from) {
        conditions.push(gte(issues[field as keyof typeof issues], from));
      } else if (to) {
        conditions.push(lte(issues[field as keyof typeof issues], to));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(issues)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get data with relations
    const data = await db
      .select({
        id: issues.id,
        issueNumber: issues.issueNumber,
        title: issues.title,
        customerDescription: issues.customerDescription,
        status: issues.status,
        priority: issues.priority,
        reportedAt: issues.reportedAt,
        resolvedAt: issues.resolvedAt,
        assignedTo: issues.assignedTo,
        companyId: issues.companyId,
        productId: issues.productId,
        createdAt: issues.createdAt,
        updatedAt: issues.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
        },
        product: {
          id: products.id,
          serialNumber: products.serialNumber,
        },
        assignedUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(issues)
      .leftJoin(companies, eq(issues.companyId, companies.id))
      .leftJoin(products, eq(issues.productId, products.id))
      .leftJoin(users, eq(issues.assignedTo, users.id))
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(issues[sortBy as keyof typeof issues]) : asc(issues[sortBy as keyof typeof issues]))
      .limit(limit)
      .offset(offset);

    return {
      data,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Shipment search with advanced filters
   */
  private async searchShipments(
    query?: string,
    filters: SearchFilters = {},
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page = 1,
    limit = 20,
    includeArchived = false
  ): Promise<SearchResult<any>> {
    const conditions: any[] = [];

    // Text search
    if (query) {
      conditions.push(
        or(
          ilike(shipments.shipmentNumber, `%${query}%`),
          ilike(shipments.trackingNumber, `%${query}%`),
          ilike(shipments.notes, `%${query}%`)
        )
      );
    }

    // Status filter
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(inArray(shipments.status, filters.status));
      } else {
        conditions.push(eq(shipments.status, filters.status));
      }
    }

    // Type filter
    if (filters.type) {
      if (Array.isArray(filters.type)) {
        conditions.push(inArray(shipments.type, filters.type));
      } else {
        conditions.push(eq(shipments.type, filters.type));
      }
    }

    // Company filter
    if (filters.companyId) {
      conditions.push(eq(shipments.companyId, filters.companyId));
    }

    // Date range filter
    if (filters.dateRange) {
      const { field, from, to } = filters.dateRange;
      if (from && to) {
        conditions.push(between(shipments[field as keyof typeof shipments], from, to));
      } else if (from) {
        conditions.push(gte(shipments[field as keyof typeof shipments], from));
      } else if (to) {
        conditions.push(lte(shipments[field as keyof typeof shipments], to));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(shipments)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get data with relations
    const data = await db
      .select({
        id: shipments.id,
        shipmentNumber: shipments.shipmentNumber,
        type: shipments.type,
        status: shipments.status,
        trackingNumber: shipments.trackingNumber,
        estimatedDelivery: shipments.estimatedDelivery,
        actualDelivery: shipments.actualDelivery,
        notes: shipments.notes,
        companyId: shipments.companyId,
        createdAt: shipments.createdAt,
        updatedAt: shipments.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
        },
      })
      .from(shipments)
      .leftJoin(companies, eq(shipments.companyId, companies.id))
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(shipments[sortBy as keyof typeof shipments]) : asc(shipments[sortBy as keyof typeof shipments]))
      .limit(limit)
      .offset(offset);

    return {
      data,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Company search
   */
  private async searchCompanies(
    query?: string,
    filters: SearchFilters = {},
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page = 1,
    limit = 20,
    includeArchived = false
  ): Promise<SearchResult<any>> {
    const conditions: any[] = [];

    // Text search
    if (query) {
      conditions.push(
        or(
          ilike(companies.name, `%${query}%`),
          ilike(companies.email, `%${query}%`),
          ilike(companies.contactPersonName, `%${query}%`),
          ilike(companies.address, `%${query}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(companies)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get data
    const data = await db
      .select()
      .from(companies)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(companies[sortBy as keyof typeof companies]) : asc(companies[sortBy as keyof typeof companies]))
      .limit(limit)
      .offset(offset);

    return {
      data,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * User search
   */
  private async searchUsers(
    query?: string,
    filters: SearchFilters = {},
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page = 1,
    limit = 20,
    includeArchived = false
  ): Promise<SearchResult<any>> {
    const conditions: any[] = [];

    // Text search
    if (query) {
      conditions.push(
        or(
          ilike(users.email, `%${query}%`),
          ilike(users.firstName, `%${query}%`),
          ilike(users.lastName, `%${query}%`)
        )
      );
    }

    // Role filter
    if (filters.status) { // Using status field for role filter
      if (Array.isArray(filters.status)) {
        conditions.push(inArray(users.role, filters.status));
      } else {
        conditions.push(eq(users.role, filters.status));
      }
    }

    // Company filter
    if (filters.companyId) {
      conditions.push(eq(users.companyId, filters.companyId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get data with relations
    const data = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        companyId: users.companyId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
        },
      })
      .from(users)
      .leftJoin(companies, eq(users.companyId, companies.id))
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(users[sortBy as keyof typeof users]) : asc(users[sortBy as keyof typeof users]))
      .limit(limit)
      .offset(offset);

    return {
      data,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions(entityType: string, query: string, limit = 10): Promise<string[]> {
    if (!query || query.length < 2) return [];

    switch (entityType) {
      case 'products':
        const productSuggestions = await db
          .select({ serialNumber: products.serialNumber })
          .from(products)
          .where(ilike(products.serialNumber, `%${query}%`))
          .limit(limit);
        return productSuggestions.map(p => p.serialNumber).filter(Boolean);

      case 'issues':
        const issueSuggestions = await db
          .select({ issueNumber: issues.issueNumber })
          .from(issues)
          .where(ilike(issues.issueNumber, `%${query}%`))
          .limit(limit);
        return issueSuggestions.map(i => i.issueNumber).filter(Boolean);

      case 'shipments':
        const shipmentSuggestions = await db
          .select({ shipmentNumber: shipments.shipmentNumber })
          .from(shipments)
          .where(ilike(shipments.shipmentNumber, `%${query}%`))
          .limit(limit);
        return shipmentSuggestions.map(s => s.shipmentNumber).filter(Boolean);

      case 'companies':
        const companySuggestions = await db
          .select({ name: companies.name })
          .from(companies)
          .where(ilike(companies.name, `%${query}%`))
          .limit(limit);
        return companySuggestions.map(c => c.name).filter(Boolean);

      default:
        return [];
    }
  }

  /**
   * Get search facets for filtering
   */
  async getSearchFacets(entityType: string): Promise<Record<string, any>> {
    switch (entityType) {
      case 'products':
        const productStatuses = await db
          .select({ status: products.currentStatus, count: count() })
          .from(products)
          .groupBy(products.currentStatus);

        const productTypes = await db
          .select({ type: productTypes.name, count: count() })
          .from(products)
          .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
          .groupBy(productTypes.name);

        return {
          statuses: productStatuses,
          types: productTypes,
        };

      case 'issues':
        const issueStatuses = await db
          .select({ status: issues.status, count: count() })
          .from(issues)
          .groupBy(issues.status);

        const issuePriorities = await db
          .select({ priority: issues.priority, count: count() })
          .from(issues)
          .groupBy(issues.priority);

        return {
          statuses: issueStatuses,
          priorities: issuePriorities,
        };

      case 'shipments':
        const shipmentStatuses = await db
          .select({ status: shipments.status, count: count() })
          .from(shipments)
          .groupBy(shipments.status);

        const shipmentTypes = await db
          .select({ type: shipments.type, count: count() })
          .from(shipments)
          .groupBy(shipments.type);

        return {
          statuses: shipmentStatuses,
          types: shipmentTypes,
        };

      default:
        return {};
    }
  }
}

export const searchService = new SearchService();

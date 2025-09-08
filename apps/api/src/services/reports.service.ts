import { db } from '../db/client';
import { products, issues, shipments, serviceOperations, users, companies } from '../db/schema';
import { eq, and, gte, lte, count, sql } from 'drizzle-orm';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export class ReportsService {
  // Dashboard istatistikleri
  static async getDashboardStats() {
    try {
      // Toplam ürün sayısı
      const totalProducts = await db.select({ count: count() }).from(products);
      
      // Aktif arıza sayısı (OPEN, IN_PROGRESS)
      const activeIssues = await db.select({ count: count() })
        .from(issues)
        .where(sql`${issues.status} IN ('OPEN', 'IN_PROGRESS')`);
      
      // Tamamlanan tamir sayısı (son 30 gün)
      const thirtyDaysAgo = subDays(new Date(), 30);
      const completedRepairs = await db.select({ count: count() })
        .from(serviceOperations)
        .where(and(
          eq(serviceOperations.status, 'COMPLETED'),
          gte(serviceOperations.completedAt!, thirtyDaysAgo)
        ));
      
      // Toplam sevkiyat sayısı
      const totalShipments = await db.select({ count: count() }).from(shipments);
      
      // Ürün durumlarına göre dağılım
      const productsByStatus = await db.select({
        status: products.status,
        count: count()
      })
      .from(products)
      .groupBy(products.status);
      
      // Arıza durumlarına göre dağılım
      const issuesByStatus = await db.select({
        status: issues.status,
        count: count()
      })
      .from(issues)
      .groupBy(issues.status);
      
      // Son aktiviteler (son 10 kayıt)
      const recentActivity = await db.select({
        id: products.id,
        type: sql`'product'`,
        description: sql`CONCAT('Ürün durumu güncellendi: ', ${products.status})`,
        timestamp: products.updatedAt
      })
      .from(products)
      .orderBy(sql`${products.updatedAt} DESC`)
      .limit(10);
      
      return {
        totalProducts: totalProducts[0]?.count || 0,
        activeIssues: activeIssues[0]?.count || 0,
        completedRepairs: completedRepairs[0]?.count || 0,
        totalShipments: totalShipments[0]?.count || 0,
        productsByStatus: productsByStatus.reduce((acc, item) => {
          acc[item.status] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        issuesByStatus: issuesByStatus.reduce((acc, item) => {
          acc[item.status] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        recentActivity: recentActivity.map(item => ({
          id: item.id,
          type: item.type,
          description: item.description,
          timestamp: item.timestamp?.toISOString()
        }))
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // Ürün analizi
  static async getProductAnalysis(startDate?: string, endDate?: string) {
    try {
      const whereConditions = [];
      
      if (startDate && endDate) {
        whereConditions.push(
          and(
            gte(products.createdAt, new Date(startDate)),
            lte(products.createdAt, new Date(endDate))
          )
        );
      }
      
      // Toplam ürün sayısı
      const totalProducts = await db.select({ count: count() })
        .from(products)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
      
      // Ürün durumlarına göre dağılım
      const productsByStatus = await db.select({
        status: products.status,
        count: count()
      })
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(products.status);
      
      // Garanti durumuna göre dağılım
      const warrantyStatus = await db.select({
        warrantyStatus: sql`CASE 
          WHEN ${products.warrantyStartDate} IS NULL THEN 'NO_WARRANTY'
          WHEN ${products.warrantyStartDate} + INTERVAL '1 month' * ${products.warrantyPeriodMonths} > NOW() THEN 'IN_WARRANTY'
          ELSE 'OUT_OF_WARRANTY'
        END`,
        count: count()
      })
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(sql`CASE 
        WHEN ${products.warrantyStartDate} IS NULL THEN 'NO_WARRANTY'
        WHEN ${products.warrantyStartDate} + INTERVAL '1 month' * ${products.warrantyPeriodMonths} > NOW() THEN 'IN_WARRANTY'
        ELSE 'OUT_OF_WARRANTY'
      END`);
      
      // Aylık üretim
      const monthlyProduction = await db.select({
        month: sql`DATE_TRUNC('month', ${products.createdAt})`,
        count: count()
      })
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(sql`DATE_TRUNC('month', ${products.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${products.createdAt})`);
      
      return {
        totalProducts: totalProducts[0]?.count || 0,
        productsByStatus: productsByStatus.reduce((acc, item) => {
          acc[item.status] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        warrantyStatus: warrantyStatus.reduce((acc, item) => {
          acc[item.warrantyStatus] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        monthlyProduction: monthlyProduction.map(item => ({
          month: format(new Date(item.month as string), 'yyyy-MM'),
          count: Number(item.count)
        }))
      };
    } catch (error) {
      console.error('Error getting product analysis:', error);
      throw error;
    }
  }

  // Arıza analizi
  static async getIssueAnalysis(startDate?: string, endDate?: string, category?: string) {
    try {
      const whereConditions = [];
      
      if (startDate && endDate) {
        whereConditions.push(
          and(
            gte(issues.createdAt, new Date(startDate)),
            lte(issues.createdAt, new Date(endDate))
          )
        );
      }
      
      if (category) {
        whereConditions.push(eq(issues.category, category));
      }
      
      // Toplam arıza sayısı
      const totalIssues = await db.select({ count: count() })
        .from(issues)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
      
      // Önceliğe göre dağılım
      const issuesByPriority = await db.select({
        priority: issues.priority,
        count: count()
      })
      .from(issues)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(issues.priority);
      
      // Ortalama çözüm süresi
      const avgResolutionTime = await db.select({
        avgTime: sql`AVG(EXTRACT(EPOCH FROM (${issues.resolvedAt} - ${issues.createdAt})) / 3600)`
      })
      .from(issues)
      .where(and(
        sql`${issues.resolvedAt} IS NOT NULL`,
        whereConditions.length > 0 ? and(...whereConditions) : undefined
      ));
      
      // Aylık arıza sayıları
      const issuesByMonth = await db.select({
        month: sql`DATE_TRUNC('month', ${issues.createdAt})`,
        count: count()
      })
      .from(issues)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(sql`DATE_TRUNC('month', ${issues.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${issues.createdAt})`);
      
      return {
        totalIssues: totalIssues[0]?.count || 0,
        issuesByPriority: issuesByPriority.reduce((acc, item) => {
          acc[item.priority] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        averageResolutionTime: Number(avgResolutionTime[0]?.avgTime || 0),
        issuesByMonth: issuesByMonth.map(item => ({
          month: format(new Date(item.month as string), 'yyyy-MM'),
          count: Number(item.count)
        }))
      };
    } catch (error) {
      console.error('Error getting issue analysis:', error);
      throw error;
    }
  }

  // Şirket sayısı
  static async getCompaniesCount() {
    try {
      const result = await db.select({ count: count() }).from(companies);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting companies count:', error);
      throw error;
    }
  }

  // Kullanıcı sayısı
  static async getUsersCount() {
    try {
      const result = await db.select({ count: count() }).from(users);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting users count:', error);
      throw error;
    }
  }

  // Son aktiviteler (genişletilmiş)
  static async getRecentActivity(limit: number = 20) {
    try {
      // Ürün aktiviteleri
      const productActivities = await db.select({
        id: products.id,
        type: sql`'product'`,
        title: sql`CONCAT('Ürün: ', ${products.serialNumber})`,
        description: sql`CONCAT('Durum güncellendi: ', ${products.status})`,
        timestamp: products.updatedAt,
        status: products.status,
        priority: sql`NULL`
      })
      .from(products)
      .orderBy(sql`${products.updatedAt} DESC`)
      .limit(limit);

      // Arıza aktiviteleri
      const issueActivities = await db.select({
        id: issues.id,
        type: sql`'issue'`,
        title: sql`CONCAT('Arıza: ', ${issues.issueNumber})`,
        description: issues.description,
        timestamp: issues.updatedAt,
        status: issues.status,
        priority: issues.priority
      })
      .from(issues)
      .orderBy(sql`${issues.updatedAt} DESC`)
      .limit(limit);

      // Sevkiyat aktiviteleri
      const shipmentActivities = await db.select({
        id: shipments.id,
        type: sql`'shipment'`,
        title: sql`CONCAT('Sevkiyat: ', ${shipments.shipmentNumber})`,
        description: sql`CONCAT('Durum: ', ${shipments.status})`,
        timestamp: shipments.updatedAt,
        status: shipments.status,
        priority: sql`NULL`
      })
      .from(shipments)
      .orderBy(sql`${shipments.updatedAt} DESC`)
      .limit(limit);

      // Tüm aktiviteleri birleştir ve sırala
      const allActivities = [
        ...productActivities,
        ...issueActivities,
        ...shipmentActivities
      ].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);

      return allActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp?.toISOString(),
        status: activity.status,
        priority: activity.priority
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw error;
    }
  }

  // Trend verileri
  static async getTrendsData(days: number = 7) {
    try {
      const startDate = subDays(new Date(), days);
      
      // Son X günde oluşturulan arızalar
      const issuesCreated = await db.select({ count: count() })
        .from(issues)
        .where(gte(issues.createdAt, startDate));

      // Son X günde çözülen arızalar
      const issuesResolved = await db.select({ count: count() })
        .from(issues)
        .where(and(
          gte(issues.resolvedAt!, startDate),
          sql`${issues.resolvedAt} IS NOT NULL`
        ));

      // Son X günde eklenen ürünler
      const productsAdded = await db.select({ count: count() })
        .from(products)
        .where(gte(products.createdAt, startDate));

      // Son X günde oluşturulan sevkiyatlar
      const shipmentsCreated = await db.select({ count: count() })
        .from(shipments)
        .where(gte(shipments.createdAt, startDate));

      return {
        issuesCreated: issuesCreated[0]?.count || 0,
        issuesResolved: issuesResolved[0]?.count || 0,
        productsAdded: productsAdded[0]?.count || 0,
        shipmentsCreated: shipmentsCreated[0]?.count || 0
      };
    } catch (error) {
      console.error('Error getting trends data:', error);
      throw error;
    }
  }

  // Performans raporu
  static async getPerformanceReport(startDate?: string, endDate?: string, technicianId?: string) {
    try {
      const whereConditions = [];
      
      if (startDate && endDate) {
        whereConditions.push(
          and(
            gte(serviceOperations.operationDate, new Date(startDate)),
            lte(serviceOperations.operationDate, new Date(endDate))
          )
        );
      }
      
      if (technicianId) {
        whereConditions.push(eq(serviceOperations.technicianId, technicianId));
      }
      
      // Teknisyen performansları
      const technicianPerformance = await db.select({
        technicianId: serviceOperations.technicianId,
        totalOperations: count(),
        completedOperations: count(sql`CASE WHEN ${serviceOperations.status} = 'COMPLETED' THEN 1 END`),
        avgDuration: sql`AVG(${serviceOperations.duration})`
      })
      .from(serviceOperations)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(serviceOperations.technicianId);
      
      // Teknisyen isimlerini al
      const technicianIds = technicianPerformance.map(t => t.technicianId);
      const technicians = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(users)
      .where(sql`${users.id} = ANY(${technicianIds})`);
      
      // Takım performansı
      const teamPerformance = await db.select({
        totalOperations: count(),
        avgResolutionTime: sql`AVG(${serviceOperations.duration})`,
        successRate: sql`(COUNT(CASE WHEN ${serviceOperations.status} = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(*))`
      })
      .from(serviceOperations)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
      
      return {
        technicianPerformance: technicianPerformance.map(t => {
          const technician = technicians.find(tech => tech.id === t.technicianId);
          const successRate = Number(t.totalOperations) > 0 
            ? (Number(t.completedOperations) / Number(t.totalOperations)) * 100 
            : 0;
          
          return {
            technicianId: t.technicianId,
            technicianName: technician 
              ? `${technician.firstName} ${technician.lastName}`
              : 'Bilinmeyen Teknisyen',
            totalOperations: Number(t.totalOperations),
            completedOperations: Number(t.completedOperations),
            averageDuration: Number(t.avgDuration || 0),
            successRate: Math.round(successRate * 10) / 10
          };
        }),
        teamPerformance: {
          totalOperations: Number(teamPerformance[0]?.totalOperations || 0),
          averageResolutionTime: Number(teamPerformance[0]?.avgResolutionTime || 0),
          customerSatisfaction: 4.2 // TODO: Implement customer satisfaction calculation
        }
      };
    } catch (error) {
      console.error('Error getting performance report:', error);
      throw error;
    }
  }
}

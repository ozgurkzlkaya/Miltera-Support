import { auth } from "../lib/auth";
import { redisClient } from "../lib/redis";
import { reset, seed } from "drizzle-seed";
import { db } from "./client";
import * as schema from "./schema";
import { UserRepository } from "../repositories/user.repository";
import { 
  companies, 
  users, 
  productTypes, 
  productModels, 
  locations, 
  issueCategories, 
    internalIssueCategories,
  products,
  issues,
  shipments,
  serviceOperations
} from "./schema";
import { v4 as uuidv4 } from 'uuid';
import { subDays, addDays } from 'date-fns';

async function seeder() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Create a test company (Miltera)
    console.log("Creating Miltera company...");
    const milteraCompanyId = uuidv4();
    await db.insert(companies).values({
      id: milteraCompanyId,
      name: "Miltera Teknoloji",
      address: "İstanbul, Türkiye",
      phone: "+90 212 555 0123",
      email: "info@miltera.com.tr",
      contactPersonName: "Ahmet",
      contactPersonSurname: "Yılmaz",
      contactPersonEmail: "ahmet.yilmaz@miltera.com.tr",
      contactPersonPhone: "+90 532 555 0123",
      isManufacturer: true,
    });

    // 2. Create a test customer company
    console.log("Creating test customer company...");
    const customerCompanyId = uuidv4();
    await db.insert(companies).values({
      id: customerCompanyId,
      name: "Test Müşteri A.Ş.",
      address: "Ankara, Türkiye",
      phone: "+90 312 555 0123",
      email: "info@testmusteri.com",
      contactPersonName: "Mehmet",
      contactPersonSurname: "Demir",
      contactPersonEmail: "mehmet.demir@testmusteri.com",
      contactPersonPhone: "+90 533 555 0123",
      isManufacturer: false,
    });

    // 3. Create admin user with password
    console.log("Creating admin user...");
    const adminUserId = uuidv4();
    
    // Create user manually with hashed password
    await db.insert(users).values({
      id: adminUserId,
      firstName: "Admin",
      lastName: "User",
      email: "admin@miltera.com.tr",
      emailVerified: true,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: false,
      // Password will be set by better-auth on first login
    });

    // 4. Create TSP users with password
    console.log("Creating TSP users...");
    const tspUserId = uuidv4();
    const ahmetUserId = uuidv4();
    const mehmetUserId = uuidv4();
    const ayseUserId = uuidv4();
    const fatmaUserId = uuidv4();
    const aliUserId = uuidv4();
    
    await db.insert(users).values([
      {
        id: tspUserId,
        firstName: "Teknik",
        lastName: "Servis",
        email: "tsp@miltera.com.tr",
        emailVerified: true,
        role: "TSP",
        isActive: true,
        mustChangePassword: false,
      },
      {
        id: ahmetUserId,
        firstName: "Ahmet",
        lastName: "Yılmaz",
        email: "ahmet.yilmaz@miltera.com.tr",
        emailVerified: true,
        role: "TSP",
        isActive: true,
        mustChangePassword: false,
      },
      {
        id: mehmetUserId,
        firstName: "Mehmet",
        lastName: "Demir",
        email: "mehmet.demir@miltera.com.tr",
        emailVerified: true,
        role: "TSP",
        isActive: true,
        mustChangePassword: false,
      },
      {
        id: ayseUserId,
        firstName: "Ayşe",
        lastName: "Kaya",
        email: "ayse.kaya@miltera.com.tr",
        emailVerified: true,
        role: "TSP",
        isActive: true,
        mustChangePassword: false,
      },
      {
        id: fatmaUserId,
        firstName: "Fatma",
        lastName: "Özkan",
        email: "fatma.ozkan@miltera.com.tr",
        emailVerified: true,
        role: "TSP",
        isActive: true,
        mustChangePassword: false,
      },
      {
        id: aliUserId,
        firstName: "Ali",
        lastName: "Çelik",
        email: "ali.celik@miltera.com.tr",
        emailVerified: true,
        role: "TSP",
        isActive: true,
        mustChangePassword: false,
      }
    ]);

    // 5. Create customer user with password
    console.log("Creating customer user...");
    const customerUserId = uuidv4();
    
    await db.insert(users).values({
      id: customerUserId,
      firstName: "Müşteri",
      lastName: "Kullanıcı",
      email: "musteri@testmusteri.com",
      emailVerified: true,
      role: "CUSTOMER",
      companyId: customerCompanyId,
      isActive: true,
      mustChangePassword: false,
    });

    // 6. Create product types
    console.log("Creating product types...");
    const energyAnalyzerTypeId = uuidv4();
    const gatewayTypeId = uuidv4();
    const vpnRouterTypeId = uuidv4();

    await db.insert(productTypes).values([
      {
        id: energyAnalyzerTypeId,
        name: "Enerji Analizörü",
        description: "Elektrik enerji analizi yapan cihazlar",
      },
      {
        id: gatewayTypeId,
        name: "Ağ Geçidi",
        description: "Endüstriyel ağ geçidi cihazları",
      },
      {
        id: vpnRouterTypeId,
        name: "VPN Router",
        description: "Güvenli VPN bağlantısı sağlayan router'lar",
      },
    ]);

    // 7. Create product models
    console.log("Creating product models...");
    const ea1000ModelId = uuidv4();
    const ea2000ModelId = uuidv4();
    const gw500ModelId = uuidv4();
    const vpn100ModelId = uuidv4();

    await db.insert(productModels).values([
      {
        id: ea1000ModelId,
        productTypeId: energyAnalyzerTypeId,
        manufacturerId: milteraCompanyId,
        name: "EA-1000",
        description: "Tek fazlı enerji analizörü",
      },
      {
        id: ea2000ModelId,
        productTypeId: energyAnalyzerTypeId,
        manufacturerId: milteraCompanyId,
        name: "EA-2000",
        description: "Üç fazlı enerji analizörü",
      },
      {
        id: gw500ModelId,
        productTypeId: gatewayTypeId,
        manufacturerId: milteraCompanyId,
        name: "GW-500",
        description: "Endüstriyel ağ geçidi",
      },
      {
        id: vpn100ModelId,
        productTypeId: vpnRouterTypeId,
        manufacturerId: milteraCompanyId,
        name: "VPN-100",
        description: "Güvenli VPN router",
      },
    ]);

    // 8. Create locations
    console.log("Creating locations...");
    const mainWarehouseId = uuidv4();
    const serviceCenterId = uuidv4();
    const shelfA1Id = uuidv4();
    const shelfB1Id = uuidv4();

    await db.insert(locations).values([
      {
        id: mainWarehouseId,
        name: "Ana Depo",
        type: "WAREHOUSE",
        address: "İstanbul, Türkiye",
        notes: "Ana üretim deposu",
      },
      {
        id: serviceCenterId,
        name: "Servis Merkezi",
        type: "SERVICE_AREA",
        address: "İstanbul, Türkiye",
        notes: "Teknik servis merkezi",
      },
      {
        id: shelfA1Id,
        name: "Raf A-1",
        type: "SHELF",
        address: "Ana Depo, Raf A-1",
        notes: "Enerji analizörleri rafı",
      },
      {
        id: shelfB1Id,
        name: "Raf B-1",
        type: "SHELF",
        address: "Ana Depo, Raf B-1",
        notes: "Ağ geçitleri rafı",
      },
    ]);

    // 9. Create issue categories
    console.log("Creating issue categories...");
    const hardwareIssueId = uuidv4();
    const softwareIssueId = uuidv4();
    const connectionIssueId = uuidv4();
    const calibrationIssueId = uuidv4();

    await db.insert(issueCategories).values([
      {
        id: hardwareIssueId,
        name: "Donanım Arızası",
        description: "Fiziksel donanım problemleri",
        isActive: true,
      },
      {
        id: softwareIssueId,
        name: "Yazılım Hatası",
        description: "Yazılım ve konfigürasyon problemleri",
        isActive: true,
      },
      {
        id: connectionIssueId,
        name: "Bağlantı Problemi",
        description: "Ağ ve iletişim problemleri",
        isActive: true,
      },
      {
        id: calibrationIssueId,
        name: "Kalibrasyon",
        description: "Kalibrasyon ve ayar ihtiyaçları",
        isActive: true,
      },
    ]);

    // 10. Create internal issue categories
    console.log("Creating internal issue categories...");
    await db.insert(internalIssueCategories).values([
      {
        name: "Üretim Hatası",
        description: "Üretim sürecinde oluşan hatalar",
        isActive: true,
      },
      {
        name: "Kalite Kontrol",
        description: "Kalite kontrol sürecinde tespit edilen problemler",
        isActive: true,
      },
      {
        name: "Test Hatası",
        description: "Test sürecinde tespit edilen problemler",
        isActive: true,
      },
    ]);

    // 11. Create sample products
    console.log("Creating sample products...");
    const productIds = [];
    
    // EA-1000 products
    for (let i = 1; i <= 50; i++) {
      const productId = uuidv4();
      productIds.push(productId);
      await db.insert(products).values({
        id: productId,
        productModelId: ea1000ModelId,
        productTypeId: energyAnalyzerTypeId,
        serialNumber: `EA1000-${String(i).padStart(4, '0')}`,
        status: i <= 20 ? 'FIRST_PRODUCTION' : i <= 35 ? 'READY_FOR_SHIPMENT' : i <= 45 ? 'SHIPPED' : 'DELIVERED',
        currentStatus: i <= 20 ? 'FIRST_PRODUCTION' : i <= 35 ? 'READY_FOR_SHIPMENT' : i <= 45 ? 'SHIPPED' : 'DELIVERED',
        productionDate: subDays(new Date(), Math.floor(Math.random() * 180)),
        productionEntryBy: adminUserId,
        warrantyPeriodMonths: 24,
        warrantyStatus: i <= 45 ? 'PENDING' : 'IN_WARRANTY',
        locationId: i <= 20 ? shelfA1Id : null,
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });
    }

    // EA-2000 products
    for (let i = 1; i <= 30; i++) {
      const productId = uuidv4();
      productIds.push(productId);
      await db.insert(products).values({
        id: productId,
        productModelId: ea2000ModelId,
        productTypeId: energyAnalyzerTypeId,
        serialNumber: `EA2000-${String(i).padStart(4, '0')}`,
        status: i <= 10 ? 'FIRST_PRODUCTION' : i <= 20 ? 'READY_FOR_SHIPMENT' : i <= 25 ? 'SHIPPED' : 'DELIVERED',
        currentStatus: i <= 10 ? 'FIRST_PRODUCTION' : i <= 20 ? 'READY_FOR_SHIPMENT' : i <= 25 ? 'SHIPPED' : 'DELIVERED',
        productionDate: subDays(new Date(), Math.floor(Math.random() * 180)),
        productionEntryBy: adminUserId,
        warrantyPeriodMonths: 24,
        warrantyStatus: i <= 25 ? 'PENDING' : 'IN_WARRANTY',
        locationId: i <= 10 ? shelfA1Id : null,
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });
    }

    // GW-500 products
    for (let i = 1; i <= 40; i++) {
      const productId = uuidv4();
      productIds.push(productId);
      await db.insert(products).values({
        id: productId,
        productModelId: gw500ModelId,
        productTypeId: gatewayTypeId,
        serialNumber: `GW500-${String(i).padStart(4, '0')}`,
        status: i <= 15 ? 'FIRST_PRODUCTION' : i <= 25 ? 'READY_FOR_SHIPMENT' : i <= 35 ? 'SHIPPED' : 'DELIVERED',
        currentStatus: i <= 15 ? 'FIRST_PRODUCTION' : i <= 25 ? 'READY_FOR_SHIPMENT' : i <= 35 ? 'SHIPPED' : 'DELIVERED',
        productionDate: subDays(new Date(), Math.floor(Math.random() * 180)),
        productionEntryBy: adminUserId,
        warrantyPeriodMonths: 24,
        warrantyStatus: i <= 35 ? 'PENDING' : 'IN_WARRANTY',
        locationId: i <= 15 ? shelfB1Id : null,
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });
    }

    // VPN-100 products
    for (let i = 1; i <= 30; i++) {
      const productId = uuidv4();
      productIds.push(productId);
      await db.insert(products).values({
        id: productId,
        productModelId: vpn100ModelId,
        productTypeId: vpnRouterTypeId,
        serialNumber: `VPN100-${String(i).padStart(4, '0')}`,
        status: i <= 10 ? 'FIRST_PRODUCTION' : i <= 20 ? 'READY_FOR_SHIPMENT' : i <= 25 ? 'SHIPPED' : 'DELIVERED',
        currentStatus: i <= 10 ? 'FIRST_PRODUCTION' : i <= 20 ? 'READY_FOR_SHIPMENT' : i <= 25 ? 'SHIPPED' : 'DELIVERED',
        productionDate: subDays(new Date(), Math.floor(Math.random() * 180)),
        productionEntryBy: adminUserId,
        warrantyPeriodMonths: 24,
        warrantyStatus: i <= 25 ? 'PENDING' : 'IN_WARRANTY',
        locationId: i <= 10 ? shelfB1Id : null,
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });
    }

    // 12. Create sample issues
    console.log("Creating sample issues...");
    const issueIds = [];
    
    for (let i = 1; i <= 25; i++) {
      const issueId = uuidv4();
      issueIds.push(issueId);
      const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];
      const status = i <= 5 ? 'OPEN' : i <= 15 ? 'IN_PROGRESS' : 'CLOSED';
      const priority = i <= 5 ? 'HIGH' : i <= 15 ? 'MEDIUM' : 'LOW';
      
      await db.insert(issues).values({
        id: issueId,
        issueNumber: `2506${String(i).padStart(2, '0')}`,
        productId: randomProduct,
        customerId: customerCompanyId,
        companyId: customerCompanyId,
        reportedBy: customerUserId,
        assignedTo: i <= 15 ? tspUserId : null,
        title: `Test Arıza ${i}`,
        description: `Test arıza açıklaması ${i}`,
        status: status,
        priority: priority,
        source: 'CUSTOMER',
        issueCategoryId: hardwareIssueId,
        isUnderWarranty: true,
        reportedAt: subDays(new Date(), Math.floor(Math.random() * 30)),
        assignedAt: i <= 15 ? subDays(new Date(), Math.floor(Math.random() * 15)) : null,
        resolvedAt: i > 15 ? subDays(new Date(), Math.floor(Math.random() * 10)) : null,
        preInspectedBy: i <= 15 ? tspUserId : null,
        repairedBy: i > 15 ? tspUserId : null,
      });
    }

    // 13. Create sample service operations
    console.log("Creating sample service operations...");
    
    const technicianIds = [tspUserId, ahmetUserId, mehmetUserId, ayseUserId, fatmaUserId, aliUserId];
    
    for (let i = 0; i < 50; i++) {
      const operationId = uuidv4();
      const issueId = issueIds[i % issueIds.length];
      const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];
      const randomTechnician = technicianIds[Math.floor(Math.random() * technicianIds.length)];
      const status = i < 35 ? 'COMPLETED' : i < 45 ? 'IN_PROGRESS' : 'PENDING';
      const cost = Math.floor(Math.random() * 5000) + 1000; // 1000-6000 TL
      const duration = Math.floor(Math.random() * 180) + 30; // 30-210 minutes
      
      await db.insert(serviceOperations).values({
        id: operationId,
        issueId: issueId,
        productId: randomProduct,
        technicianId: randomTechnician,
        performedBy: randomTechnician,
        operationType: 'REPAIR',
        status: status,
        description: `Test servis operasyonu ${i + 1}`,
        findings: `Test bulgular ${i + 1}`,
        actionsTaken: `Test işlemler ${i + 1}`,
        operationDate: subDays(new Date(), Math.floor(Math.random() * 30)),
        startedAt: subDays(new Date(), Math.floor(Math.random() * 30)),
        completedAt: status === 'COMPLETED' ? subDays(new Date(), Math.floor(Math.random() * 20)) : null,
        duration: duration,
        cost: cost,
        isUnderWarranty: true,
      });
    }

    // 14. Create sample shipments
    console.log("Creating sample shipments...");
    
    for (let i = 1; i <= 20; i++) {
      const shipmentId = uuidv4();
      const status = i <= 5 ? 'PREPARING' : i <= 15 ? 'SHIPPED' : 'DELIVERED';
      
      await db.insert(shipments).values({
        id: shipmentId,
        shipmentNumber: `SH${String(i).padStart(4, '0')}`,
        type: 'SALES',
        status: status,
        fromLocationId: mainWarehouseId,
        toCompanyId: customerCompanyId,
        companyId: customerCompanyId,
        trackingNumber: `TRK${String(i).padStart(6, '0')}`,
        notes: `Test sevkiyat ${i}`,
        estimatedDelivery: addDays(new Date(), Math.floor(Math.random() * 7) + 1),
        actualDelivery: i > 15 ? subDays(new Date(), Math.floor(Math.random() * 5)) : null,
        shippedAt: i > 5 ? subDays(new Date(), Math.floor(Math.random() * 10)) : null,
        deliveredAt: i > 15 ? subDays(new Date(), Math.floor(Math.random() * 5)) : null,
        createdBy: adminUserId,
      });
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(`Created Miltera company: ${milteraCompanyId}`);
    console.log(`Created customer company: ${customerCompanyId}`);
    console.log(`Created admin user: ${adminUserId}`);
    console.log(`Created TSP user: ${tspUserId}`);
    console.log(`Created customer user: ${customerUserId}`);
    console.log(`Created ${productIds.length} products`);
    console.log(`Created ${issueIds.length} issues`);
    console.log(`Created 20 shipments`);

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await redisClient.quit();
  }
}

seeder();

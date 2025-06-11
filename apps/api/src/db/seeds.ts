import { encrypt } from "../lib/encryption";
import { client, db } from "./client";
import {
  companies,
  productTypes,
  productModels,
  products,
  users,
  userRoleEnum,
} from "./schema";

async function seedProducts() {
  try {
    // Create a company (Miltera)
    const [miltera] = await db
      .insert(companies)
      .values({
        name: "Miltera",
        email: "info@miltera.com",
        phone: "+90 212 123 4567",
        address: "Istanbul, Turkey",
        taxNumber: "1234567890",
      })
      .returning();

    // Create product types
    const [inverterType] = await db
      .insert(productTypes)
      .values({
        name: "Solar Inverter",
        description: "Solar power conversion equipment",
      })
      .returning();

    // Create product models
    const [inverterModel] = await db
      .insert(productModels)
      .values({
        productTypeId: inverterType.id,
        name: "MLT-5000",
        description: "5000W Grid-Tie Solar Inverter",
      })
      .returning();

    // Create sample products
    const sampleProducts = await db
      .insert(products)
      .values([
        {
          manufacturerId: miltera.id,
          productTypeId: inverterType.id,
          productModelId: inverterModel.id,
          serialNumber: "MLT-2024-001",
          productionDate: new Date(),
          currentStatus: "NEW",
          warrantyStartDate: new Date(),
          warrantyPeriodMonths: 24,
          createdById: miltera.id,
          lastUpdatedById: miltera.id,
        },
        {
          manufacturerId: miltera.id,
          productTypeId: inverterType.id,
          productModelId: inverterModel.id,
          serialNumber: "MLT-2024-002",
          productionDate: new Date(),
          currentStatus: "NEW",
          warrantyStartDate: new Date(),
          warrantyPeriodMonths: 24,
          createdById: miltera.id,
          lastUpdatedById: miltera.id,
        },
      ])
      .returning();

    console.log("✅ Products seeded successfully:");
    console.log("- Company:", miltera.name);
    console.log("- Product type:", inverterType.name);
    console.log("- Product model:", inverterModel.name);
    console.log("- Products created:", sampleProducts.length);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  }
}

async function seedUsers() {
  try {
    // Insert new users
    await db.insert(users).values([
      {
        email: "admin@example.com",
        password: encrypt("admin123"),
        firstName: "Admin",
        lastName: "User",
        role: userRoleEnum.enumValues[0], // ADMIN
        isActive: true,
      },
      {
        email: "tsp@example.com",
        password: encrypt("tsp123"),
        firstName: "TSP",
        lastName: "User",
        role: userRoleEnum.enumValues[1], // TSP
        isActive: true,
      },
      {
        email: "customer@example.com",
        password: encrypt("customer123"),
        firstName: "Customer",
        lastName: "User",
        role: userRoleEnum.enumValues[2], // CUSTOMER
        isActive: true,
      },
    ]);

    console.log("✅ Users seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // await seedProducts();
    await seedUsers();
    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();

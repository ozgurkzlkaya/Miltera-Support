"use client";

import { Box, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { Layout } from "../../../components/Layout";
import { CustomerProductsGrid, type CustomerProduct } from "../../../components/customer/CustomerProductsGrid";

// Generate sample data for a company with many products
const generateProducts = (): CustomerProduct[] => {
  const productTypes = ["Gateway-2000", "Energy Analyzer", "VPN Router", "Smart Meter", "IoT Sensor", "Power Monitor", "Network Switch", "Industrial PC"];
  const locations = [
    "İstanbul Fabrika - Ana Bina",
    "İstanbul Fabrika - Üretim Hattı A",
    "İstanbul Fabrika - Üretim Hattı B",
    "İstanbul Fabrika - Depo",
    "Ankara Ofis",
    "Ankara Fabrika",
    "İzmir Şube",
    "Bursa Tesisi",
    "Adana Üretim Merkezi",
    "Kocaeli Fabrika",
    "Gaziantep Şube",
    "Antalya Ofis"
  ];
  const statuses: CustomerProduct["status"][] = ["Operational", "Under Service", "Inactive", "Maintenance Required"];
  
  const products: CustomerProduct[] = [];
  
  for (let i = 1; i <= 150; i++) {
    const productType = productTypes[Math.floor(Math.random() * productTypes.length)] || "Gateway-2000";
    const location = locations[Math.floor(Math.random() * locations.length)] || "İstanbul Fabrika - Ana Bina";
    const status = statuses[Math.floor(Math.random() * statuses.length)] || "Operational";
    
    // Generate random dates
    const installationDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const warrantyExpiry = new Date(installationDate);
    warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + 2 + Math.floor(Math.random() * 3)); // 2-5 years warranty
    
    const lastService = new Date(installationDate);
    lastService.setMonth(lastService.getMonth() + Math.floor(Math.random() * 24)); // Random service date
    
    products.push({
      id: i,
      name: productType,
      serialNumber: `${productType.substring(0, 2).toUpperCase()}${String(i).padStart(6, '0')}`,
      installationDate: installationDate.toISOString().split('T')[0] || "2023-01-01",
      warrantyExpiry: warrantyExpiry.toISOString().split('T')[0] || "2025-01-01",
      status,
      location,
      lastService: lastService.toISOString().split('T')[0] || "2024-01-01",
    });
  }
  
  return products;
};

const myProducts: CustomerProduct[] = generateProducts();

export default function CustomerProductsPage() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Layout title="Şirket Ürünleri">
      <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <CustomerProductsGrid
          products={myProducts}
          onViewProduct={(productId) =>
            setSnackbar({
              open: true,
              message: `Ürün #${productId} detayları görüntüleniyor...`,
              severity: "info",
            })
          }
          onRequestService={(productId) => {
            const product = myProducts.find((p) => p.id === productId);
            setSnackbar({
              open: true,
              message: `${product?.name} için servis talebiniz oluşturuluyor...`,
              severity: "info",
            });
          }}
          onViewDetails={(productId) =>
            setSnackbar({
              open: true,
              message: `Ürün #${productId} ayrıntılı bilgileri açılıyor...`,
              severity: "info",
            })
          }
          onExportProducts={() =>
            setSnackbar({
              open: true,
              message: "Ürün listesi Excel formatında dışa aktarılıyor...",
              severity: "info",
            })
          }
          onBulkService={(productIds) =>
            setSnackbar({
              open: true,
              message: `${productIds.length} ürün için toplu servis talebi oluşturuluyor...`,
              severity: "success",
            })
          }
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
} 
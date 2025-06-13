"use client";

import { Box, Chip, Avatar, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, CardContent, Stack, Tab, Tabs, Alert } from "@mui/material";
import { Layout } from "../../../components/Layout";
import { DataTable, TableColumn } from "../../../components/DataTable";
import { useState } from "react";
import { 
  Build as RepairIcon,
  Science as TestIcon,
  CheckCircle as QualityIcon,
  Assessment as InitialIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  Inventory as PartsIcon,
} from "@mui/icons-material";

// Sample service operations data - filtered for current customer
const customerServiceOperations = [
  {
    id: 1,
    issueId: 1,
    issueNumber: "ARZ-2024-001",
    productName: "Gateway-2000-001",
    productSerial: "SN123456",
    operationType: "INITIAL_TEST",
    performedByName: "John Doe",
    performedByRole: "Teknik Servis Uzmanı",
    description: "Cihazda başlangıç tanılama testleri gerçekleştirildi",
    findings: "Ağ yapılandırma sorunları tespit edildi, güvenlik duvarının belirli portları engellediği belirlendi",
    actionsTaken: "Ağ ayarları yeniden yapılandırıldı, gerekli portlar (8080, 8443) açıldı",
    partsUsed: [
      { partName: "Ağ Kablosu CAT6", quantity: 2 },
      { partName: "Ethernet Portu", quantity: 1 }
    ],
    testResults: {
      "Ağ Gecikmesi": "12ms",
      "Veri Hızı": "950 Mbps",
      "Bağlantı Kararlılığı": "98%",
      "Hata Oranı": "0.01%"
    },
    operationDate: "2024-06-02T10:30:00Z",
    duration: 120,
    status: "COMPLETED",
    createdAt: "2024-06-02T10:30:00Z",
  },
  {
    id: 2,
    issueId: 1,
    issueNumber: "ARZ-2024-001",
    productName: "Gateway-2000-001",
    productSerial: "SN123456",
    operationType: "REPAIR",
    performedByName: "John Doe",
    performedByRole: "Teknik Servis Uzmanı",
    description: "Firmware güncellemesi ve donanım bileşeni değişimi",
    findings: "Eski firmware versiyonu 2.1.0, arızalı ethernet portu tespit edildi",
    actionsTaken: "Firmware 2.3.1 versiyonuna güncellendi, arızalı ethernet portu değiştirildi",
    partsUsed: [
      { partName: "Ethernet Port Modülü", quantity: 1 },
      { partName: "Termal Macun", quantity: 1 }
    ],
    testResults: {
      "Firmware Versiyonu": "2.3.1",
      "Port Fonksiyonalitesi": "100%",
      "Sinyal Gücü": "-45dBm",
      "Sıcaklık": "42°C"
    },
    operationDate: "2024-06-03T14:20:00Z",
    duration: 180,
    status: "COMPLETED",
    createdAt: "2024-06-03T14:20:00Z",
  },
  {
    id: 3,
    issueId: 1,
    issueNumber: "ARZ-2024-001",
    productName: "Gateway-2000-001",
    productSerial: "SN123456",
    operationType: "FINAL_TEST",
    performedByName: "John Doe",
    performedByRole: "Teknik Servis Uzmanı",
    description: "Onarım sonrası kapsamlı final test işlemleri",
    findings: "Tüm sistemler çalışır durumda, ağ bağlantısı stabil",
    actionsTaken: "Tam fonksiyon testi yapıldı, stres testi uygulandı, performans ölçümleri alındı",
    partsUsed: [],
    testResults: {
      "Sistem Durumu": "Optimal",
      "Ağ Performansı": "100%",
      "Uptime Testi": "24 saat kesintisiz",
      "Güvenlik Taraması": "Tüm testler başarılı"
    },
    operationDate: "2024-06-04T09:15:00Z",
    duration: 90,
    status: "COMPLETED",
    createdAt: "2024-06-04T09:15:00Z",
  },
];

// Helper functions
const getOperationTypeColor = (type: string) => {
  switch (type) {
    case "INITIAL_TEST": return "info";
    case "REPAIR": return "warning";
    case "FINAL_TEST": return "success";
    case "QUALITY_CHECK": return "secondary";
    default: return "default";
  }
};

const getOperationTypeIcon = (type: string) => {
  switch (type) {
    case "INITIAL_TEST": return <InitialIcon />;
    case "REPAIR": return <RepairIcon />;
    case "FINAL_TEST": return <TestIcon />;
    case "QUALITY_CHECK": return <QualityIcon />;
    default: return <AssignmentIcon />;
  }
};

const getOperationTypeLabel = (type: string) => {
  switch (type) {
    case "INITIAL_TEST": return "Başlangıç Testi";
    case "REPAIR": return "Onarım";
    case "FINAL_TEST": return "Final Testi";
    case "QUALITY_CHECK": return "Kalite Kontrolü";
    default: return type;
  }
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours} saat ${mins} dakika` : `${mins} dakika`;
};

const columns: TableColumn[] = [
  { 
    id: "issueNumber", 
    label: "Arıza No", 
    width: 140,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    ),
  },
  { 
    id: "operationType", 
    label: "İşlem Türü", 
    width: 160,
    render: (value, row) => (
      <Chip
        icon={getOperationTypeIcon(value)}
        label={getOperationTypeLabel(value)}
        color={getOperationTypeColor(value)}
        size="small"
        variant="outlined"
      />
    ),
  },
  { 
    id: "productName", 
    label: "Ürün", 
    width: 200,
    render: (value, row) => (
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          S/N: {row.productSerial}
        </Typography>
      </Box>
    ),
  },
  { 
    id: "performedByName", 
    label: "Teknisyen", 
    width: 180,
    render: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
          {value.split(' ').map((n: string) => n[0]).join('')}
        </Avatar>
        <Box>
          <Typography variant="body2">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.performedByRole}
          </Typography>
        </Box>
      </Box>
    ),
  },
  { 
    id: "description", 
    label: "Açıklama", 
    width: 300,
    render: (value) => (
      <Typography variant="body2" sx={{ 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {value}
      </Typography>
    ),
  },
  { 
    id: "operationDate", 
    label: "Tarih", 
    width: 120,
    format: (value) => new Date(value).toLocaleDateString('tr-TR'),
  },
  { 
    id: "duration", 
    label: "Süre", 
    width: 100,
    render: (value) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TimerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2">
          {formatDuration(value)}
        </Typography>
      </Box>
    ),
  },
];

export default function CustomerServiceOperationsPage() {
  const [serviceOperations, setServiceOperations] = useState(customerServiceOperations);
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; operation: any }>({ open: false, operation: null });
  const [tabValue, setTabValue] = useState(0);

  const handleViewDetails = (operation: any) => {
    setDetailsDialog({ open: true, operation });
  };

  // Add click handler to view details
  const enhancedColumns = columns.map(col => {
    if (col.id === 'description') {
      return {
        ...col,
        render: (value: string, row: any) => (
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => handleViewDetails(row)}
          >
            {value}
          </Typography>
        ),
      };
    }
    return col;
  });

  // Filter operations based on selected tab
  const filteredOperations = tabValue === 0 
    ? serviceOperations 
    : serviceOperations.filter(op => op.operationType === ['INITIAL_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK'][tabValue - 1]);

  return (
    <Layout title="Servis İşlemleri">
      <Box sx={{ width: "100%", height: "100%" }}>
        {/* Header with info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Servis İşlemleri
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Bu sayfada cihazlarınıza yapılan tüm servis işlemlerini görebilirsiniz. 
              Her işlem detayına tıklayarak yapılan çalışmaların ayrıntılarını inceleyebilirsiniz.
            </Typography>
          </Alert>
          
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mt: 2 }}>
            <Tab label="Tüm İşlemler" />
            <Tab label="Başlangıç Testleri" />
            <Tab label="Onarımlar" />
            <Tab label="Final Testleri" />
            <Tab label="Kalite Kontrolleri" />
          </Tabs>
        </Box>

        <DataTable
          title="Servis İşlemleri Geçmişi"
          columns={enhancedColumns}
          data={filteredOperations}
          formFields={[]} // Read-only for customers
          searchable={true}
          selectable={false}
        />

        {/* Details Dialog */}
        <Dialog 
          open={detailsDialog.open} 
          onClose={() => setDetailsDialog({ open: false, operation: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Servis İşlemi Detayları
          </DialogTitle>
          <DialogContent>
            {detailsDialog.operation && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                {/* Basic Info */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Temel Bilgiler</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Arıza No</Typography>
                        <Typography variant="body1">{detailsDialog.operation.issueNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ürün</Typography>
                        <Typography variant="body1">
                          {detailsDialog.operation.productName} ({detailsDialog.operation.productSerial})
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">İşlem Türü</Typography>
                        <Chip
                          icon={getOperationTypeIcon(detailsDialog.operation.operationType)}
                          label={getOperationTypeLabel(detailsDialog.operation.operationType)}
                          color={getOperationTypeColor(detailsDialog.operation.operationType)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Teknisyen</Typography>
                        <Typography variant="body1">{detailsDialog.operation.performedByName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tarih</Typography>
                        <Typography variant="body1">
                          {new Date(detailsDialog.operation.operationDate).toLocaleString('tr-TR')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Süre</Typography>
                        <Typography variant="body1">
                          {formatDuration(detailsDialog.operation.duration)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Description and Findings */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Yapılan İşlemler ve Bulgular</Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>İşlem Açıklaması</Typography>
                        <Typography variant="body1">{detailsDialog.operation.description}</Typography>
                      </Box>
                      {detailsDialog.operation.findings && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Tespit Edilen Sorunlar</Typography>
                          <Typography variant="body1">{detailsDialog.operation.findings}</Typography>
                        </Box>
                      )}
                      {detailsDialog.operation.actionsTaken && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Alınan Aksiyonlar</Typography>
                          <Typography variant="body1">{detailsDialog.operation.actionsTaken}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Parts Used */}
                {detailsDialog.operation.partsUsed && detailsDialog.operation.partsUsed.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PartsIcon />
                        Kullanılan Parçalar
                      </Typography>
                      <Stack spacing={1}>
                        {detailsDialog.operation.partsUsed.map((part: any, index: number) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">{part.partName}</Typography>
                            <Chip label={`Adet: ${part.quantity}`} size="small" />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Test Results */}
                {detailsDialog.operation.testResults && Object.keys(detailsDialog.operation.testResults).length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TestIcon />
                        Test Sonuçları
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        {Object.entries(detailsDialog.operation.testResults).map(([key, value]) => (
                          <Box key={key}>
                            <Typography variant="body2" color="text.secondary">
                              {key}
                            </Typography>
                            <Typography variant="body1">{String(value)}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog({ open: false, operation: null })}>
              Kapat
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
} 
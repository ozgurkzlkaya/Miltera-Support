'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  SwapHoriz as MoveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  QrCodeScanner as QrCodeIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Layout } from '../../../components/Layout';
import { BarcodeScanner } from '../../../components/BarcodeScanner';

interface Location {
  id: string;
  name: string;
  type: string;
  address?: string;
  notes?: string;
  capacity?: number;
  currentCount?: number;
}

interface InventoryItem {
  locationId: string;
  locationName: string;
  locationType: string;
  status: string;
  count: number;
  productId?: string;
  serialNumber?: string;
  productModel?: {
    id: string;
    name: string;
  };
  productType?: {
    id: string;
    name: string;
  };
  manufacturer?: {
    id: string;
    name: string;
  };
}

interface WarehouseStats {
  totalLocations: number;
  usedLocations: number;
  totalStockProducts: number;
  totalCustomerProducts: number;
  statusStats: Array<{
    status: string;
    count: number;
  }>;
}

interface StockAlert {
  type: string;
  message: string;
  details: any[];
  severity?: 'error' | 'warning' | 'info' | 'success';
  count?: number;
  action?: string;
}

const getLocationTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    'WAREHOUSE': 'Depo',
    'SHELF': 'Raf',
    'SERVICE_AREA': 'Servis Alanı',
    'TESTING_AREA': 'Test Alanı',
    'SHIPPING_AREA': 'Sevkiyat Alanı',
  };
  return types[type] || type;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'FIRST_PRODUCTION':
      return 'default';
    case 'FIRST_PRODUCTION_ISSUE':
      return 'error';
    case 'READY_FOR_SHIPMENT':
      return 'success';
    case 'SHIPPED':
      return 'info';
    case 'UNDER_REPAIR':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  const statusLabels: { [key: string]: string } = {
    'FIRST_PRODUCTION': 'İlk Üretim',
    'FIRST_PRODUCTION_ISSUE': 'İlk Üretim Arıza',
    'FIRST_PRODUCTION_SCRAPPED': 'İlk Üretim Hurda',
    'READY_FOR_SHIPMENT': 'Sevkiyat Hazır',
    'SHIPPED': 'Sevk Edildi',
    'ISSUE_CREATED': 'Arıza Kaydı Oluşturuldu',
    'RECEIVED': 'Cihaz Teslim Alındı',
    'PRE_TEST_COMPLETED': 'Servis Ön Testi Yapıldı',
    'UNDER_REPAIR': 'Cihaz Tamir Edilmekte',
    'SERVICE_SCRAPPED': 'Servis Hurda',
    'DELIVERED': 'Teslim Edildi'
  };
  return statusLabels[status] || status;
};

export default function WarehousePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openBulkMoveDialog, setOpenBulkMoveDialog] = useState(false);
  const [openInventoryCountDialog, setOpenInventoryCountDialog] = useState(false);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [openCapacityDialog, setOpenCapacityDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Filter and search state
  const [filters, setFilters] = useState({
    searchTerm: '',
    locationType: '',
    productStatus: '',
    manufacturer: '',
    sortBy: 'locationName',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Notification state
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [openAnalyticsDialog, setOpenAnalyticsDialog] = useState(false);

  // Barcode scanner state
  const [openBarcodeScanner, setOpenBarcodeScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    notes: '',
    capacity: ''
  });
  
  // Bulk move form data
  const [bulkMoveData, setBulkMoveData] = useState({
    targetLocationId: '',
    reason: ''
  });
  
  // Inventory count form data
  const [inventoryCountData, setInventoryCountData] = useState({
    locationId: '',
    countedBy: '3383f9bf-1b18-4174-b080-6a114bf457e5', // Test user ID
    countedItems: [] as Array<{
      productId: string;
      expectedQuantity: number;
      actualQuantity: number;
      notes?: string;
    }>
  });

  // Inventory count history
  const [inventoryCountHistory, setInventoryCountHistory] = useState<any[]>([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openCountDetailsDialog, setOpenCountDetailsDialog] = useState(false);
  const [selectedCountDetails, setSelectedCountDetails] = useState<any>(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Gerçek API'den veri çekme fonksiyonu
  const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Gerçek API çağrıları - Warehouse locations API'sini kullan
        const locationsResponse = await fetch('http://localhost:3015/api/v1/warehouse/locations', {
          headers,
        });

        let fetchedLocations: Location[] = [];
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          // Silinmiş konumları filtrele (deletedAt null olanları al)
          fetchedLocations = (locationsData.data || []).filter((loc: any) => !loc.deletedAt);
          setLocations(fetchedLocations);
        } else {
          console.error('Failed to load locations:', await locationsResponse.text());
          setLocations([]);
        }

        // Ürünleri yükle
        const productsResponse = await fetch('http://localhost:3015/api/v1/products', {
          headers,
        });

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.data || []);
        } else {
          console.error('Failed to load products:', await productsResponse.text());
          setProducts([]);
        }


        // Try to fetch inventory from API, fallback to products API
        try {
          const inventoryResponse = await fetch('http://localhost:3015/api/v1/warehouse/inventory', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            setInventory(inventoryData.data || []);
          } else {
            // Fallback: Products API'den veri çek
            const productsResponse = await fetch('http://localhost:3015/api/v1/products', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (productsResponse.ok) {
              const productsData = await productsResponse.json();
              // Products verilerini inventory formatına dönüştür
              const inventoryItems: InventoryItem[] = productsData.data
                .filter((product: any) => product.locationId)
                .map((product: any) => ({
                  locationId: product.locationId,
                  locationName: product.location?.name || 'Konum Yok',
                  locationType: product.location?.type || 'UNKNOWN',
                  status: product.status,
                  count: 1,
                  productId: product.id,
                  serialNumber: product.serialNumber,
                  productModel: product.productModel,
                  productType: product.productType,
                  manufacturer: product.manufacturer,
                }));
              setInventory(inventoryItems);
            } else {
              setInventory([]);
            }
          }
        } catch (error) {
          console.error('Failed to load inventory:', error);
          setInventory([]);
        }

        // Try to fetch stats from API, fallback to manual calculation
        try {
          const statsResponse = await fetch('http://localhost:3015/api/v1/warehouse/stats', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            // Stats'ı filtreli konumlarla güncelle
            const filteredStats = {
              ...statsData.data,
              totalLocations: fetchedLocations.length,
              usedLocations: fetchedLocations.filter(loc => (loc.currentCount || 0) > 0).length
            };
            setStats(filteredStats);
          } else {
            // Fallback: Manual calculation
            const warehouseStats: WarehouseStats = {
              totalLocations: fetchedLocations.length,
              usedLocations: fetchedLocations.filter(loc => (loc.currentCount || 0) > 0).length,
              totalStockProducts: 0,
              totalCustomerProducts: 0,
              statusStats: [],
            };
            setStats(warehouseStats);
          }
        } catch (error) {
          console.error('Failed to load stats:', error);
          setStats({
            totalLocations: fetchedLocations.length,
            usedLocations: fetchedLocations.length,
            totalStockProducts: 0,
            totalCustomerProducts: 0,
            statusStats: [],
          });
        }

        // Try to fetch alerts from API, fallback to empty array
        try {
          const alertsResponse = await fetch('http://localhost:3015/api/v1/warehouse/alerts', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (alertsResponse.ok) {
            const alertsData = await alertsResponse.json();
            setAlerts(alertsData.data || []);
          } else {
            setAlerts([]);
          }
        } catch (error) {
          console.error('Failed to load alerts:', error);
          setAlerts([]);
        }
      } catch (err) {
        console.error('Error fetching warehouse data:', err);
        setError('Veri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

  // Gerçek API'den veri çekme
  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLocation = () => {
    setFormData({
      name: '',
      type: '',
      address: '',
      notes: '',
      capacity: ''
    });
    setOpenLocationDialog(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      address: location.address || '',
      notes: location.notes || '',
      capacity: location.capacity?.toString() || ''
    });
    setOpenEditDialog(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (window.confirm('Bu konumu silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`http://localhost:3015/api/v1/locations/${locationId}`, {
          method: 'DELETE',
          headers,
        });

        if (response.ok) {
          const updatedLocations = locations.filter(loc => loc.id !== locationId);
          setLocations(updatedLocations);
          
          // Stats'ı güncelle
          setStats(prev => prev ? {
            ...prev,
            totalLocations: updatedLocations.length,
            usedLocations: updatedLocations.length
          } : null);
          
      setSnackbar({
        open: true,
        message: 'Konum başarıyla silindi',
        severity: 'success'
            });
            addNotification('success', 'Konum Silindi', 'Konum başarıyla silindi');
        } else {
          const errorText = await response.text();
          console.error('Failed to delete location:', errorText);
          setSnackbar({
            open: true,
            message: 'Konum silinirken hata oluştu',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting location:', error);
        setSnackbar({
          open: true,
          message: 'Konum silinirken hata oluştu',
          severity: 'error'
        });
      }
    }
  };

  const handleBulkMove = () => {
    if (selectedProducts.length === 0) {
      setSnackbar({
        open: true,
        message: 'Lütfen taşınacak ürünleri seçin',
        severity: 'warning'
      });
      return;
    }
    
    setBulkMoveData({
      targetLocationId: '',
      reason: ''
    });
    setOpenBulkMoveDialog(true);
  };

  const handleBulkMoveSubmit = async () => {
    if (!bulkMoveData.targetLocationId) {
      setSnackbar({
        open: true,
        message: 'Lütfen hedef konumu seçin',
        severity: 'warning'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:3015/api/v1/warehouse/bulk-move', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productIds: selectedProducts,
          targetLocationId: bulkMoveData.targetLocationId,
          movedBy: '3383f9bf-1b18-4174-b080-6a114bf457e5', // Test user ID
          reason: bulkMoveData.reason
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bulk move result:', result);
        
        setSnackbar({
          open: true,
          message: `${selectedProducts.length} ürün başarıyla taşındı`,
          severity: 'success'
        });
        
        // Tüm verileri yenile
        await fetchData();
        
        setSelectedProducts([]);
        setOpenBulkMoveDialog(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Ürünler taşınamadı');
      }
    } catch (error) {
      console.error('Error moving products:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Ürünler taşınırken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleInventoryCount = (location: Location) => {
    setSelectedLocation(location);
    setInventoryCountData({
      locationId: location.id,
      countedBy: '3383f9bf-1b18-4174-b080-6a114bf457e5', // Test user ID
      countedItems: []
    });
    setOpenInventoryCountDialog(true);
  };

  const handleInventoryCountSubmit = async () => {
    if (inventoryCountData.countedItems.length === 0) {
      setSnackbar({
        open: true,
        message: 'Lütfen en az bir ürün sayımı ekleyin',
        severity: 'warning'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:3015/api/v1/warehouse/inventory-count', {
        method: 'POST',
        headers,
        body: JSON.stringify(inventoryCountData),
      });

      if (response.ok) {
        const result = await response.json();
        setSnackbar({
          open: true,
          message: `Envanter sayımı tamamlandı. ${result.data.countedItems.length} ürün sayıldı`,
          severity: 'success'
        });
        
        setOpenInventoryCountDialog(false);
        setSelectedLocation(null);
        
        // Verileri yenile
        await fetchData();
      } else {
        throw new Error('Envanter sayımı kaydedilemedi');
      }
    } catch (error) {
      console.error('Error in inventory count:', error);
      setSnackbar({
        open: true,
        message: 'Envanter sayımı kaydedilirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const addCountItem = () => {
    setInventoryCountData(prev => ({
      ...prev,
      countedItems: [...prev.countedItems, {
        productId: '',
        expectedQuantity: 0,
        actualQuantity: 0,
        notes: ''
      }]
    }));
  };

  const removeCountItem = (index: number) => {
    setInventoryCountData(prev => ({
      ...prev,
      countedItems: prev.countedItems.filter((_, i) => i !== index)
    }));
  };

  const updateCountItem = (index: number, field: string, value: any) => {
    setInventoryCountData(prev => ({
      ...prev,
      countedItems: prev.countedItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const fetchInventoryCountHistory = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:3015/api/v1/warehouse/inventory-count-history', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setInventoryCountHistory(data.data || []);
      } else {
        console.error('Failed to load inventory count history:', await response.text());
        setInventoryCountHistory([]);
      }
    } catch (error) {
      console.error('Error fetching inventory count history:', error);
      setInventoryCountHistory([]);
    }
  };

  const handleViewHistory = () => {
    fetchInventoryCountHistory();
    setOpenHistoryDialog(true);
  };

  // Filter and sort inventory
  const getFilteredInventory = () => {
    let filtered = [...inventory];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.locationName.toLowerCase().includes(searchLower) ||
        item.productModel?.name.toLowerCase().includes(searchLower) ||
        item.serialNumber?.toLowerCase().includes(searchLower) ||
        item.manufacturer?.name.toLowerCase().includes(searchLower)
      );
    }

    // Location type filter
    if (filters.locationType) {
      filtered = filtered.filter(item => item.locationType === filters.locationType);
    }

    // Product status filter
    if (filters.productStatus) {
      filtered = filtered.filter(item => item.status === filters.productStatus);
    }

    // Manufacturer filter
    if (filters.manufacturer) {
      filtered = filtered.filter(item => item.manufacturer?.id === filters.manufacturer);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'locationName':
          aValue = a.locationName;
          bValue = b.locationName;
          break;
        case 'productName':
          aValue = a.productModel?.name || '';
          bValue = b.productModel?.name || '';
          break;
        case 'serialNumber':
          aValue = a.serialNumber || '';
          bValue = b.serialNumber || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'manufacturer':
          aValue = a.manufacturer?.name || '';
          bValue = b.manufacturer?.name || '';
          break;
        default:
          aValue = a.locationName;
          bValue = b.locationName;
      }

      if (filters.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  };

  // Notification functions
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Analytics functions
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:3015/api/v1/warehouse/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPerformanceReport = async () => {
    try {
      const response = await fetch('http://localhost:3015/api/v1/warehouse/performance-report', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPerformanceReport(data.data);
      }
    } catch (error) {
      console.error('Error fetching performance report:', error);
    }
  };

  const handleOpenAnalytics = async () => {
    await Promise.all([fetchAnalytics(), fetchPerformanceReport()]);
    setOpenAnalyticsDialog(true);
  };

  // Barcode scanner functions
  const handleBarcodeScan = (code: string) => {
    setScannedCode(code);
    console.log('Scanned code:', code);
    
    // Try to find product by serial number
    const foundProduct = inventory.find(item => 
      item.serialNumber === code || 
      item.productId === code
    );
    
    if (foundProduct) {
      setSnackbar({
        open: true,
        message: `Ürün bulundu: ${foundProduct.productModel?.name} (${foundProduct.serialNumber})`,
        severity: 'success'
      });
      addNotification('success', 'Ürün Bulundu', `Barkod tarandı: ${foundProduct.productModel?.name}`);
    } else {
      setSnackbar({
        open: true,
        message: `Ürün bulunamadı: ${code}`,
        severity: 'warning'
      });
      addNotification('warning', 'Ürün Bulunamadı', `Barkod: ${code} - Bu seri numarasına sahip ürün bulunamadı`);
    }
  };

  const handleOpenBarcodeScanner = () => {
    setOpenBarcodeScanner(true);
  };

  // Capacity management functions
  const handleCapacityManagement = (location: Location) => {
    setSelectedLocation(location);
    setOpenCapacityDialog(true);
  };

  const handleUpdateCapacity = async () => {
    if (!selectedLocation || !formData.capacity) {
      setSnackbar({
        open: true,
        message: 'Lütfen kapasite değerini girin',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3015/api/v1/warehouse/locations/${selectedLocation.id}/capacity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          capacity: parseInt(formData.capacity)
        })
      });

      if (response.ok) {
        // Update local state
        setLocations(prev => prev.map(loc => 
          loc.id === selectedLocation.id 
            ? { ...loc, capacity: parseInt(formData.capacity) }
            : loc
        ));
        
        setOpenCapacityDialog(false);
        setSnackbar({
          open: true,
          message: `"${selectedLocation.name}" konumunun kapasitesi güncellendi`,
          severity: 'success'
        });
        addNotification('success', 'Kapasite Güncellendi', `"${selectedLocation.name}" konumunun kapasitesi ${formData.capacity} olarak güncellendi`);
      } else {
        const errorText = await response.text();
        console.error('Failed to update capacity:', errorText);
        setSnackbar({
          open: true,
          message: 'Kapasite güncellenirken hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating capacity:', error);
      setSnackbar({
        open: true,
        message: 'Kapasite güncellenirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleSaveLocation = async () => {
    if (!formData.name || !formData.type) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:3015/api/v1/locations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
      name: formData.name,
      type: formData.type,
          address: formData.address || null,
          notes: formData.notes || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        }),
      });

      if (response.ok) {
        const newLocation = await response.json();
        const updatedLocations = [newLocation.data, ...locations];
        setLocations(updatedLocations);
        
        // Stats'ı güncelle
        setStats(prev => prev ? {
          ...prev,
          totalLocations: updatedLocations.length,
          usedLocations: updatedLocations.length
        } : null);
        
    setOpenLocationDialog(false);
    setSnackbar({
      open: true,
              message: `Konum "${formData.name}" başarıyla eklendi`,
      severity: 'success'
    });
            addNotification('success', 'Konum Eklendi', `"${formData.name}" konumu başarıyla eklendi`);
      } else {
        const errorText = await response.text();
        console.error('Failed to create location:', errorText);
        setSnackbar({
          open: true,
          message: 'Konum oluşturulurken hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating location:', error);
      setSnackbar({
        open: true,
        message: 'Konum oluşturulurken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation || !formData.name || !formData.type) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3015/api/v1/locations/${selectedLocation.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
      name: formData.name,
      type: formData.type,
          address: formData.address || null,
          notes: formData.notes || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        }),
      });

      if (response.ok) {
        const updatedLocationData = await response.json();
    setLocations(prev => prev.map(loc => 
          loc.id === selectedLocation.id ? updatedLocationData.data : loc
    ));
    setOpenEditDialog(false);
    setSelectedLocation(null);
    setSnackbar({
      open: true,
          message: `Konum "${formData.name}" başarıyla güncellendi`,
      severity: 'success'
    });
      } else {
        const errorText = await response.text();
        console.error('Failed to update location:', errorText);
        setSnackbar({
          open: true,
          message: 'Konum güncellenirken hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setSnackbar({
        open: true,
        message: 'Konum güncellenirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleViewInventory = (location: Location) => {
    setSelectedLocation(location);
    setOpenInventoryDialog(true);
  };

  const handleViewInventoryItem = (item: any) => {
    setSelectedInventoryItem(item);
    setOpenViewDialog(true);
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Depo Yönetimi
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Notification Bell */}
            <IconButton 
              color="inherit" 
              onClick={() => setOpenNotificationDialog(true)}
              sx={{ position: 'relative' }}
            >
              <WarningIcon />
              {notifications.filter(n => !n.read).length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'error.main',
                  }}
                />
              )}
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={handleOpenAnalytics}
              sx={{ mr: 1 }}
            >
              Analitikler
            </Button>
            <Button
              variant="outlined"
              startIcon={<QrCodeIcon />}
              onClick={handleOpenBarcodeScanner}
              sx={{ mr: 1 }}
            >
              Barkod Tarayıcı
            </Button>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={handleViewHistory}
              sx={{ mr: 1 }}
            >
              Sayım Geçmişi
            </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateLocation}
          >
            Yeni Konum Ekle
          </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* İstatistikler */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Konum
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalLocations}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Kullanılan Konum
                  </Typography>
                  <Typography variant="h4">
                    {stats.usedLocations}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Stok Ürünler
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalStockProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Müşteri Ürünleri
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalCustomerProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Uyarılar */}
        {alerts.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Stok Uyarıları ({alerts.length})
            </Typography>
            <Grid container spacing={2}>
              {alerts.map((alert, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card 
                    sx={{ 
                      borderLeft: `4px solid ${
                        alert.severity === 'error' ? 'error.main' :
                        alert.severity === 'warning' ? 'warning.main' :
                        'info.main'
                      }`,
                      mb: 1
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {alert.message}
                        </Typography>
                        <Chip 
                          label={alert.count || 0}
                          size="small"
                          color={
                            alert.severity === 'error' ? 'error' :
                            alert.severity === 'warning' ? 'warning' :
                            'info'
                          }
                        />
                      </Box>
                      
                      {alert.action && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          💡 {alert.action}
                        </Typography>
                      )}
                      
                      {alert.details && alert.details.length > 0 && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            Detaylar:
                          </Typography>
                          {alert.details.map((detail, i) => (
                            <Typography key={i} variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              • {detail.locationName || detail.name}: {detail.count || 'N/A'} ürün
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Konumlar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Konumlar
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Konum Adı</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell>Adres</TableCell>
                  <TableCell>Kapasite</TableCell>
                  <TableCell>Notlar</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={getLocationTypeLabel(location.type)}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{location.address || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {location.currentCount || 0} / {location.capacity || '∞'}
                        </Typography>
                        {location.capacity && (
                          <Box sx={{ width: 60, height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                            <Box 
                              sx={{ 
                                height: '100%', 
                                width: `${Math.min(((location.currentCount || 0) / location.capacity) * 100, 100)}%`,
                                bgcolor: (location.currentCount || 0) / location.capacity >= 0.9 ? 'error.main' :
                                         (location.currentCount || 0) / location.capacity >= 0.75 ? 'warning.main' : 'success.main'
                              }} 
                            />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{location.notes || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewInventory(location)}
                        title="Envanter Görüntüle"
                      >
                        <InventoryIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="Envanter Sayımı"
                        onClick={() => handleInventoryCount(location)}
                        sx={{ color: 'primary.main' }}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="Kapasite Yönetimi"
                        onClick={() => handleCapacityManagement(location)}
                        sx={{ color: 'info.main' }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="Düzenle"
                        onClick={() => handleEditLocation(location)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="Sil"
                        onClick={() => handleDeleteLocation(location.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Envanter Özeti */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
            <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Envanter Özeti
          </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MoveIcon />}
              onClick={handleBulkMove}
              disabled={selectedProducts.length === 0}
            >
              Toplu Taşıma ({selectedProducts.length})
            </Button>
          </Box>
          
          {/* Filter and Search Bar */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Ara..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  placeholder="Konum, ürün, seri no..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Konum Türü</InputLabel>
                  <Select
                    value={filters.locationType}
                    onChange={(e) => setFilters(prev => ({ ...prev, locationType: e.target.value }))}
                    label="Konum Türü"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="warehouse">Depo</MenuItem>
                    <MenuItem value="service">Servis</MenuItem>
                    <MenuItem value="customer">Müşteri</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ürün Durumu</InputLabel>
                  <Select
                    value={filters.productStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, productStatus: e.target.value }))}
                    label="Ürün Durumu"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="available">Mevcut</MenuItem>
                    <MenuItem value="in_use">Kullanımda</MenuItem>
                    <MenuItem value="maintenance">Bakımda</MenuItem>
                    <MenuItem value="defective">Arızalı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sırala</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    label="Sırala"
                  >
                    <MenuItem value="locationName">Konum</MenuItem>
                    <MenuItem value="productName">Ürün</MenuItem>
                    <MenuItem value="serialNumber">Seri No</MenuItem>
                    <MenuItem value="status">Durum</MenuItem>
                    <MenuItem value="manufacturer">Üretici</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sıra</InputLabel>
                  <Select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                    label="Sıra"
                  >
                    <MenuItem value="asc">A-Z</MenuItem>
                    <MenuItem value="desc">Z-A</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFilters({
                    searchTerm: '',
                    locationType: '',
                    productStatus: '',
                    manufacturer: '',
                    sortBy: 'locationName',
                    sortOrder: 'asc'
                  })}
                  title="Filtreleri Temizle"
                >
                  <ClearIcon />
                </Button>
              </Grid>
            </Grid>
          </Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedProducts.length > 0 && selectedProducts.length < inventory.length}
                      checked={inventory.length > 0 && selectedProducts.length === inventory.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(inventory.map(item => item.productId || item.locationId));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Konum</TableCell>
                  <TableCell>Ürün</TableCell>
                  <TableCell>Seri No</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Üretici</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredInventory().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedProducts.includes(item.productId || item.locationId)}
                        onChange={(e) => {
                          const productId = item.productId || item.locationId;
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, productId]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== productId));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {item.locationName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getLocationTypeLabel(item.locationType)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {item.productModel?.name || 'Bilinmeyen Model'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.productType?.name || 'Bilinmeyen Tür'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {item.serialNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(item.status)}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.manufacturer?.name || 'Bilinmeyen'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" title="Detay Görüntüle" onClick={() => handleViewInventoryItem(item)}>
                        <ViewIcon />
                      </IconButton>
                        <IconButton 
                          size="small" 
                          title="Barkod Tarayıcı"
                          onClick={() => {
                            setScannedCode(item.serialNumber || '');
                            handleOpenBarcodeScanner();
                          }}
                          sx={{ color: 'info.main' }}
                        >
                          <QrCodeIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Yeni Konum Ekleme Dialog */}
        <Dialog open={openLocationDialog} onClose={() => setOpenLocationDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Yeni Konum Ekle</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Konum Adı *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Konum Türü *</InputLabel>
                  <Select 
                    label="Konum Türü *"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="WAREHOUSE">Depo</MenuItem>
                    <MenuItem value="SHELF">Raf</MenuItem>
                    <MenuItem value="SERVICE_AREA">Servis Alanı</MenuItem>
                    <MenuItem value="TESTING_AREA">Test Alanı</MenuItem>
                    <MenuItem value="SHIPPING_AREA">Sevkiyat Alanı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kapasite"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  helperText="Boş bırakılırsa sınırsız kapasite olur"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLocationDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSaveLocation}>Ekle</Button>
          </DialogActions>
        </Dialog>

        {/* Konum Düzenleme Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Konum Düzenle - {selectedLocation?.name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Konum Adı *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Konum Türü *</InputLabel>
                  <Select 
                    label="Konum Türü *"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="WAREHOUSE">Depo</MenuItem>
                    <MenuItem value="SHELF">Raf</MenuItem>
                    <MenuItem value="SERVICE_AREA">Servis Alanı</MenuItem>
                    <MenuItem value="TESTING_AREA">Test Alanı</MenuItem>
                    <MenuItem value="SHIPPING_AREA">Sevkiyat Alanı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kapasite"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  helperText="Boş bırakılırsa sınırsız kapasite olur"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleUpdateLocation}>Kaydet</Button>
          </DialogActions>
        </Dialog>

        {/* Envanter Detay Dialog */}
        <Dialog open={openInventoryDialog} onClose={() => setOpenInventoryDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedLocation?.name} - Envanter Detayı
          </DialogTitle>
          <DialogContent>
            {selectedLocation && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Konum Bilgileri
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Tür: {getLocationTypeLabel(selectedLocation.type)}
                </Typography>
                {selectedLocation.address && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Adres: {selectedLocation.address}
                  </Typography>
                )}
                {selectedLocation.notes && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Notlar: {selectedLocation.notes}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Ürün Listesi
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Bu konumda bulunan ürünler burada listelenecek...
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenInventoryDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Move Dialog */}
        <Dialog open={openBulkMoveDialog} onClose={() => setOpenBulkMoveDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Toplu Ürün Taşıma</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {selectedProducts.length} ürün seçildi
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Hedef Konum</InputLabel>
                  <Select
                    value={bulkMoveData.targetLocationId}
                    onChange={(e) => setBulkMoveData(prev => ({ ...prev, targetLocationId: e.target.value }))}
                    label="Hedef Konum"
                  >
                    {locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name} ({getLocationTypeLabel(location.type)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Taşıma Sebebi (Opsiyonel)"
                  multiline
                  rows={3}
                  value={bulkMoveData.reason}
                  onChange={(e) => setBulkMoveData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ürünlerin neden taşındığını açıklayın..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBulkMoveDialog(false)}>İptal</Button>
            <Button onClick={handleBulkMoveSubmit} variant="contained" color="primary">
              Taşı
            </Button>
          </DialogActions>
        </Dialog>

        {/* Inventory Count Dialog */}
        <Dialog open={openInventoryCountDialog} onClose={() => setOpenInventoryCountDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Envanter Sayımı - {selectedLocation?.name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Konum: {selectedLocation?.name} ({getLocationTypeLabel(selectedLocation?.type || '')})
                </Typography>
              </Grid>
              
              {inventoryCountData.countedItems.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>Ürün</InputLabel>
                          <Select
                            value={item.productId}
                            onChange={(e) => updateCountItem(index, 'productId', e.target.value)}
                            label="Ürün"
                          >
                            {products
                              .filter(product => product.location?.id === selectedLocation?.id)
                              .length > 0 ? (
                              products
                                .filter(product => product.location?.id === selectedLocation?.id)
                                .map((product) => (
                                  <MenuItem key={product.id} value={product.id}>
                                    {product.serialNumber} - {product.productModel?.name || 'Model Yok'}
                                  </MenuItem>
                                ))
                            ) : (
                              <MenuItem disabled>
                                Bu konumda ürün bulunamadı
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Beklenen Miktar"
                          type="number"
                          value={item.expectedQuantity}
                          onChange={(e) => updateCountItem(index, 'expectedQuantity', parseInt(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Gerçek Miktar"
                          type="number"
                          value={item.actualQuantity}
                          onChange={(e) => updateCountItem(index, 'actualQuantity', parseInt(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Notlar"
                          value={item.notes || ''}
                          onChange={(e) => updateCountItem(index, 'notes', e.target.value)}
                          placeholder="Sayım notları..."
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton 
                          onClick={() => removeCountItem(index)}
                          color="error"
                          title="Kaldır"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addCountItem}
                  fullWidth
                >
                  Ürün Ekle
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenInventoryCountDialog(false)}>İptal</Button>
            <Button onClick={handleInventoryCountSubmit} variant="contained" color="primary">
              Sayımı Tamamla
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* View Inventory Item Dialog */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Envanter Detayları</DialogTitle>
          <DialogContent>
            {selectedInventoryItem && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Konum
                  </Typography>
                  <Typography variant="body1">
                    {selectedInventoryItem.locationName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {getLocationTypeLabel(selectedInventoryItem.locationType)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Durum
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedInventoryItem.status)}
                    color={getStatusColor(selectedInventoryItem.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ürün Modeli
                  </Typography>
                  <Typography variant="body1">
                    {selectedInventoryItem.productModel?.name || 'Bilinmeyen Model'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ürün Türü
                  </Typography>
                  <Typography variant="body1">
                    {selectedInventoryItem.productType?.name || 'Bilinmeyen Tür'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Seri Numarası
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedInventoryItem.serialNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Üretici
                  </Typography>
                  <Typography variant="body1">
                    {selectedInventoryItem.manufacturer?.name || 'Bilinmeyen'}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Capacity Management Dialog */}
        <Dialog 
          open={openCapacityDialog} 
          onClose={() => setOpenCapacityDialog(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>Kapasite Yönetimi - {selectedLocation?.name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Konum: {selectedLocation?.name} ({getLocationTypeLabel(selectedLocation?.type || '')})
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Mevcut Durum:
                  </Typography>
                  <Typography variant="body2">
                    Kullanılan: {selectedLocation?.currentCount || 0} ürün
                  </Typography>
                  <Typography variant="body2">
                    Kapasite: {selectedLocation?.capacity || 'Sınırsız'} ürün
                  </Typography>
                  {selectedLocation?.capacity && (
                    <Typography variant="body2">
                      Kullanım Oranı: {Math.round(((selectedLocation?.currentCount || 0) / selectedLocation?.capacity) * 100)}%
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yeni Kapasite"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Maksimum ürün sayısı"
                  helperText="Bu konumda bulunabilecek maksimum ürün sayısını girin"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCapacityDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdateCapacity} variant="contained" color="primary">
              Kapasiteyi Güncelle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog 
          open={openAnalyticsDialog} 
          onClose={() => setOpenAnalyticsDialog(false)} 
          maxWidth="xl" 
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              Depo Analitikleri ve Performans Raporu
            </Typography>
          </DialogTitle>
          <DialogContent>
            {analytics && performanceReport ? (
              <Grid container spacing={3}>
                {/* Performance Metrics */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Performans Metrikleri
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Toplam Konum
                          </Typography>
                          <Typography variant="h4">
                            {performanceReport.performanceMetrics.totalLocations}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Kullanılan Konum
                          </Typography>
                          <Typography variant="h4">
                            {performanceReport.performanceMetrics.usedLocations}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Kullanım Oranı
                          </Typography>
                          <Typography variant="h4">
                            {Math.round(performanceReport.performanceMetrics.utilizationRate)}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Toplam Ürün
                          </Typography>
                          <Typography variant="h4">
                            {performanceReport.performanceMetrics.totalProducts}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Product Status Analytics */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Ürün Durumu Dağılımı
                  </Typography>
                  <Card>
                    <CardContent>
                      {analytics.productStatusAnalytics.map((status: any, index: number) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{status.status}</Typography>
                          <Typography variant="body2" fontWeight="bold">{status.count}</Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Manufacturer Analytics */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Üretici Dağılımı
                  </Typography>
                  <Card>
                    <CardContent>
                      {analytics.manufacturerAnalytics.map((manufacturer: any, index: number) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{manufacturer.manufacturerName}</Typography>
                          <Typography variant="body2" fontWeight="bold">{manufacturer.count}</Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Top Locations */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    En Çok Kullanılan Konumlar
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Konum Adı</TableCell>
                          <TableCell>Ürün Sayısı</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.topLocations.map((location: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{location.locationName}</TableCell>
                            <TableCell>{location.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Recommendations */}
                {performanceReport.recommendations && performanceReport.recommendations.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Öneriler
                    </Typography>
                    <Grid container spacing={2}>
                      {performanceReport.recommendations.map((rec: any, index: number) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Alert 
                            severity={rec.type === 'error' ? 'error' : rec.type === 'warning' ? 'warning' : 'info'}
                            sx={{ mb: 1 }}
                          >
                            <Typography variant="body2">
                              <strong>Öncelik:</strong> {rec.priority}
                            </Typography>
                            <Typography variant="body2">
                              {rec.message}
                            </Typography>
                          </Alert>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Analitik verileri yükleniyor...
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAnalyticsDialog(false)}>
              Kapat
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Dialog */}
        <Dialog 
          open={openNotificationDialog} 
          onClose={() => setOpenNotificationDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Bildirimler ({notifications.length})
              </Typography>
              <Button 
                onClick={clearAllNotifications}
                size="small"
                color="error"
              >
                Tümünü Temizle
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            {notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <WarningIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Henüz bildirim yok
                </Typography>
              </Box>
            ) : (
              <List>
                {notifications.map((notification) => (
                  <ListItem 
                    key={notification.id}
                    sx={{ 
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 1,
                      border: notification.read ? 'none' : '1px solid',
                      borderColor: notification.read ? 'transparent' : 'primary.main'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip 
                            label={notification.type}
                            size="small"
                            color={
                              notification.type === 'error' ? 'error' :
                              notification.type === 'warning' ? 'warning' :
                              notification.type === 'success' ? 'success' :
                              'info'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.timestamp.toLocaleString('tr-TR')}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.read && (
                      <IconButton 
                        size="small"
                        onClick={() => markNotificationAsRead(notification.id)}
                        title="Okundu olarak işaretle"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNotificationDialog(false)}>
              Kapat
            </Button>
          </DialogActions>
        </Dialog>

        {/* Barcode Scanner */}
        <BarcodeScanner
          open={openBarcodeScanner}
          onClose={() => setOpenBarcodeScanner(false)}
          onScan={handleBarcodeScan}
          title="Ürün Barkod Tarayıcı"
          description="Ürün barkodunu veya QR kodunu kameraya doğrultun"
        />

        {/* Inventory Count History Dialog */}
        <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Envanter Sayımı Geçmişi</DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Konum</TableCell>
                    <TableCell>Sayım Yapan</TableCell>
                    <TableCell>Toplam Ürün</TableCell>
                    <TableCell>Tamamlanma Tarihi</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryCountHistory.map((count) => (
                    <TableRow key={count.id}>
                      <TableCell>{count.locationName}</TableCell>
                      <TableCell>
                        {count.countedByUser?.firstName} {count.countedByUser?.lastName}
                      </TableCell>
                      <TableCell>{count.totalItems}</TableCell>
                      <TableCell>
                        {new Date(count.completedAt).toLocaleString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedCountDetails(count);
                            setOpenCountDetailsDialog(true);
                          }}
                        >
                          Detaylar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {inventoryCountHistory.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Henüz envanter sayımı yapılmamış.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHistoryDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Count Details Dialog */}
        <Dialog open={openCountDetailsDialog} onClose={() => setOpenCountDetailsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Sayım Detayları - {selectedCountDetails?.locationName}
          </DialogTitle>
          <DialogContent>
            {selectedCountDetails && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Genel Bilgiler</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Konum:</Typography>
                      <Typography variant="body1">{selectedCountDetails.locationName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Sayım Yapan:</Typography>
                      <Typography variant="body1">
                        {selectedCountDetails.countedByUser?.firstName} {selectedCountDetails.countedByUser?.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Toplam Ürün:</Typography>
                      <Typography variant="body1">{selectedCountDetails.totalItems}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Tamamlanma Tarihi:</Typography>
                      <Typography variant="body1">
                        {new Date(selectedCountDetails.completedAt).toLocaleString('tr-TR')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Typography variant="h6" gutterBottom>Sayım Detayları</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ürün ID</TableCell>
                        <TableCell>Beklenen</TableCell>
                        <TableCell>Gerçek</TableCell>
                        <TableCell>Fark</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell>Notlar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedCountDetails.countedItems?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.productId}</TableCell>
                          <TableCell>{item.expectedQuantity}</TableCell>
                          <TableCell>{item.actualQuantity}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.difference}
                              size="small"
                              color={item.difference === 0 ? 'success' : item.difference > 0 ? 'warning' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.success ? 'Başarılı' : 'Hatalı'}
                              size="small"
                              color={item.success ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>{item.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCountDetailsDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

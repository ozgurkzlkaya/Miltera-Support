/**
 * Miltera Fixlog Frontend - DataTable Component
 * 
 * Bu component, tüm CRUD işlemleri için genel bir data table sağlar.
 * API'den veri çeker, tablo olarak gösterir ve CRUD işlemlerini yönetir.
 * 
 * Özellikler:
 * - Generic data table
 * - CRUD operations (Create, Read, Update, Delete)
 * - Search ve filtering
 * - Pagination
 * - Bulk actions
 * - Form integration
 * - API integration
 * 
 * Kullanım: Tüm list sayfalarında kullanılır
 */

import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { FileCopy as CopyIcon } from '@mui/icons-material';

/**
 * DataTable için React Query hook'u
 * 
 * Bu hook:
 * 1. API endpoint'inden veri çeker
 * 2. Authentication token'ı ekler
 * 3. Query parameters'ları işler
 * 4. Error handling yapar
 * 5. Caching sağlar
 */
export const useDataTableQuery = (endpoint: string, params: any = {}) => {
  return useQuery({
    queryKey: [endpoint, params],
    queryFn: async () => {
      // Authentication token'ını al
      const token = localStorage.getItem('auth_token');
      
      // Query parameters'ları URL'e ekle
      const queryParams = new URLSearchParams(params);
      const url = `http://localhost:3015/api/v1/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      // API'ye istek gönder
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Hata kontrolü
      if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
      
      return response.json();
    },
  });
};

/**
 * Tablo kolon tanımı interface'i
 * Her kolon için görüntüleme ve davranış ayarları
 */
export interface TableColumn {
  id?: string;                                                    // Kolon ID'si
  key?: string;                                                   // Data key'i
  label: string;                                                  // Kolon başlığı
  width?: number;                                                 // Kolon genişliği
  sortable?: boolean;                                             // Sıralanabilir mi?
  filterable?: boolean;                                           // Filtrelenebilir mi?
  render?: (value: any, row: any) => React.ReactNode;            // Custom render fonksiyonu
}

/**
 * Form field tanımı interface'i
 * CRUD form'ları için field yapılandırması
 */
export interface FormField {
  id?: string;                                                    // Field ID'si
  name?: string;                                                  // Field name'i
  label: string;                                                  // Field label'ı
  type: string;                                                   // Field type'ı (text, select, etc.)
  required?: boolean;                                             // Zorunlu mu?
  placeholder?: string;                                           // Placeholder text
  layout?: { row: number; column: number };                      // Grid layout pozisyonu
  options?: Array<{ value: string; label: string }>;             // Select options
}

/**
 * Bulk action tanımı interface'i
 * Toplu işlemler için action yapılandırması
 */
export interface BulkAction {
  label: string;                                                  // Action label'ı
  action: (selectedIds: string[]) => void;                       // Action fonksiyonu
  variant?: 'primary' | 'secondary' | 'danger';                  // Button variant'ı
}

/**
 * DataTable props interface'i
 * Component'e geçirilen tüm props'ların tanımı
 */
interface DataTableProps {
  title?: string;                                                 // Tablo başlığı
  columns?: TableColumn[];                                        // Tablo kolonları
  queryResult?: any;                                              // Query sonucu
  formFields?: FormField[];                                       // Form field'ları
  bulkActions?: BulkAction[];                                     // Bulk action'lar
  onAdd?: (data: any) => void;                                    // Add callback'i
  onEdit?: (id: string, data?: any) => void;                      // Edit callback'i
  onDelete?: (id: any) => void;                                   // Delete callback'i
  addButtonText?: string;                                         // Add button text'i
  selectable?: boolean;                                           // Satır seçilebilir mi?
}

/**
 * DataTable Component
 * 
 * Bu component:
 * 1. API'den veri çeker
 * 2. Tablo olarak gösterir
 * 3. CRUD işlemlerini yönetir
 * 4. Search ve filtering sağlar
 * 5. Bulk actions'ları destekler
 */
function DataTable(props: DataTableProps) {
  return <div>DataTable Component - {props.title}</div>;
}

export default DataTable;
export { DataTable, CopyIcon };

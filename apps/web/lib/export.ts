import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  title: string;
  filename: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    width?: number;
    formatter?: (value: any) => string;
  }>;
  includeDate?: boolean;
  includeUser?: boolean;
}

export class ExportService {
  /**
   * Export data to PDF
   */
  static async exportToPDF(options: ExportOptions): Promise<void> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(options.title, 14, 22);
    
    // Add date and user info
    let yPosition = 30;
    if (options.includeDate) {
      doc.setFontSize(10);
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, yPosition);
      yPosition += 6;
    }
    
    if (options.includeUser) {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        doc.setFontSize(10);
        doc.text(`Kullanıcı: ${userData.name || userData.email}`, 14, yPosition);
        yPosition += 6;
      }
    }
    
    // Prepare table data
    const tableData = options.data.map(item => 
      options.columns.map(col => {
        const value = item[col.key];
        return col.formatter ? col.formatter(value) : String(value || '');
      })
    );
    
    const headers = options.columns.map(col => col.label);
    
    // Add table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPosition + 10,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: options.columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {} as any),
      margin: { top: 20, right: 14, bottom: 20, left: 14 },
    });
    
    // Save PDF
    doc.save(`${options.filename}.pdf`);
  }
  
  /**
   * Export data to Excel
   */
  static async exportToExcel(options: ExportOptions): Promise<void> {
    // Prepare data
    const worksheetData = [
      options.columns.map(col => col.label), // Headers
      ...options.data.map(item => 
        options.columns.map(col => {
          const value = item[col.key];
          return col.formatter ? col.formatter(value) : value || '';
        })
      )
    ];
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = options.columns.map(col => ({
      wch: col.width ? col.width / 7 : 15 // Convert from PDF width to Excel width
    }));
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Add metadata sheet
    const metadata = [
      ['Rapor Adı', options.title],
      ['Oluşturulma Tarihi', new Date().toLocaleDateString('tr-TR')],
      ['Toplam Kayıt', options.data.length.toString()],
    ];
    
    if (options.includeUser) {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        metadata.push(['Kullanıcı', userData.name || userData.email]);
      }
    }
    
    const metadataSheet = XLSX.utils.aoa_to_sheet(metadata);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Bilgiler');
    
    // Save Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${options.filename}.xlsx`);
  }
  
  /**
   * Export data to CSV
   */
  static async exportToCSV(options: ExportOptions): Promise<void> {
    // Prepare CSV data
    const csvData = [
      options.columns.map(col => col.label).join(','), // Headers
      ...options.data.map(item => 
        options.columns.map(col => {
          const value = item[col.key];
          const formattedValue = col.formatter ? col.formatter(value) : String(value || '');
          // Escape commas and quotes
          return `"${formattedValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    // Add BOM for UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${options.filename}.csv`);
  }
  
  /**
   * Format common data types
   */
  static formatters = {
    date: (value: string | Date) => {
      if (!value) return '';
      const date = new Date(value);
      return date.toLocaleDateString('tr-TR');
    },
    
    datetime: (value: string | Date) => {
      if (!value) return '';
      const date = new Date(value);
      return date.toLocaleString('tr-TR');
    },
    
    currency: (value: number) => {
      if (!value) return '0,00 ₺';
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(value);
    },
    
    number: (value: number) => {
      if (!value) return '0';
      return new Intl.NumberFormat('tr-TR').format(value);
    },
    
    boolean: (value: boolean) => {
      return value ? 'Evet' : 'Hayır';
    },
    
    status: (value: string) => {
      const statusMap: Record<string, string> = {
        'OPEN': 'Açık',
        'IN_PROGRESS': 'İşlemde',
        'REPAIRED': 'Tamir Edildi',
        'CLOSED': 'Kapalı',
        'DELIVERED': 'Teslim Edildi',
        'PENDING': 'Beklemede',
        'ACTIVE': 'Aktif',
        'INACTIVE': 'Pasif',
      };
      return statusMap[value] || value;
    },
    
    priority: (value: string) => {
      const priorityMap: Record<string, string> = {
        'LOW': 'Düşük',
        'MEDIUM': 'Orta',
        'HIGH': 'Yüksek',
        'CRITICAL': 'Kritik',
      };
      return priorityMap[value] || value;
    },
    
    role: (value: string) => {
      const roleMap: Record<string, string> = {
        'ADMIN': 'Admin',
        'TSP': 'Teknik Servis',
        'USER': 'Kullanıcı',
        'CUSTOMER': 'Müşteri',
      };
      return roleMap[value] || value;
    },
  };
}

// Export utility functions
export const exportToPDF = ExportService.exportToPDF;
export const exportToExcel = ExportService.exportToExcel;
export const exportToCSV = ExportService.exportToCSV;

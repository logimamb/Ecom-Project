import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import path from 'path';

interface ExportOptions {
  sheetName?: string;
  fileName?: string;
}

export async function exportToExcel(data: any[], options: ExportOptions = {}) {
  const {
    sheetName = 'Sheet1',
    fileName = 'export.xlsx'
  } = options;

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return { buffer, fileName };
}

export async function exportAllData() {
  const dataFiles = [
    { name: 'Customers', path: 'customers.json' },
    { name: 'Inventory', path: 'inventory.json' },
    { name: 'Sales', path: 'sales.json' },
    { name: 'Orders', path: 'orders.json' },
    { name: 'Suppliers', path: 'suppliers.json' },
    { name: 'Notifications', path: 'notifications.json' }
  ];

  const wb = XLSX.utils.book_new();
  
  for (const file of dataFiles) {
    try {
      const filePath = path.join(process.cwd(), 'data', file.path);
      const fileContent = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      // Get the main array from the data object
      const arrayData = Array.isArray(data) ? data : data[Object.keys(data)[0]];
      
      if (arrayData && Array.isArray(arrayData)) {
        const ws = XLSX.utils.json_to_sheet(arrayData);
        XLSX.utils.book_append_sheet(wb, ws, file.name);
      }
    } catch (error) {
      console.warn(`Could not process ${file.path}: ${error}`);
    }
  }

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return { buffer, fileName: 'all_data.xlsx' };
}

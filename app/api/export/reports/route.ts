import { NextResponse } from 'next/server';
import { exportToExcel } from '@/lib/utils/excel-export';
import { readFileSync } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Read all necessary data files
    const dataFiles = [
      { name: 'Sales', path: 'sales.json' },
      { name: 'Inventory', path: 'inventory.json' },
      { name: 'Customers', path: 'customers.json' },
      { name: 'Orders', path: 'orders.json' }
    ];

    const wb = XLSX.utils.book_new();

    // Generate reports for each data type
    for (const file of dataFiles) {
      try {
        const filePath = path.join(process.cwd(), 'data', file.path);
        const fileContent = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Get main data array
        const arrayData = Array.isArray(data) ? data : data[Object.keys(data)[0]];

        if (arrayData && Array.isArray(arrayData)) {
          // Add summary statistics
          const summaryData = generateSummary(arrayData, file.name);
          const ws = XLSX.utils.json_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(wb, ws, `${file.name} Report`);
        }
      } catch (error) {
        console.warn(`Could not process ${file.path}: ${error}`);
      }
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `business_reports_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}

function generateSummary(data: any[], type: string) {
  switch (type.toLowerCase()) {
    case 'sales':
      return generateSalesSummary(data);
    case 'inventory':
      return generateInventorySummary(data);
    case 'customers':
      return generateCustomersSummary(data);
    case 'orders':
      return generateOrdersSummary(data);
    default:
      return data;
  }
}

function generateSalesSummary(sales: any[]) {
  const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const averageSale = totalSales / sales.length;
  const dates = sales.map(s => new Date(s.date).getTime());
  const periodStart = new Date(Math.min(...dates)).toLocaleDateString();
  const periodEnd = new Date(Math.max(...dates)).toLocaleDateString();

  return [
    { metric: 'Report Type', value: 'Sales Analysis' },
    { metric: 'Period', value: `${periodStart} to ${periodEnd}` },
    { metric: 'Total Sales', value: totalSales.toFixed(2) },
    { metric: 'Number of Sales', value: sales.length },
    { metric: 'Average Sale Value', value: averageSale.toFixed(2) }
  ];
}

function generateInventorySummary(inventory: any[]) {
  const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStock = inventory.filter(item => item.quantity <= (item.minQuantity || 0)).length;
  
  return [
    { metric: 'Report Type', value: 'Inventory Status' },
    { metric: 'Total Products', value: inventory.length },
    { metric: 'Total Items in Stock', value: totalItems },
    { metric: 'Low Stock Items', value: lowStock },
    { metric: 'Average Stock per Product', value: (totalItems / inventory.length).toFixed(2) }
  ];
}

function generateCustomersSummary(customers: any[]) {
  const totalCustomers = customers.length;
  const totalLoyaltyPoints = customers.reduce((sum, customer) => sum + (customer.loyaltyPoints || 0), 0);
  
  return [
    { metric: 'Report Type', value: 'Customer Analysis' },
    { metric: 'Total Customers', value: totalCustomers },
    { metric: 'Total Loyalty Points', value: totalLoyaltyPoints },
    { metric: 'Average Points per Customer', value: (totalLoyaltyPoints / totalCustomers).toFixed(2) }
  ];
}

function generateOrdersSummary(orders: any[]) {
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  return [
    { metric: 'Report Type', value: 'Orders Overview' },
    { metric: 'Total Orders', value: totalOrders },
    { metric: 'Total Order Value', value: totalValue.toFixed(2) },
    { metric: 'Average Order Value', value: (totalValue / totalOrders).toFixed(2) },
    { metric: 'Pending Orders', value: pendingOrders }
  ];
}

import { NextResponse } from 'next/server';
import { exportToExcel } from '@/lib/utils/excel-export';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'customers.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Get customers array and add computed fields
    const customers = data.customers.map((customer: any) => ({
      ...customer,
      totalOrders: customer.orders?.length || 0,
      totalSpent: customer.orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0,
      lastOrderDate: customer.orders?.length ? 
        new Date(Math.max(...customer.orders.map((o: any) => new Date(o.date)))).toLocaleDateString() : 
        'Never'
    }));

    const { buffer, fileName } = await exportToExcel(
      customers,
      { 
        sheetName: 'Customers',
        fileName: 'customers_export.xlsx'
      }
    );

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting customers:', error);
    return NextResponse.json(
      { error: 'Failed to export customers' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db/json';

const FILES_TO_UPDATE = [
  'data/sales.json',
  'data/orders.json',
  'data/inventory.json',
  'data/customers.json',
  'data/reports.json'
];

// Exchange rates (same as in use-currency-converter.ts)
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  XAF: 655.96,
  GBP: 0.79,
};

async function convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = RATES[fromCurrency];
  const toRate = RATES[toCurrency];
  
  if (!fromRate || !toRate) {
    throw new Error(`Invalid currency: ${fromCurrency} or ${toCurrency}`);
  }
  
  // Convert to USD first (base currency), then to target currency
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;
  
  return Number(convertedAmount.toFixed(2));
}

async function updateFileValues(filePath: string, fromCurrency: string, toCurrency: string) {
  try {
    const data = await readJSON(filePath);
    
    // Handle different file structures
    switch (filePath) {
      case 'data/sales.json':
        if (Array.isArray(data.sales)) {
          for (const sale of data.sales) {
            sale.amount = await convertAmount(sale.amount, fromCurrency, toCurrency);
            sale.totalPrice = await convertAmount(sale.totalPrice, fromCurrency, toCurrency);
            if (sale.unitPrice) sale.unitPrice = await convertAmount(sale.unitPrice, fromCurrency, toCurrency);
          }
        }
        break;

      case 'data/orders.json':
        if (Array.isArray(data.orders)) {
          for (const order of data.orders) {
            order.totalAmount = await convertAmount(order.totalAmount, fromCurrency, toCurrency);
            if (order.items) {
              for (const item of order.items) {
                item.price = await convertAmount(item.price, fromCurrency, toCurrency);
                item.total = await convertAmount(item.total, fromCurrency, toCurrency);
              }
            }
          }
        }
        break;

      case 'data/inventory.json':
        if (Array.isArray(data.inventory)) {
          for (const item of data.inventory) {
            item.price = await convertAmount(item.price, fromCurrency, toCurrency);
            if (item.cost) item.cost = await convertAmount(item.cost, fromCurrency, toCurrency);
          }
        }
        break;

      case 'data/customers.json':
        if (Array.isArray(data.customers)) {
          for (const customer of data.customers) {
            customer.totalSpent = await convertAmount(customer.totalSpent, fromCurrency, toCurrency);
          }
        }
        break;

      case 'data/reports.json':
        if (Array.isArray(data.reports)) {
          for (const report of data.reports) {
            if (report.data) {
              if (report.data.revenue) report.data.revenue = await convertAmount(report.data.revenue, fromCurrency, toCurrency);
              if (report.data.expenses) report.data.expenses = await convertAmount(report.data.expenses, fromCurrency, toCurrency);
              if (report.data.profit) report.data.profit = await convertAmount(report.data.profit, fromCurrency, toCurrency);
            }
          }
        }
        break;
    }

    await writeJSON(filePath, data);
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { fromCurrency, toCurrency } = await request.json();

    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: 'Missing currency parameters' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      FILES_TO_UPDATE.map(file => updateFileValues(file, fromCurrency, toCurrency))
    );

    const success = results.every(result => result === true);

    if (!success) {
      throw new Error('Some files failed to update');
    }

    return NextResponse.json({
      message: 'Currency conversion completed successfully',
      fromCurrency,
      toCurrency
    });
  } catch (error) {
    console.error('Error converting currencies:', error);
    return NextResponse.json(
      { error: 'Failed to convert currencies' },
      { status: 500 }
    );
  }
}

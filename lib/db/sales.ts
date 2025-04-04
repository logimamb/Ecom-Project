import { randomUUID } from "crypto";
import { readJSON, writeJSON } from "./json";
import type { SaleFormData } from "../validations/sale";

const SALES_FILE = "data/sales.json";

export interface Sale extends SaleFormData {
  id: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAll(): Promise<Sale[]> {
  try {
    const data = await readJSON(SALES_FILE);
    return data.sales || [];
  } catch (error) {
    return [];
  }
}

export async function getById(id: string): Promise<Sale | null> {
  const sales = await getAll();
  return sales.find((sale) => sale.id === id) || null;
}

export async function create(data: SaleFormData): Promise<Sale> {
  const sales = await getAll();
  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const newSale: Sale = {
    ...data,
    id: randomUUID(),
    total,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await writeJSON(SALES_FILE, {
    sales: [...sales, newSale],
  });

  return newSale;
}

export async function update(id: string, data: SaleFormData): Promise<Sale> {
  const sales = await getAll();
  const index = sales.findIndex((sale) => sale.id === id);

  if (index === -1) {
    throw new Error("Sale not found");
  }

  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const updatedSale: Sale = {
    ...data,
    id,
    total,
    createdAt: sales[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  sales[index] = updatedSale;

  await writeJSON(SALES_FILE, {
    sales,
  });

  return updatedSale;
}

export async function updateMany(updatedSales: Sale[]): Promise<void> {
  const currentSales = await getAll();
  
  // Create a map of existing sales by ID for quick lookup
  const salesMap = new Map(currentSales.map(sale => [sale.id, sale]));
  
  // Update each sale while preserving creation dates
  const newSales = updatedSales.map(sale => {
    const existingSale = salesMap.get(sale.id);
    if (!existingSale) {
      throw new Error(`Sale with id ${sale.id} not found`);
    }

    return {
      ...sale,
      createdAt: existingSale.createdAt,
      updatedAt: new Date().toISOString(),
    };
  });

  await writeJSON(SALES_FILE, {
    sales: newSales,
  });
}

export async function remove(id: string): Promise<void> {
  const sales = await getAll();
  const filteredSales = sales.filter((sale) => sale.id !== id);

  await writeJSON(SALES_FILE, {
    sales: filteredSales,
  });
}

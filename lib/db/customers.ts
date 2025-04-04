import { randomUUID } from "crypto";
import { readJSON, writeJSON } from "./json";

const CUSTOMERS_FILE = "data/customers.json";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  segment: "new" | "regular" | "vip";
  createdAt: string;
  notes?: string;
}

export interface LoyaltyPointsHistory {
  id: string;
  customerId: string;
  points: number;
  reason: string;
  timestamp: string;
}

interface CustomerData {
  customers: Customer[];
  loyaltyPointsHistory: LoyaltyPointsHistory[];
}

export async function getAll(): Promise<Customer[]> {
  try {
    const data = await readJSON(CUSTOMERS_FILE) as CustomerData;
    return data.customers || [];
  } catch (error) {
    return [];
  }
}

export async function getById(id: string): Promise<Customer | null> {
  const customers = await getAll();
  return customers.find((customer) => customer.id === id) || null;
}

export async function create(data: Omit<Customer, "id" | "totalOrders" | "totalSpent" | "loyaltyPoints" | "createdAt">): Promise<Customer> {
  const customers = await getAll();
  const newCustomer: Customer = {
    ...data,
    id: randomUUID(),
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    createdAt: new Date().toISOString(),
  };

  const fileData = await readJSON(CUSTOMERS_FILE) as CustomerData;
  await writeJSON(CUSTOMERS_FILE, {
    ...fileData,
    customers: [...customers, newCustomer],
  });

  return newCustomer;
}

export async function update(id: string, data: Partial<Customer>): Promise<Customer> {
  const fileData = await readJSON(CUSTOMERS_FILE) as CustomerData;
  const index = fileData.customers.findIndex((customer) => customer.id === id);

  if (index === -1) {
    throw new Error("Customer not found");
  }

  const updatedCustomer: Customer = {
    ...fileData.customers[index],
    ...data,
  };

  fileData.customers[index] = updatedCustomer;

  await writeJSON(CUSTOMERS_FILE, fileData);

  return updatedCustomer;
}

export async function remove(id: string): Promise<void> {
  const fileData = await readJSON(CUSTOMERS_FILE) as CustomerData;
  const filteredCustomers = fileData.customers.filter((customer) => customer.id !== id);

  await writeJSON(CUSTOMERS_FILE, {
    ...fileData,
    customers: filteredCustomers,
  });
}

export async function getLoyaltyPointsHistory(customerId: string): Promise<LoyaltyPointsHistory[]> {
  try {
    const data = await readJSON(CUSTOMERS_FILE) as CustomerData;
    return (data.loyaltyPointsHistory || []).filter(
      (entry) => entry.customerId === customerId
    );
  } catch (error) {
    return [];
  }
}

export async function addLoyaltyPointsHistory(
  customerId: string,
  data: Omit<LoyaltyPointsHistory, "id" | "customerId">
): Promise<LoyaltyPointsHistory> {
  const fileData = await readJSON(CUSTOMERS_FILE) as CustomerData;
  
  const entry: LoyaltyPointsHistory = {
    id: randomUUID(),
    customerId,
    ...data,
  };

  await writeJSON(CUSTOMERS_FILE, {
    ...fileData,
    loyaltyPointsHistory: [...(fileData.loyaltyPointsHistory || []), entry],
  });

  return entry;
}

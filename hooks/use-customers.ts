import useSWR from 'swr';
import { readFileSync } from 'fs';
import path from 'path';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: any[];
  loyaltyPoints: number;
  segment: string;
}

const fetcher = () => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'customers.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return data.customers.map((customer: Customer) => ({
      ...customer,
      totalOrders: customer.orders?.length || 0,
      totalSpent: customer.orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0,
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR('customers', fetcher);

  return {
    customers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

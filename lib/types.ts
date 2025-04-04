export interface Supplier {
  id: string;
  name: string;
  platform: 'Alibaba' | 'AliExpress' | 'Amazon' | 'Other';
  email: string;
  phone: string;
  address: string;
  website?: string;
  orderHistory?: Order[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FreightForwarder {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  depotAddress: string;
  transportModes: ("sea" | "air" | "land")[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order extends BaseModel {
  supplierId: string;
  forwarderId?: string;
  products: OrderProduct[];
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  costs: {
    purchase: number;
    shipping: number;
    taxes: number;
    bankCharges: number;
    platformCommission: number;
    deliveryToForwarder: number;
  };
  payments: {
    supplier: number;
    forwarder: number;
  };
}

export interface OrderProduct {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface InventoryItem extends BaseModel {
  name: string;
  sku: string;
  quantity: number;
  reorderPoint: number;
  category: string;
  supplierId: string;
  expiryDate?: string;
  location?: string;
  notes?: string;
  lastRestocked?: string;
}

export interface Sale {
  id: string;
  customerId: string;
  products: SaleProduct[];
  totalAmount: number;
  deliveryDetails: {
    type: 'agency' | 'internal';
    cost: number;
    agencyName?: string;
    trackingNumber?: string;
  };
  status: 'pending' | 'paid' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface SaleProduct {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  purchaseHistory: Sale[];
  createdAt: string;
  updatedAt: string;
}

export interface Costing {
  id: string;
  productName: string;
  purchasePrice: number;
  shippingCost: number;
  customsDuty: number;
  taxes: number;
  otherCosts: number;
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: "sales" | "inventory" | "customers" | "financial";
  status: "draft" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
  metrics: Record<string, any>;
  period: string;
  author: string;
}

export interface CreateReportInput extends Omit<Report, "id"> {}
export interface UpdateReportInput extends Partial<CreateReportInput> {}

export interface SalesReport {
  totalSales: number;
  orders: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface InventoryReport {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  stockValue: number;
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomers: number;
  repeatRate: number;
  averageLTV: number;
}

export interface FinancialReport {
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
}

export interface Settings {
  id: string;
  businessInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    language: string;
  };
  notifications: {
    email: boolean;
    browser: boolean;
    lowStock: boolean;
    newOrders: boolean;
    paymentReminders: boolean;
  };
  appearance: {
    theme: 'light' | 'dark';
    density: 'comfortable' | 'compact';
    sidebarCollapsed: boolean;
  };
  backup: {
    lastBackup: string | null;
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  createdAt: string;
  updatedAt: string;
}
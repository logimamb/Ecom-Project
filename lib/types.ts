export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends BaseModel {
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  purchaseHistory: Sale[];
  status: 'active' | 'inactive';
}

export interface Product extends BaseModel {
  name: string;
  sku: string;
  description: string;
  category: string;
  supplierId: string;
  lastOrderPrice: number;
  createdFromOrderId?: string;
  status: 'in-stock' | 'out-of-stock' | 'low-stock';
}

export interface Sale extends BaseModel {
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
  paymentMethod: string;
}

export interface Supplier extends BaseModel {
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  platform: 'Alibaba' | 'AliExpress' | 'Amazon' | 'Other';
  status: 'active' | 'inactive';
}

export interface Order extends BaseModel {
  supplierId: string;
  forwarderId?: string;
  products: OrderProduct[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  paymentMethod: string;
  trackingNumber?: string;
  expectedDeliveryDate?: string;
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

export interface Report extends BaseModel {
  title: string;
  description: string;
  type: "sales" | "inventory" | "customers" | "financial";
  status: "draft" | "in-progress" | "completed";
  period: string;
  author: string;
  metrics?: Record<string, number>;
  data: {
    revenue?: number;
    expenses?: number;
    profit?: number;
    totalSales?: number;
    averageOrderValue?: number;
    totalInventoryValue?: number;
    totalItems?: number;
    lowStockItems?: number;
    totalCustomers?: number;
    activeCustomers?: number;
    newCustomers?: number;
    [key: string]: any;
  };
}

export type CreateReportInput = Omit<Report, 'id'>;

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
  timezone: string;
}

export interface OrderProduct {
  productId?: string;  // Link to Product if exists
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleProduct {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface InventoryItem extends BaseModel {
  productId: string;  // Link to Product
  quantity: number;
  reorderPoint: number;
  lastOrderPrice: number;
  expiryDate?: string;
  location?: string;
  notes?: string;
  lastRestocked?: string;
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
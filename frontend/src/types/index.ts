export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    subCategories: number;
  };
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  image?: string | null;
  status: "ACTIVE" | "INACTIVE";
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Unit {
  id: string;
  name: string;
  shortName: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  image?: string | null;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  manufacturedDate?: string | null;
  expiredDate?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  brandId?: string | null;
  brand?: Brand | null;
  unitId?: string | null;
  unit?: Unit | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  points: number;
  address?: string | null;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  customer?: Customer | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: "CASH" | "PROMPTPAY" | "CREDIT_CARD";
  paymentStatus: "PAID" | "PENDING" | "CANCELLED";
  cashierName: string;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardStats {
  summary: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
  };
  chartData: {
    month: string;
    sales: number;
    purchase: number;
  }[];
  recentOrders: Order[];
  lowStockProducts: Product[];
  topSellingProducts: Product[];
}

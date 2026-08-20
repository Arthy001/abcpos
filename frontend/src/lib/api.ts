import { Category, DashboardStats, Order, Product, SubCategory } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ==================== DASHBOARD ====================
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
  const data = await res.json();
  return data.data;
}

// ==================== PRODUCTS ====================
export async function fetchProducts(params?: { categoryId?: string; search?: string }): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.categoryId && params.categoryId !== "all") query.set("categoryId", params.categoryId);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.data;
}

export async function createProductApi(payload: {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStockAlert?: number;
  categoryId?: string;
  image?: string;
}): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create product");
  }
  return data.data;
}

// ==================== CATEGORIES ====================
export async function fetchCategories(params?: { status?: string; search?: string }): Promise<Category[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/categories?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.data;
}

export async function createCategoryApi(payload: {
  name: string;
  slug?: string;
  description?: string;
  status?: string;
}): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create category");
  return data.data;
}

export async function updateCategoryApi(id: string, payload: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update category");
  return data.data;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete category");
}

// ==================== SUB CATEGORIES ====================
export async function fetchSubCategories(params?: {
  categoryId?: string;
  status?: string;
  search?: string;
}): Promise<SubCategory[]> {
  const query = new URLSearchParams();
  if (params?.categoryId && params.categoryId !== "all") query.set("categoryId", params.categoryId);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/sub-categories?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sub categories");
  const data = await res.json();
  return data.data;
}

export async function createSubCategoryApi(payload: {
  name: string;
  slug?: string;
  code?: string;
  description?: string;
  image?: string;
  status?: string;
  categoryId: string;
}): Promise<SubCategory> {
  const res = await fetch(`${API_BASE_URL}/sub-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create sub category");
  return data.data;
}

export async function updateSubCategoryApi(id: string, payload: Partial<SubCategory>): Promise<SubCategory> {
  const res = await fetch(`${API_BASE_URL}/sub-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update sub category");
  return data.data;
}

export async function deleteSubCategoryApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sub-categories/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete sub category");
}

// ==================== ORDERS ====================
export async function createOrderApi(orderPayload: {
  items: { productId: string; quantity: number }[];
  customerId?: string | null;
  discount: number;
  tax: number;
  paymentMethod: "CASH" | "PROMPTPAY" | "CREDIT_CARD";
  cashierName?: string;
  notes?: string;
}): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create order");
  }
  return data.data;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/orders`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = await res.json();
  return data.data;
}

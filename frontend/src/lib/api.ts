import {
  Brand,
  Category,
  DashboardStats,
  Order,
  Product,
  SubCategory,
  Unit,
  VariantAttribute,
  Warranty,
  Warehouse,
  Store,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ==================== DASHBOARD ====================
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
  const data = await res.json();
  return data.data;
}

// ==================== PRODUCTS ====================
export async function fetchProducts(params?: {
  categoryId?: string;
  warehouseId?: string;
  storeId?: string;
  search?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.categoryId && params.categoryId !== "all") query.set("categoryId", params.categoryId);
  if (params?.warehouseId && params.warehouseId !== "all") query.set("warehouseId", params.warehouseId);
  if (params?.storeId && params.storeId !== "all") query.set("storeId", params.storeId);
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

// ==================== WARRANTIES ====================
export async function fetchWarranties(params?: { status?: string; search?: string }): Promise<Warranty[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/warranties?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch warranties");
  return await res.json();
}

export async function createWarrantyApi(payload: {
  name: string;
  description?: string;
  duration: string;
  status?: string;
}): Promise<Warranty> {
  const res = await fetch(`${API_BASE_URL}/warranties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create warranty");
  return await res.json();
}

export async function updateWarrantyApi(id: string, payload: Partial<Warranty>): Promise<Warranty> {
  const res = await fetch(`${API_BASE_URL}/warranties/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update warranty");
  return await res.json();
}

export async function deleteWarrantyApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/warranties/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete warranty");
}

// ==================== VARIANT ATTRIBUTES ====================
export async function fetchVariantAttributes(params?: { status?: string; search?: string }): Promise<VariantAttribute[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/variant-attributes?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch variant attributes");
  return await res.json();
}

export async function createVariantAttributeApi(payload: {
  name: string;
  values: string;
  status?: string;
}): Promise<VariantAttribute> {
  const res = await fetch(`${API_BASE_URL}/variant-attributes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create variant attribute");
  return await res.json();
}

export async function updateVariantAttributeApi(id: string, payload: Partial<VariantAttribute>): Promise<VariantAttribute> {
  const res = await fetch(`${API_BASE_URL}/variant-attributes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update variant attribute");
  return await res.json();
}

export async function deleteVariantAttributeApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/variant-attributes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete variant attribute");
}

// ==================== WAREHOUSES & STORES ====================
export async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await fetch(`${API_BASE_URL}/warehouses`, { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchStores(): Promise<Store[]> {
  const res = await fetch(`${API_BASE_URL}/stores`, { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

// ==================== BRANDS ====================
export async function fetchBrands(params?: { status?: string; search?: string }): Promise<Brand[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/brands?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch brands");
  return await res.json();
}

export async function createBrandApi(payload: {
  name: string;
  slug?: string;
  image?: string;
  status?: string;
}): Promise<Brand> {
  const res = await fetch(`${API_BASE_URL}/brands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create brand");
  return await res.json();
}

export async function updateBrandApi(id: string, payload: Partial<Brand>): Promise<Brand> {
  const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update brand");
  return await res.json();
}

export async function deleteBrandApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/brands/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete brand");
}

// ==================== UNITS ====================
export async function fetchUnits(params?: { status?: string; search?: string }): Promise<Unit[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/units?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch units");
  return await res.json();
}

export async function createUnitApi(payload: {
  name: string;
  shortName: string;
  status?: string;
}): Promise<Unit> {
  const res = await fetch(`${API_BASE_URL}/units`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create unit");
  return await res.json();
}

export async function updateUnitApi(id: string, payload: Partial<Unit>): Promise<Unit> {
  const res = await fetch(`${API_BASE_URL}/units/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update unit");
  return await res.json();
}

export async function deleteUnitApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/units/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete unit");
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

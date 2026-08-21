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
  StockTransfer,
  StockAdjustment,
  Customer,
  Supplier,
  Biller,
  Shift,
  Department,
  Designation,
  Employee,
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

// ==================== STOCK TRANSFERS ====================
export async function fetchStockTransfers(params?: {
  fromWarehouse?: string;
  toWarehouse?: string;
  search?: string;
}): Promise<StockTransfer[]> {
  const query = new URLSearchParams();
  if (params?.fromWarehouse && params.fromWarehouse !== "all") query.set("fromWarehouse", params.fromWarehouse);
  if (params?.toWarehouse && params.toWarehouse !== "all") query.set("toWarehouse", params.toWarehouse);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/stock-transfers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

export async function createStockTransferApi(payload: {
  fromWarehouse: string;
  toWarehouse: string;
  noOfProducts: number;
  quantityTransferred: number;
  refNumber?: string;
  date?: string;
  notes?: string;
}): Promise<StockTransfer> {
  const res = await fetch(`${API_BASE_URL}/stock-transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create stock transfer");
  return await res.json();
}

export async function deleteStockTransferApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/stock-transfers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete stock transfer");
}

// ==================== STOCK ADJUSTMENTS ====================
export async function fetchStockAdjustments(params?: {
  warehouse?: string;
  search?: string;
}): Promise<StockAdjustment[]> {
  const query = new URLSearchParams();
  if (params?.warehouse && params.warehouse !== "all") query.set("warehouse", params.warehouse);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/stock-adjustments?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

export async function createStockAdjustmentApi(payload: {
  warehouse: string;
  store: string;
  productName: string;
  productImage?: string;
  date?: string;
  personName?: string;
  qty: number;
  type?: "ADDITION" | "SUBTRACTION";
  notes?: string;
}): Promise<StockAdjustment> {
  const res = await fetch(`${API_BASE_URL}/stock-adjustments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create stock adjustment");
  return await res.json();
}

export async function deleteStockAdjustmentApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/stock-adjustments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete stock adjustment");
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

// ==================== WAREHOUSES ====================
export async function fetchWarehouses(params?: { status?: string; search?: string }): Promise<Warehouse[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/warehouses?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createWarehouseApi(payload: Partial<Warehouse>): Promise<Warehouse> {
  const res = await fetch(`${API_BASE_URL}/warehouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create warehouse");
  return data.data;
}

export async function updateWarehouseApi(id: string, payload: Partial<Warehouse>): Promise<Warehouse> {
  const res = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update warehouse");
  return data.data;
}

export async function deleteWarehouseApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/warehouses/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete warehouse");
}

// ==================== STORES ====================
export async function fetchStores(params?: { status?: string; search?: string }): Promise<Store[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/stores?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createStoreApi(payload: Partial<Store>): Promise<Store> {
  const res = await fetch(`${API_BASE_URL}/stores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create store");
  return data.data;
}

export async function updateStoreApi(id: string, payload: Partial<Store>): Promise<Store> {
  const res = await fetch(`${API_BASE_URL}/stores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update store");
  return data.data;
}

export async function deleteStoreApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/stores/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete store");
}

// ==================== SUPPLIERS ====================
export async function fetchSuppliers(params?: { status?: string; search?: string }): Promise<Supplier[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/suppliers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createSupplierApi(payload: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${API_BASE_URL}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create supplier");
  return data.data;
}

export async function updateSupplierApi(id: string, payload: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update supplier");
  return data.data;
}

export async function deleteSupplierApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete supplier");
}

// ==================== BILLERS ====================
export async function fetchBillers(params?: { status?: string; search?: string }): Promise<Biller[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/billers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createBillerApi(payload: Partial<Biller>): Promise<Biller> {
  const res = await fetch(`${API_BASE_URL}/billers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create biller");
  return data.data;
}

export async function updateBillerApi(id: string, payload: Partial<Biller>): Promise<Biller> {
  const res = await fetch(`${API_BASE_URL}/billers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update biller");
  return data.data;
}

export async function deleteBillerApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/billers/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete biller");
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

// ==================== CUSTOMERS ====================
export async function fetchCustomers(params?: {
  status?: string;
  search?: string;
}): Promise<Customer[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/customers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch customers");
  const data = await res.json();
  return data.data;
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch customer");
  const data = await res.json();
  return data.data;
}

export async function createCustomerApi(payload: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create customer");
  return data.data;
}

export async function updateCustomerApi(id: string, payload: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update customer");
  return data.data;
}

export async function deleteCustomerApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete customer");
}

// ==================== SHIFTS ====================
export async function fetchShifts(params?: { status?: string; search?: string }): Promise<Shift[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/shifts?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createShiftApi(payload: Partial<Shift>): Promise<Shift> {
  const res = await fetch(`${API_BASE_URL}/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create shift");
  return data.data;
}

export async function updateShiftApi(id: string, payload: Partial<Shift>): Promise<Shift> {
  const res = await fetch(`${API_BASE_URL}/shifts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update shift");
  return data.data;
}

export async function deleteShiftApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/shifts/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete shift");
}

// ==================== DEPARTMENTS ====================
export async function fetchDepartments(params?: { status?: string; search?: string }): Promise<Department[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/departments?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createDepartmentApi(payload: Partial<Department>): Promise<Department> {
  const res = await fetch(`${API_BASE_URL}/departments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create department");
  return data.data;
}

export async function updateDepartmentApi(id: string, payload: Partial<Department>): Promise<Department> {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update department");
  return data.data;
}

export async function deleteDepartmentApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete department");
}

// ==================== DESIGNATIONS ====================
export async function fetchDesignations(params?: { status?: string; department?: string; search?: string }): Promise<Designation[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.department && params.department !== "all") query.set("department", params.department);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/designations?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createDesignationApi(payload: Partial<Designation>): Promise<Designation> {
  const res = await fetch(`${API_BASE_URL}/designations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create designation");
  return data.data;
}

export async function updateDesignationApi(id: string, payload: Partial<Designation>): Promise<Designation> {
  const res = await fetch(`${API_BASE_URL}/designations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update designation");
  return data.data;
}

export async function deleteDesignationApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/designations/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete designation");
}

// ==================== EMPLOYEES ====================
export async function fetchEmployees(params?: {
  status?: string;
  department?: string;
  role?: string;
  search?: string;
}): Promise<{ employees: Employee[]; stats: { total: number; active: number; inactive: number; newJoiners: number } }> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.department && params.department !== "all") query.set("department", params.department);
  if (params?.role && params.role !== "all") query.set("role", params.role);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/employees?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return { employees: [], stats: { total: 0, active: 0, inactive: 0, newJoiners: 0 } };
  const data = await res.json();
  return {
    employees: data.data || [],
    stats: data.stats || { total: 1007, active: 1007, inactive: 1007, newJoiners: 67 },
  };
}

export async function createEmployeeApi(payload: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`${API_BASE_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create employee");
  return data.data;
}

export async function updateEmployeeApi(id: string, payload: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update employee");
  return data.data;
}

export async function deleteEmployeeApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/employees/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete employee");
}


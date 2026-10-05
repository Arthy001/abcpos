import {
  Brand,
  Category,
  DashboardStats,
  Order,
  PosShift,
  PosShiftMovement,
  PosShiftCurrentResponse,
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
  AttendanceRecord,
  LeaveType,
  Leave,
  Holiday,
  Payroll,
  SalesReportItem,
  SalesReportSummary,
  PurchaseReportItem,
  InventoryReportItem,
  StockHistoryItem,
  SoldStockItem,
  InvoiceReportItem,
  SupplierReportItem,
  SupplierDueReportItem,
  CustomerReportItem,
  CustomerDueReportItem,
  ProductReportItem,
  ProductExpiryReportItem,
  ProductQuantityAlertItem,
  ExpenseReportItem,
  IncomeReportItem,
  PurchaseTaxReportItem,
  SalesTaxReportItem,
  ProfitLossReportItem,
  AnnualReportItem,
  SystemUser,
  RoleItem,
  DeleteAccountRequestItem,
  UserProfileSettings,
  UserSecuritySettings,
  UserSessionLog,
  UserNotificationSettings,
  ConnectedAppItem,
  CompanySettings,
  PrefixSettings,
  PosSettings,
  BalanceSheetData,
  TrialBalanceData,
  AuditLogItem,
  Purchase,
  PurchaseItem,
  PurchaseOrderItem,
  PurchaseReturn,
  Sale,
  SaleItem,
  Invoice,
  SalesReturn,
  Quotation,
  ProductStock,
  StockMovement,
  Expense,
  ExpenseCategory,
  Income,
  IncomeCategory,
  BankAccount,
  MoneyTransfer,
  Coupon,
  Discount,
  DiscountPlan,
  GiftCard,
} from "@/types";

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Server-side (SSR/API route): ใช้ localhost ตรงๆ
  if (typeof window === "undefined") {
    return "http://127.0.0.1:5000/api";
  }
  // Browser: ใช้ /api relative path → Next.js App Route Handler proxy ไปที่ localhost:5000
  return "/api";
}

// ต้องเรียก getApiBaseUrl() ทุกครั้งที่ใช้ เพื่อให้รู้ว่าอยู่ฝั่งไหน
const API_BASE_URL = getApiBaseUrl();

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
  brandId?: string;
  unitId?: string;
  warehouseId?: string;
  storeId?: string;
  status?: string;
  search?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.categoryId && params.categoryId !== "all") query.set("categoryId", params.categoryId);
  if (params?.brandId && params.brandId !== "all") query.set("brandId", params.brandId);
  if (params?.unitId && params.unitId !== "all") query.set("unitId", params.unitId);
  if (params?.warehouseId && params.warehouseId !== "all") query.set("warehouseId", params.warehouseId);
  if (params?.storeId && params.storeId !== "all") query.set("storeId", params.storeId);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.data || [];
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch product details");
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Product not found");
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
  brandId?: string;
  unitId?: string;
  warehouseId?: string;
  storeId?: string;
  image?: string;
  status?: string;
  manufacturedDate?: string;
  expiredDate?: string;
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

export async function updateProductApi(
  id: string,
  payload: {
    name?: string;
    sku?: string;
    barcode?: string | null;
    description?: string | null;
    price?: number;
    costPrice?: number;
    stock?: number;
    minStockAlert?: number;
    categoryId?: string | null;
    brandId?: string | null;
    unitId?: string | null;
    warehouseId?: string | null;
    storeId?: string | null;
    image?: string | null;
    status?: string;
    manufacturedDate?: string | null;
    expiredDate?: string | null;
  }
): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to update product");
  }
  return data.data;
}

export async function deleteProductApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to delete product");
  }
}

export async function bulkDeleteProductsApi(ids: string[]): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE_URL}/products/bulk-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to bulk delete products");
  }
  return data;
}

// ==================== STOCK TRANSFERS ====================
export async function fetchStockTransfers(params?: {
  fromWarehouse?: string;
  toWarehouse?: string;
  status?: string;
  search?: string;
}): Promise<StockTransfer[]> {
  const query = new URLSearchParams();
  if (params?.fromWarehouse && params.fromWarehouse !== "all") query.set("fromWarehouse", params.fromWarehouse);
  if (params?.toWarehouse && params.toWarehouse !== "all") query.set("toWarehouse", params.toWarehouse);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/stock-transfers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchStockTransferById(id: string): Promise<StockTransfer> {
  const res = await fetch(`${API_BASE_URL}/stock-transfers/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stock transfer details");
  return await res.json();
}

export async function createStockTransferApi(payload: {
  fromWarehouse: string;
  toWarehouse: string;
  noOfProducts: number;
  quantityTransferred: number;
  refNumber?: string;
  date?: string;
  status?: "COMPLETED" | "PENDING" | "CANCELLED";
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

export async function updateStockTransferApi(
  id: string,
  payload: {
    fromWarehouse?: string;
    toWarehouse?: string;
    noOfProducts?: number;
    quantityTransferred?: number;
    refNumber?: string;
    date?: string;
    status?: "COMPLETED" | "PENDING" | "CANCELLED";
    notes?: string;
  }
): Promise<StockTransfer> {
  const res = await fetch(`${API_BASE_URL}/stock-transfers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update stock transfer");
  return await res.json();
}

export async function deleteStockTransferApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/stock-transfers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete stock transfer");
}

// ==================== STOCK ADJUSTMENTS ====================
export async function fetchStockAdjustments(params?: {
  warehouse?: string;
  store?: string;
  type?: string;
  search?: string;
}): Promise<StockAdjustment[]> {
  const query = new URLSearchParams();
  if (params?.warehouse && params.warehouse !== "all") query.set("warehouse", params.warehouse);
  if (params?.store && params.store !== "all") query.set("store", params.store);
  if (params?.type && params.type !== "all") query.set("type", params.type);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/stock-adjustments?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchStockAdjustmentById(id: string): Promise<StockAdjustment> {
  const res = await fetch(`${API_BASE_URL}/stock-adjustments/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stock adjustment details");
  return await res.json();
}

export async function createStockAdjustmentApi(payload: {
  warehouse: string;
  store: string;
  productName: string;
  productImage?: string;
  date?: string;
  personName?: string;
  personAvatar?: string;
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

export async function updateStockAdjustmentApi(
  id: string,
  payload: {
    warehouse?: string;
    store?: string;
    productName?: string;
    productImage?: string;
    date?: string;
    personName?: string;
    personAvatar?: string;
    qty?: number;
    type?: "ADDITION" | "SUBTRACTION";
    notes?: string;
  }
): Promise<StockAdjustment> {
  const res = await fetch(`${API_BASE_URL}/stock-adjustments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update stock adjustment");
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

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch order");
  const data = await res.json();
  return data.data;
}

export async function voidOrderApi(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/void`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to void order");
  }
  return data.data;
}

// ==================== POS SHIFTS & CASH DRAWER ====================
export async function fetchCurrentShift(): Promise<PosShiftCurrentResponse> {
  const res = await fetch(`${API_BASE_URL}/pos-shifts/current`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch current shift");
  return res.json();
}

export async function openShiftApi(payload: {
  cashierName?: string;
  openingFloat: number;
  storeName?: string;
  notes?: string;
}): Promise<PosShift> {
  const res = await fetch(`${API_BASE_URL}/pos-shifts/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to open shift");
  }
  return data.data;
}

export async function recordShiftMovementApi(payload: {
  shiftId: string;
  type: "PAY_IN" | "PAY_OUT";
  amount: number;
  reason?: string;
}): Promise<PosShiftMovement> {
  const res = await fetch(`${API_BASE_URL}/pos-shifts/movement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to record cash movement");
  }
  return data.data;
}

export async function closeShiftApi(payload: {
  shiftId: string;
  closingCashCounted: number;
  notes?: string;
}): Promise<PosShift> {
  const res = await fetch(`${API_BASE_URL}/pos-shifts/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to close shift");
  }
  return data.data;
}

export async function fetchShiftsHistory(params?: {
  status?: string;
  cashierName?: string;
  search?: string;
}): Promise<PosShift[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.cashierName && params.cashierName !== "all") query.set("cashierName", params.cashierName);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/pos-shifts?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch shift history");
  const data = await res.json();
  return data.data || [];
}

export async function fetchShiftById(id: string): Promise<PosShift> {
  const res = await fetch(`${API_BASE_URL}/pos-shifts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch shift details");
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

// ==================== ATTENDANCE ====================
export async function fetchAttendanceRecords(params?: {
  status?: string;
  search?: string;
}): Promise<{
  records: AttendanceRecord[];
  summary: {
    totalWorkingDays: number;
    absentDays: number;
    presentDays: number;
    halfDays: number;
    lateDays: number;
    holidays: number;
  };
}> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/attendance?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    return {
      records: [],
      summary: {
        totalWorkingDays: 31,
        absentDays: 5,
        presentDays: 28,
        halfDays: 2,
        lateDays: 1,
        holidays: 2,
      },
    };
  }
  const data = await res.json();
  return {
    records: data.data || [],
    summary: data.summary || {
      totalWorkingDays: 31,
      absentDays: 5,
      presentDays: 28,
      halfDays: 2,
      lateDays: 1,
      holidays: 2,
    },
  };
}

export async function createAttendanceRecordApi(payload: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
  const res = await fetch(`${API_BASE_URL}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create attendance record");
  return data.data;
}

export async function updateAttendanceRecordApi(id: string, payload: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
  const res = await fetch(`${API_BASE_URL}/attendance/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update attendance record");
  return data.data;
}

export async function deleteAttendanceRecordApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/attendance/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete attendance record");
}

// ==================== LEAVE TYPES ====================
export async function fetchLeaveTypes(params?: { status?: string; search?: string }): Promise<LeaveType[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/leave-types?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createLeaveTypeApi(payload: Partial<LeaveType>): Promise<LeaveType> {
  const res = await fetch(`${API_BASE_URL}/leave-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create leave type");
  return data.data;
}

export async function updateLeaveTypeApi(id: string, payload: Partial<LeaveType>): Promise<LeaveType> {
  const res = await fetch(`${API_BASE_URL}/leave-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update leave type");
  return data.data;
}

export async function deleteLeaveTypeApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/leave-types/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete leave type");
}

// ==================== LEAVES ====================
export async function fetchLeaves(params?: { status?: string; type?: string; empCode?: string; search?: string }): Promise<Leave[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.type && params.type !== "all") query.set("type", params.type);
  if (params?.empCode) query.set("empCode", params.empCode);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/leaves?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createLeaveApi(payload: Partial<Leave>): Promise<Leave> {
  const res = await fetch(`${API_BASE_URL}/leaves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create leave");
  return data.data;
}

export async function updateLeaveApi(id: string, payload: Partial<Leave>): Promise<Leave> {
  const res = await fetch(`${API_BASE_URL}/leaves/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update leave");
  return data.data;
}

export async function deleteLeaveApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/leaves/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete leave");
}

// ==================== HOLIDAYS ====================
export async function fetchHolidays(params?: { status?: string; search?: string }): Promise<Holiday[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/holidays?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function createHolidayApi(payload: Partial<Holiday>): Promise<Holiday> {
  const res = await fetch(`${API_BASE_URL}/holidays`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create holiday");
  return data.data;
}

export async function updateHolidayApi(id: string, payload: Partial<Holiday>): Promise<Holiday> {
  const res = await fetch(`${API_BASE_URL}/holidays/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update holiday");
  return data.data;
}

export async function deleteHolidayApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/holidays/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete holiday");
}

// ==================== PAYROLL & PAYSLIP ====================
export async function fetchPayrolls(params?: { status?: string; search?: string }): Promise<Payroll[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/payroll?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data;
}

export async function fetchPayrollById(id: string): Promise<Payroll | null> {
  const res = await fetch(`${API_BASE_URL}/payroll/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

export async function createPayrollApi(payload: Partial<Payroll>): Promise<Payroll> {
  const res = await fetch(`${API_BASE_URL}/payroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to create payroll record");
  return data.data;
}

export async function updatePayrollApi(id: string, payload: Partial<Payroll>): Promise<Payroll> {
  const res = await fetch(`${API_BASE_URL}/payroll/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to update payroll record");
  return data.data;
}

export async function deletePayrollApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/payroll/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete payroll record");
}

// ==================== SALES REPORTS & BESTSELLERS ====================
export async function fetchSalesReport(params?: {
  store?: string;
  product?: string;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  summary: SalesReportSummary;
  items: SalesReportItem[];
}> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All" && params.store !== "all") query.set("store", params.store);
  if (params?.product && params.product !== "All" && params.product !== "all") query.set("product", params.product);
  if (params?.category && params.category !== "All" && params.category !== "all") query.set("category", params.category);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/sales?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    return {
      summary: { totalAmount: "฿0", totalPaid: "฿0", totalUnpaid: "฿0", overdue: "฿0" },
      items: [],
    };
  }
  const data = await res.json();
  return {
    summary: data.summary || { totalAmount: "฿0", totalPaid: "฿0", totalUnpaid: "฿0", overdue: "฿0" },
    items: data.items || [],
  };
}

export async function fetchBestsellersReport(params?: {
  store?: string;
  product?: string;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<SalesReportItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All" && params.store !== "all") query.set("store", params.store);
  if (params?.product && params.product !== "All" && params.product !== "all") query.set("product", params.product);
  if (params?.category && params.category !== "All" && params.category !== "all") query.set("category", params.category);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/bestsellers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchPurchaseReport(params?: { store?: string; product?: string; search?: string }): Promise<PurchaseReportItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.product && params.product !== "All") query.set("product", params.product);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/purchases?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

// ==================== INVENTORY REPORTS, STOCK HISTORY & SOLD STOCK ====================
export async function fetchInventoryReport(params?: { store?: string; product?: string; category?: string; search?: string }): Promise<InventoryReportItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.product && params.product !== "All") query.set("product", params.product);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/inventory?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchStockHistoryReport(params?: { store?: string; product?: string; category?: string; search?: string }): Promise<StockHistoryItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.product && params.product !== "All") query.set("product", params.product);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/stock-history?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchSoldStockReport(params?: { store?: string; product?: string; category?: string; search?: string }): Promise<SoldStockItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.product && params.product !== "All") query.set("product", params.product);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/sold-stock?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchInvoiceReport(params?: { customer?: string; status?: string; search?: string }): Promise<{
  summary: { totalAmount: string; totalPaid: string; totalUnpaid: string; overdue: string };
  items: InvoiceReportItem[];
}> {
  const query = new URLSearchParams();
  if (params?.customer && params.customer !== "All") query.set("customer", params.customer);
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/invoices?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    return {
      summary: { totalAmount: "$4,56,000", totalPaid: "$2,56,42", totalUnpaid: "$1,52,45", overdue: "$2,56,12" },
      items: [],
    };
  }
  const data = await res.json();
  return {
    summary: data.summary || { totalAmount: "$4,56,000", totalPaid: "$2,56,42", totalUnpaid: "$1,52,45", overdue: "$2,56,12" },
    items: data.items || [],
  };
}

// ==================== SUPPLIER REPORTS ====================
export async function fetchSupplierReport(params?: { supplier?: string; status?: string; paymentMethod?: string; search?: string }): Promise<{
  total: string;
  items: SupplierReportItem[];
}> {
  const query = new URLSearchParams();
  if (params?.supplier && params.supplier !== "All") query.set("supplier", params.supplier);
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.paymentMethod && params.paymentMethod !== "All") query.set("paymentMethod", params.paymentMethod);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/suppliers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return { total: "$33268.53", items: [] };
  const data = await res.json();
  return { total: data.total || "$33268.53", items: data.items || [] };
}

export async function fetchSupplierDueReport(params?: { supplier?: string; status?: string; reference?: string; search?: string }): Promise<{
  totalAmount: number;
  paid: string;
  due: string;
  items: SupplierDueReportItem[];
}> {
  const query = new URLSearchParams();
  if (params?.supplier && params.supplier !== "All") query.set("supplier", params.supplier);
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.reference) query.set("reference", params.reference);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/suppliers/due?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return { totalAmount: 33268, paid: "$33268.53", due: "$0.0", items: [] };
  const data = await res.json();
  return { totalAmount: data.totalAmount || 33268, paid: data.paid || "$33268.53", due: data.due || "$0.0", items: data.items || [] };
}

// ==================== CUSTOMER REPORTS ====================
export async function fetchCustomerReport(params?: { customer?: string; paymentMethod?: string; status?: string; search?: string }): Promise<{
  total: string;
  items: CustomerReportItem[];
}> {
  const query = new URLSearchParams();
  if (params?.customer && params.customer !== "All") query.set("customer", params.customer);
  if (params?.paymentMethod && params.paymentMethod !== "All") query.set("paymentMethod", params.paymentMethod);
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/customers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return { total: "$33268.53", items: [] };
  const data = await res.json();
  return { total: data.total || "$33268.53", items: data.items || [] };
}

export async function fetchCustomerDueReport(params?: { customer?: string; paymentMethod?: string; status?: string; search?: string }): Promise<{
  totalAmount: number;
  paid: string;
  due: string;
  items: CustomerDueReportItem[];
}> {
  const query = new URLSearchParams();
  if (params?.customer && params.customer !== "All") query.set("customer", params.customer);
  if (params?.paymentMethod && params.paymentMethod !== "All") query.set("paymentMethod", params.paymentMethod);
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/customers/due?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return { totalAmount: 33268, paid: "$33268.53", due: "$0.0", items: [] };
  const data = await res.json();
  return { totalAmount: data.totalAmount || 33268, paid: data.paid || "$33268.53", due: data.due || "$0.0", items: data.items || [] };
}

// ==================== PRODUCT REPORTS ====================
export async function fetchProductReport(params?: {
  store?: string;
  category?: string;
  brand?: string;
  product?: string;
  search?: string;
}): Promise<ProductReportItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.brand && params.brand !== "All") query.set("brand", params.brand);
  if (params?.product && params.product !== "All") query.set("product", params.product);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/products?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchProductExpiryReport(params?: {
  store?: string;
  category?: string;
  brand?: string;
  product?: string;
  search?: string;
}): Promise<ProductExpiryReportItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.brand && params.brand !== "All") query.set("brand", params.brand);
  if (params?.product && params.product !== "All") query.set("product", params.product);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/products/expiry?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchProductQuantityAlertReport(params?: {
  store?: string;
  category?: string;
  brand?: string;
  product?: string;
  search?: string;
}): Promise<ProductQuantityAlertItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.brand && params.brand !== "All") query.set("brand", params.brand);
  if (params?.product && params.product !== "All") query.set("product", params.product);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/products/quantity-alert?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

// ==================== EXPENSE REPORT ====================
export async function fetchExpenseReport(params?: {
  category?: string;
  paymentMethod?: string;
  status?: string;
  search?: string;
}): Promise<ExpenseReportItem[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.paymentMethod && params.paymentMethod !== "All") query.set("paymentMethod", params.paymentMethod);
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/expenses?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

// ==================== INCOME REPORT ====================
export async function fetchIncomeReport(params?: {
  category?: string;
  paymentMethod?: string;
  status?: string;
  search?: string;
}): Promise<IncomeReportItem[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.paymentMethod && params.paymentMethod !== "All") query.set("paymentMethod", params.paymentMethod);
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/income?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

// ==================== TAX, PROFIT/LOSS & ANNUAL REPORTS ====================
export async function fetchPurchaseTaxReport(params?: {
  store?: string;
  supplier?: string;
  paymentMethod?: string;
  search?: string;
}): Promise<PurchaseTaxReportItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.supplier && params.supplier !== "All") query.set("supplier", params.supplier);
  if (params?.paymentMethod && params.paymentMethod !== "All") query.set("paymentMethod", params.paymentMethod);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/tax/purchase?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchSalesTaxReport(params?: {
  store?: string;
  customer?: string;
  paymentMethod?: string;
  search?: string;
}): Promise<SalesTaxReportItem[]> {
  const query = new URLSearchParams();
  if (params?.store && params.store !== "All") query.set("store", params.store);
  if (params?.customer && params.customer !== "All") query.set("customer", params.customer);
  if (params?.paymentMethod && params.paymentMethod !== "All") query.set("paymentMethod", params.paymentMethod);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/reports/tax/sales?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchProfitLossReport(): Promise<ProfitLossReportItem[]> {
  const res = await fetch(`${API_BASE_URL}/reports/profit-loss`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchAnnualReport(params?: { year?: number; store?: string }): Promise<AnnualReportItem[]> {
  const query = new URLSearchParams();
  if (params?.year) query.set("year", String(params.year));
  if (params?.store && params.store !== "All Stores") query.set("store", params.store);

  const res = await fetch(`${API_BASE_URL}/reports/annual?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

// ==================== USER MANAGEMENT ====================
export async function fetchUsers(params?: { status?: string; search?: string; role?: string; warehouse?: string; store?: string }): Promise<SystemUser[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.role && params.role !== "all") query.set("role", params.role);
  if (params?.warehouse && params.warehouse !== "all") query.set("warehouse", params.warehouse);
  if (params?.store && params.store !== "all") query.set("store", params.store);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/users?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function createUserApi(payload: Partial<SystemUser>): Promise<SystemUser> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to create user");
  }
  return data.data;
}

export async function updateUserApi(id: string, payload: Partial<SystemUser>): Promise<SystemUser> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to update user");
  }
  return data.data;
}

export async function deleteUserApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to delete user");
  }
  return true;
}

export async function fetchRoles(params?: { status?: string; search?: string }): Promise<RoleItem[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/roles?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function createRoleApi(payload: Partial<RoleItem>): Promise<RoleItem> {
  const res = await fetch(`${API_BASE_URL}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to create role");
  }
  return data.data;
}

export async function updateRoleApi(id: string, payload: Partial<RoleItem>): Promise<RoleItem> {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to update role");
  }
  return data.data;
}

export async function deleteRoleApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to delete role");
  }
  return true;
}

export async function fetchDeleteAccountRequests(params?: { search?: string }): Promise<DeleteAccountRequestItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/delete-account-requests?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function createDeleteAccountRequestApi(payload: Partial<DeleteAccountRequestItem>): Promise<DeleteAccountRequestItem> {
  const res = await fetch(`${API_BASE_URL}/delete-account-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to create delete request");
  }
  return data.data;
}

export async function deleteAccountRequestActionApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/delete-account-requests/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || "Failed to delete request");
  }
  return true;
}

// ==================== GENERAL SETTINGS ====================
export async function fetchProfileSettings(): Promise<UserProfileSettings> {
  const res = await fetch(`${API_BASE_URL}/settings/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch profile settings");
  const data = await res.json();
  return data.profile;
}

export async function updateProfileSettingsApi(payload: Partial<UserProfileSettings>): Promise<UserProfileSettings> {
  const res = await fetch(`${API_BASE_URL}/settings/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update profile");
  return data.profile;
}

export async function fetchSecuritySettings(): Promise<{ security: UserSecuritySettings; sessionLogs: UserSessionLog[] }> {
  const res = await fetch(`${API_BASE_URL}/settings/security`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch security settings");
  const data = await res.json();
  return { security: data.security, sessionLogs: data.sessionLogs || [] };
}

export async function updateSecuritySettingsApi(payload: Partial<UserSecuritySettings>): Promise<UserSecuritySettings> {
  const res = await fetch(`${API_BASE_URL}/settings/security`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update security settings");
  return data.security;
}

export async function terminateSessionLogApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/settings/security/sessions/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to terminate session");
  return true;
}

export async function fetchNotificationSettings(): Promise<UserNotificationSettings> {
  const res = await fetch(`${API_BASE_URL}/settings/notifications`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch notification settings");
  const data = await res.json();
  return data.notifications;
}

export async function updateNotificationSettingsApi(payload: Partial<UserNotificationSettings>): Promise<UserNotificationSettings> {
  const res = await fetch(`${API_BASE_URL}/settings/notifications`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update notifications");
  return data.notifications;
}

export async function fetchConnectedApps(): Promise<ConnectedAppItem[]> {
  const res = await fetch(`${API_BASE_URL}/settings/connected-apps`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch connected apps");
  const data = await res.json();
  return data.apps || [];
}

export async function toggleConnectedAppApi(id: string, status: "CONNECTED" | "DISCONNECTED", connectedAccount?: string): Promise<ConnectedAppItem> {
  const res = await fetch(`${API_BASE_URL}/settings/connected-apps/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, connectedAccount }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update connected app");
  return data.app;
}

// ==================== COMPANY SETTINGS ====================
export async function fetchCompanySettings(): Promise<CompanySettings> {
  const res = await fetch(`${API_BASE_URL}/settings/company`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch company settings");
  const data = await res.json();
  return data.company;
}

export async function updateCompanySettingsApi(payload: Partial<CompanySettings>): Promise<CompanySettings> {
  const res = await fetch(`${API_BASE_URL}/settings/company`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update company settings");
  return data.company;
}

// ==================== PREFIX SETTINGS ====================
export async function fetchPrefixSettings(): Promise<PrefixSettings> {
  const res = await fetch(`${API_BASE_URL}/settings/prefixes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch prefix settings");
  const data = await res.json();
  return data.prefixes;
}

export async function updatePrefixSettingsApi(payload: Partial<PrefixSettings>): Promise<PrefixSettings> {
  const res = await fetch(`${API_BASE_URL}/settings/prefixes`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update prefix settings");
  return data.prefixes;
}

// ==================== POS SETTINGS ====================
export async function fetchPosSettings(): Promise<PosSettings> {
  const res = await fetch(`${API_BASE_URL}/settings/pos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch POS settings");
  const data = await res.json();
  return data.posSettings;
}

export async function updatePosSettingsApi(payload: Partial<PosSettings>): Promise<PosSettings> {
  const res = await fetch(`${API_BASE_URL}/settings/pos`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Failed to update POS settings");
  return data.posSettings;
}

// ==================== BALANCE SHEET & TRIAL BALANCE ====================
export async function fetchBalanceSheetApi(): Promise<BalanceSheetData> {
  const res = await fetch(`${API_BASE_URL}/finance/balance-sheet`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch balance sheet data");
  const data = await res.json();
  return data.data;
}

export async function fetchTrialBalanceApi(): Promise<TrialBalanceData> {
  const res = await fetch(`${API_BASE_URL}/finance/trial-balance`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch trial balance data");
  const data = await res.json();
  return data.data;
}

// ==================== AUDIT LOGS & RESTORE ====================
export async function fetchAuditLogsApi(params?: {
  action?: string;
  entityType?: string;
  search?: string;
}): Promise<AuditLogItem[]> {
  const query = new URLSearchParams();
  if (params?.action && params.action !== "all") query.set("action", params.action);
  if (params?.entityType && params.entityType !== "all") query.set("entityType", params.entityType);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/audit-logs?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return await res.json();
}

export async function restoreAuditLogApi(id: string): Promise<{ message: string; item: any }> {
  const res = await fetch(`${API_BASE_URL}/audit-logs/${id}/restore`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to restore item");
  return data;
}

export async function deleteAuditLogApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/audit-logs/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete audit log");
}

// ==================== PURCHASES ====================
export async function fetchPurchases(params?: {
  status?: string;
  paymentStatus?: string;
  supplierName?: string;
  search?: string;
}): Promise<Purchase[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.paymentStatus && params.paymentStatus !== "all") query.set("paymentStatus", params.paymentStatus);
  if (params?.supplierName && params.supplierName !== "all") query.set("supplierName", params.supplierName);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/purchases?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch purchases");
  return await res.json();
}

export async function fetchPurchaseById(id: string): Promise<Purchase> {
  const res = await fetch(`${API_BASE_URL}/purchases/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch purchase details");
  return await res.json();
}

export async function createPurchaseApi(payload: {
  reference?: string;
  supplierId?: string | null;
  supplierName: string;
  supplierImage?: string | null;
  warehouseName?: string | null;
  storeName?: string | null;
  date?: string;
  status?: string;
  paymentStatus?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  shipping?: number;
  total?: number;
  paid?: number;
  due?: number;
  notes?: string | null;
  items?: PurchaseItem[];
}): Promise<Purchase> {
  const res = await fetch(`${API_BASE_URL}/purchases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create purchase");
  }
  return await res.json();
}

export async function updatePurchaseApi(id: string, payload: Partial<Purchase>): Promise<Purchase> {
  const res = await fetch(`${API_BASE_URL}/purchases/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update purchase");
  }
  return await res.json();
}

export async function deletePurchaseApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/purchases/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete purchase");
}

// ==================== PURCHASE ORDERS (ITEM BREAKDOWN) ====================
export async function fetchPurchaseOrders(params?: { search?: string }): Promise<PurchaseOrderItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/purchase-orders?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch purchase orders");
  return await res.json();
}

// ==================== PURCHASE RETURNS ====================
export async function fetchPurchaseReturns(params?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
}): Promise<PurchaseReturn[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.paymentStatus && params.paymentStatus !== "all") query.set("paymentStatus", params.paymentStatus);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/purchase-returns?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch purchase returns");
  return await res.json();
}

export async function fetchPurchaseReturnById(id: string): Promise<PurchaseReturn> {
  const res = await fetch(`${API_BASE_URL}/purchase-returns/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch purchase return");
  return await res.json();
}

export async function createPurchaseReturnApi(payload: {
  reference?: string;
  purchaseReference?: string | null;
  supplierName: string;
  supplierImage?: string | null;
  warehouseName?: string | null;
  productName?: string | null;
  productImage?: string | null;
  quantity?: number;
  date?: string;
  status?: string;
  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus?: string;
  notes?: string | null;
}): Promise<PurchaseReturn> {
  const res = await fetch(`${API_BASE_URL}/purchase-returns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create purchase return");
  }
  return await res.json();
}

export async function updatePurchaseReturnApi(id: string, payload: Partial<PurchaseReturn>): Promise<PurchaseReturn> {
  const res = await fetch(`${API_BASE_URL}/purchase-returns/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update purchase return");
  }
  return await res.json();
}

export async function deletePurchaseReturnApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/purchase-returns/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete purchase return");
}

// ==================== SALES ====================
export async function fetchSales(params?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
}): Promise<Sale[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.paymentStatus && params.paymentStatus !== "all") query.set("paymentStatus", params.paymentStatus);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/sales?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sales");
  return await res.json();
}

export async function fetchSaleById(id: string): Promise<Sale> {
  const res = await fetch(`${API_BASE_URL}/sales/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sale details");
  return await res.json();
}

export async function createSaleApi(payload: {
  reference?: string;
  customerId?: string | null;
  customerName: string;
  customerAvatar?: string | null;
  billerName?: string | null;
  storeName?: string | null;
  warehouseName?: string | null;
  date?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  shipping?: number;
  grandTotal?: number;
  paid?: number;
  due?: number;
  notes?: string | null;
  items: Array<{
    productId?: string | null;
    productName: string;
    productImage?: string | null;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    tax?: number;
    discount?: number;
    subtotal: number;
    total: number;
  }>;
}): Promise<Sale> {
  const res = await fetch(`${API_BASE_URL}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create sale");
  }
  return await res.json();
}

export async function updateSaleApi(id: string, payload: Partial<Sale>): Promise<Sale> {
  const res = await fetch(`${API_BASE_URL}/sales/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update sale");
  }
  return await res.json();
}

export async function deleteSaleApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sales/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete sale");
}

// ==================== INVOICES ====================
export async function fetchInvoices(params?: {
  status?: string;
  search?: string;
}): Promise<Invoice[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/invoices?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return await res.json();
}

export async function updateInvoicePaymentApi(id: string, payload: {
  paid: number;
  status?: string;
}): Promise<Invoice> {
  const res = await fetch(`${API_BASE_URL}/invoices/${id}/pay`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update invoice payment");
  }
  return await res.json();
}

// ==================== SALES RETURNS ====================
export async function fetchSalesReturns(params?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
}): Promise<SalesReturn[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.paymentStatus && params.paymentStatus !== "all") query.set("paymentStatus", params.paymentStatus);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/sales-returns?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sales returns");
  return await res.json();
}

export async function createSalesReturnApi(payload: {
  reference?: string;
  saleReference?: string | null;
  customerId?: string | null;
  customerName: string;
  customerAvatar?: string | null;
  warehouseName?: string | null;
  productId?: string | null;
  productName?: string | null;
  productImage?: string | null;
  quantity?: number;
  date?: string;
  status?: string;
  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus?: string;
  notes?: string | null;
}): Promise<SalesReturn> {
  const res = await fetch(`${API_BASE_URL}/sales-returns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create sales return");
  }
  return await res.json();
}

export async function updateSalesReturnApi(id: string, payload: Partial<SalesReturn>): Promise<SalesReturn> {
  const res = await fetch(`${API_BASE_URL}/sales-returns/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update sales return");
  }
  return await res.json();
}

export async function deleteSalesReturnApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sales-returns/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete sales return");
}

// ==================== QUOTATIONS ====================
export async function fetchQuotations(params?: {
  status?: string;
  search?: string;
}): Promise<Quotation[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/quotations?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch quotations");
  return await res.json();
}

export async function createQuotationApi(payload: {
  reference?: string;
  customerId?: string | null;
  customerName: string;
  customerAvatar?: string | null;
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  quantity?: number;
  unitPrice?: number;
  tax?: number;
  discount?: number;
  total?: number;
  status?: string;
  validUntil?: string | null;
  notes?: string | null;
}): Promise<Quotation> {
  const res = await fetch(`${API_BASE_URL}/quotations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create quotation");
  }
  return await res.json();
}

export async function updateQuotationApi(id: string, payload: Partial<Quotation>): Promise<Quotation> {
  const res = await fetch(`${API_BASE_URL}/quotations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update quotation");
  }
  return await res.json();
}

export async function deleteQuotationApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/quotations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete quotation");
}

export async function convertQuotationToSaleApi(id: string): Promise<{ message: string; sale: Sale }> {
  const res = await fetch(`${API_BASE_URL}/quotations/${id}/convert`, {
    method: "POST",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to convert quotation to sale");
  }
  return await res.json();
}

// ==================== STOCK MOVEMENTS (STOCK CARD LEDGER) ====================
export async function fetchStockMovements(params?: {
  productId?: string;
  warehouseId?: string;
  type?: string;
  search?: string;
}): Promise<StockMovement[]> {
  const query = new URLSearchParams();
  if (params?.productId && params.productId !== "all") query.set("productId", params.productId);
  if (params?.warehouseId && params.warehouseId !== "all") query.set("warehouseId", params.warehouseId);
  if (params?.type && params.type !== "all") query.set("type", params.type);
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/stock-movements?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stock movements");
  return await res.json();
}

// ==================== 💰 FINANCE: EXPENSES ====================
export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch(`${API_BASE_URL}/finance/expenses`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return await res.json();
}

export async function createExpenseApi(data: Partial<Expense>): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/finance/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create expense");
  }
  return await res.json();
}

export async function updateExpenseApi(id: string, data: Partial<Expense>): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/finance/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update expense");
  }
  return await res.json();
}

export async function deleteExpenseApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/finance/expenses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete expense");
}

export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const res = await fetch(`${API_BASE_URL}/finance/expense-categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch expense categories");
  return await res.json();
}

export async function createExpenseCategoryApi(data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
  const res = await fetch(`${API_BASE_URL}/finance/expense-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create expense category");
  }
  return await res.json();
}

// ==================== 💵 FINANCE: INCOME ====================
export async function fetchIncomes(): Promise<Income[]> {
  const res = await fetch(`${API_BASE_URL}/finance/income`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch incomes");
  return await res.json();
}

export async function createIncomeApi(data: Partial<Income>): Promise<Income> {
  const res = await fetch(`${API_BASE_URL}/finance/income`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create income");
  }
  return await res.json();
}

export async function updateIncomeApi(id: string, data: Partial<Income>): Promise<Income> {
  const res = await fetch(`${API_BASE_URL}/finance/income/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update income");
  }
  return await res.json();
}

export async function deleteIncomeApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/finance/income/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete income");
}

export async function fetchIncomeCategories(): Promise<IncomeCategory[]> {
  const res = await fetch(`${API_BASE_URL}/finance/income-categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch income categories");
  return await res.json();
}

export async function createIncomeCategoryApi(data: Partial<IncomeCategory>): Promise<IncomeCategory> {
  const res = await fetch(`${API_BASE_URL}/finance/income-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create income category");
  }
  return await res.json();
}

// ==================== 🏦 FINANCE: BANK ACCOUNTS & TRANSFERS ====================
export async function fetchBankAccounts(): Promise<BankAccount[]> {
  const res = await fetch(`${API_BASE_URL}/finance/bank-accounts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch bank accounts");
  return await res.json();
}

export async function createBankAccountApi(data: Partial<BankAccount>): Promise<BankAccount> {
  const res = await fetch(`${API_BASE_URL}/finance/bank-accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create bank account");
  }
  return await res.json();
}

export async function updateBankAccountApi(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
  const res = await fetch(`${API_BASE_URL}/finance/bank-accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update bank account");
  }
  return await res.json();
}

export async function deleteBankAccountApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/finance/bank-accounts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete bank account");
}

export async function fetchMoneyTransfers(): Promise<MoneyTransfer[]> {
  const res = await fetch(`${API_BASE_URL}/finance/money-transfers`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch money transfers");
  return await res.json();
}

export async function createMoneyTransferApi(data: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date?: string;
  notes?: string;
}): Promise<MoneyTransfer> {
  const res = await fetch(`${API_BASE_URL}/finance/money-transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create money transfer");
  }
  return await res.json();
}

// ==================== 🎟️ PROMO: COUPONS ====================
export async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE_URL}/promo/coupons`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch coupons");
  return await res.json();
}

export async function createCouponApi(data: Partial<Coupon>): Promise<Coupon> {
  const res = await fetch(`${API_BASE_URL}/promo/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create coupon");
  }
  return await res.json();
}

export async function updateCouponApi(id: string, data: Partial<Coupon>): Promise<Coupon> {
  const res = await fetch(`${API_BASE_URL}/promo/coupons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update coupon");
  }
  return await res.json();
}

export async function deleteCouponApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/promo/coupons/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete coupon");
}

// ==================== 🏷️ PROMO: DISCOUNTS & PLANS ====================
export async function fetchDiscounts(): Promise<Discount[]> {
  const res = await fetch(`${API_BASE_URL}/promo/discounts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch discounts");
  return await res.json();
}

export async function createDiscountApi(data: Partial<Discount>): Promise<Discount> {
  const res = await fetch(`${API_BASE_URL}/promo/discounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create discount");
  }
  return await res.json();
}

export async function updateDiscountApi(id: string, data: Partial<Discount>): Promise<Discount> {
  const res = await fetch(`${API_BASE_URL}/promo/discounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update discount");
  }
  return await res.json();
}

export async function deleteDiscountApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/promo/discounts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete discount");
}

export async function fetchDiscountPlans(): Promise<DiscountPlan[]> {
  const res = await fetch(`${API_BASE_URL}/promo/discount-plans`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch discount plans");
  return await res.json();
}

export async function createDiscountPlanApi(data: Partial<DiscountPlan>): Promise<DiscountPlan> {
  const res = await fetch(`${API_BASE_URL}/promo/discount-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create discount plan");
  }
  return await res.json();
}

// ==================== 💳 PROMO: GIFT CARDS ====================
export async function fetchGiftCards(): Promise<GiftCard[]> {
  const res = await fetch(`${API_BASE_URL}/promo/gift-cards`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch gift cards");
  return await res.json();
}

export async function createGiftCardApi(data: Partial<GiftCard>): Promise<GiftCard> {
  const res = await fetch(`${API_BASE_URL}/promo/gift-cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create gift card");
  }
  return await res.json();
}

export async function updateGiftCardApi(id: string, data: Partial<GiftCard>): Promise<GiftCard> {
  const res = await fetch(`${API_BASE_URL}/promo/gift-cards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update gift card");
  }
  return await res.json();
}

export async function deleteGiftCardApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/promo/gift-cards/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete gift card");
}

// ==================== 🔐 AUTHENTICATION ====================
export async function loginApi(credentials: { email: string; password?: string }): Promise<{
  token: string;
  user: any;
}> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return await res.json();
}

export async function getMeApi(token: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch current user");
  return await res.json();
}

export async function changePasswordApi(data: {
  userId: string;
  oldPassword?: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to change password");
  }
  return await res.json();
}


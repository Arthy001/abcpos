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

export interface Warranty {
  id: string;
  name: string;
  description?: string | null;
  duration: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface VariantAttribute {
  id: string;
  name: string;
  values: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  contactPerson?: string | null;
  contactAvatar?: string | null;
  phone?: string | null;
  totalProducts?: number;
  stock?: number;
  qty?: number;
  code?: string | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Store {
  id: string;
  name: string;
  userName?: string | null;
  email?: string | null;
  phone?: string | null;
  code?: string | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  code?: string | null;
  name: string;
  image?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Biller {
  id: string;
  code?: string | null;
  name: string;
  avatar?: string | null;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Shift {
  id: string;
  name: string;
  timing: string;
  weekOff: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  headName?: string | null;
  headAvatar?: string | null;
  totalMembers?: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Designation {
  id: string;
  name: string;
  department: string;
  totalMembers?: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  empId?: string | null;
  name: string;
  avatar?: string | null;
  role?: string | null;
  department?: string | null;
  email?: string | null;
  phone?: string | null;
  joinedDate?: string | null;
  status: "ACTIVE" | "INACTIVE" | "NEW_JOINER";
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId?: string | null;
  employeeName?: string | null;
  employeeRole?: string | null;
  employeeAvatar?: string | null;
  date: string;
  status: "PRESENT" | "ABSENT" | "HOLIDAY" | "HALF_DAY" | "LATE";
  clockIn?: string | null;
  clockOut?: string | null;
  production?: string | null;
  breakTime?: string | null;
  overtime?: string | null;
  totalHours?: string | null;
  progress?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  quota: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Leave {
  id: string;
  empCode?: string | null;
  employeeName?: string | null;
  employeeRole?: string | null;
  employeeAvatar?: string | null;
  leaveType: string;
  fromDate: string;
  toDate: string;
  duration: string;
  appliedOn: string;
  shift?: string | null;
  reason?: string | null;
  status: "APPROVED" | "REJECTED" | "APPLIED";
  createdAt?: string;
  updatedAt?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Payroll {
  id: string;
  empCode: string;
  employeeName: string;
  employeeRole: string;
  employeeAvatar?: string | null;
  email: string;
  salary: number;
  basicSalary: number;
  hra?: number;
  conveyance?: number;
  medical?: number;
  bonus?: number;
  pf?: number;
  professionalTax?: number;
  tds?: number;
  loans?: number;
  payPeriod?: string;
  location?: string;
  status: "PAID" | "UNPAID";
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesReportItem {
  id: string;
  sku: string;
  productName: string;
  productImage?: string | null;
  brand: string;
  category: string;
  soldQty: number;
  soldAmount: number;
  instockQty: number;
  store?: string;
  date?: string;
}

export interface SalesReportSummary {
  totalAmount: string;
  totalPaid: string;
  totalUnpaid: string;
  overdue: string;
}

export interface PurchaseReportItem {
  id: string;
  reference: string;
  sku: string;
  dueDate: string;
  productName: string;
  productImage?: string | null;
  category: string;
  instockQty: number;
  purchaseQty: number;
  purchaseAmount: number;
  store?: string;
  date?: string;
}

export interface InventoryReportItem {
  id: string;
  sku: string;
  productName: string;
  productImage?: string | null;
  category: string;
  unit: string;
  instockQty: number;
  minStock: number;
  stockValue: number;
  store?: string;
  date?: string;
}

export interface StockHistoryItem {
  id: string;
  sku: string;
  productName: string;
  productImage?: string | null;
  initialQuantity: number;
  addedQuantity: number;
  soldQuantity: number;
  defectiveQuantity: number;
  finalQuantity: number;
  category?: string;
  store?: string;
  date?: string;
}

export interface SoldStockItem {
  id: string;
  sku: string;
  productName: string;
  productImage?: string | null;
  unit: number;
  quantity: number;
  taxValue: number;
  total: number;
  category?: string;
  store?: string;
  date?: string;
}

export interface InvoiceReportItem {
  id: string;
  invoiceNo: string;
  customer: string;
  dueDate: string;
  amount: number;
  paid: number;
  amountDue: number;
  status: "PAID" | "UNPAID";
  date?: string;
}

export interface SupplierReportItem {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  supplierImage?: string | null;
  totalItems: number;
  amount: number;
  paymentMethod: string;
  status: "RECEIVED" | "PENDING" | "ORDERED";
  date?: string;
}

export interface SupplierDueReportItem {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  supplierImage?: string | null;
  totalAmount: number;
  paid: number;
  due: number;
  status: "PAID" | "OVERDUE" | "UNPAID";
  date?: string;
}

export interface CustomerReportItem {
  id: string;
  reference: string;
  customerCode: string;
  customerName: string;
  customerImage?: string | null;
  totalOrders: number;
  amount: number;
  paymentMethod: string;
  status: string;
  date?: string;
}

export interface CustomerDueReportItem {
  id: string;
  reference: string;
  customerCode: string;
  customerName: string;
  customerImage?: string | null;
  totalAmount: number;
  paid: number;
  due: number;
  status: string;
  date?: string;
}

export interface ProductReportItem {
  id: string;
  sku: string;
  productName: string;
  productImage?: string | null;
  category: string;
  brand: string;
  qty: number;
  price: number;
  totalOrdered: number;
  revenue: number;
  store?: string;
  date?: string;
}

export interface ProductExpiryReportItem {
  id: string;
  sku: string;
  serialNo: string;
  productName: string;
  productImage?: string | null;
  manufacturedDate: string;
  expiredDate: string;
  store?: string;
  category?: string;
  brand?: string;
  date?: string;
}

export interface ProductQuantityAlertItem {
  id: string;
  sku: string;
  serialNo: string;
  productName: string;
  productImage?: string | null;
  totalQuantity: number;
  alertQuantity: number;
  store?: string;
  category?: string;
  brand?: string;
  date?: string;
}

export interface ExpenseReportItem {
  id: string;
  expenseName: string;
  category: string;
  description: string;
  expenseDate: string;
  amount: number;
  paymentMethod: string;
  status: "APPROVED" | "PENDING";
  date?: string;
}

export interface IncomeReportItem {
  id: string;
  incomeName: string;
  category: string;
  description: string;
  incomeDate: string;
  amount: number;
  paymentMethod: string;
  status: "RECEIVED" | "PENDING";
  date?: string;
}

export interface PurchaseTaxReportItem {
  id: string;
  reference: string;
  supplier: string;
  taxDate: string;
  store: string;
  amount: number;
  paymentMethod: string;
  discount: number;
  taxAmount: number;
  date?: string;
}

export interface SalesTaxReportItem {
  id: string;
  reference: string;
  customer: string;
  taxDate: string;
  store: string;
  amount: number;
  paymentMethod: string;
  discount: number;
  taxAmount: number;
  date?: string;
}

export interface ProfitLossReportItem {
  id: string;
  type: "INCOME" | "EXPENSE";
  itemKey: string;
  jan2026: number;
  feb2026: number;
  mar2026: number;
  apr2026: number;
  may2026: number;
  jun2026: number;
}

export interface AnnualReportItem {
  id: string;
  monthName: string;
  jan2026: number;
  feb2026: number;
  mar2026: number;
  apr2026: number;
  year?: number;
  store?: string;
}

export interface StockTransfer {
  id: string;
  fromWarehouse: string;
  toWarehouse: string;
  noOfProducts: number;
  quantityTransferred: number;
  refNumber: string;
  date: string;
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  notes?: string | null;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  warehouse: string;
  store: string;
  productName: string;
  productImage?: string | null;
  date: string;
  personName: string;
  personAvatar?: string | null;
  qty: number;
  type: "ADDITION" | "SUBTRACTION";
  notes?: string | null;
  createdAt: string;
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
  warehouseId?: string | null;
  warehouse?: Warehouse | null;
  storeId?: string | null;
  store?: Store | null;
  stocks?: ProductStock[];
  movements?: StockMovement[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  code?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  points: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
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

export interface SystemUser {
  id: string;
  name: string;
  phone?: string | null;
  email: string;
  role: string;
  warehouseName?: string | null;
  storeName?: string | null;
  avatar?: string | null;
  status: "ACTIVE" | "INACTIVE";
  password?: string | null;
  assignedWarehouses?: {
    id: string;
    userId: string;
    warehouseId: string;
    warehouse: Warehouse;
  }[];
  warehouseIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ModulePermission {
  module: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  import?: boolean;
  export?: boolean;
}

export interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE";
  permissions?: string | null; // JSON string or parsed array
  createdDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type Role = RoleItem;

export interface DeleteAccountRequestItem {
  id: string;
  userName: string;
  userAvatar?: string | null;
  requisitionDate: string;
  deleteRequestDate: string;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

// ==================== SETTINGS TYPES ====================
export interface UserProfileSettings {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  bio: string;
  avatar: string;
}

export interface UserSecuritySettings {
  id?: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  passwordLastChanged: string;
  loginAlerts: boolean;
}

export interface UserSessionLog {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserNotificationSettings {
  id?: string;
  emailAlerts: boolean;
  pushAlerts: boolean;
  smsAlerts: boolean;
  lowStockAlerts: boolean;
  newOrderAlerts: boolean;
  invoicesAlerts: boolean;
  paymentAlerts: boolean;
  weeklyReports: boolean;
}

export interface ConnectedAppItem {
  id: string;
  appName: string;
  appCategory: string;
  appLogo: string;
  description: string;
  status: "CONNECTED" | "DISCONNECTED";
  connectedAccount?: string | null;
  connectedDate?: string | null;
}

export interface AuditLogItem {
  id: string;
  action: "DELETE" | "UPDATE" | "CREATE" | "RESTORE" | "RESTORED";
  entityType:
    | "CATEGORY"
    | "SUBCATEGORY"
    | "BRAND"
    | "UNIT"
    | "WAREHOUSE"
    | "STORE"
    | "WARRANTY"
    | "VARIANT"
    | "PRODUCT";
  entityId: string;
  entityName: string;
  user?: string | null;
  data: string; // JSON snapshot string
  createdAt: string;
}

export interface PurchaseItem {
  id?: string;
  purchaseId?: string;
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  sku?: string | null;
  quantity: number;
  receivedQty?: number;
  unitCost: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
}

export interface Purchase {
  id: string;
  reference: string;
  supplierId?: string | null;
  supplierName: string;
  supplierImage?: string | null;
  warehouseName?: string | null;
  storeName?: string | null;
  date: string;
  status: "RECEIVED" | "PENDING" | "ORDERED" | "CANCELLED";
  paymentStatus: "PAID" | "UNPAID" | "OVERDUE" | "PARTIAL";
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  total: number;
  paid: number;
  due: number;
  notes?: string | null;
  items?: PurchaseItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id: string;
  product: string;
  productImage: string;
  purchasedAmount: string;
  purchasedQty: number;
  instockQty: number;
  sku: string;
  supplier: string;
  date: string;
  status: string;
}

export interface PurchaseReturn {
  id: string;
  reference: string;
  purchaseReference?: string | null;
  supplierName: string;
  supplierImage?: string | null;
  warehouseName?: string | null;
  productName?: string | null;
  productImage?: string | null;
  quantity: number;
  date: string;
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "PAID" | "UNPAID" | "OVERDUE";
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleItem {
  id?: string;
  saleId?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id: string;
  reference: string;
  customerId?: string | null;
  customerName: string;
  customerAvatar?: string | null;
  billerName?: string | null;
  storeName?: string | null;
  warehouseName?: string | null;
  date: string;
  status: "COMPLETED" | "PENDING" | "ORDERED" | "CANCELLED";
  paymentStatus: "PAID" | "UNPAID" | "OVERDUE" | "PARTIAL";
  paymentMethod: "CASH" | "CREDIT_CARD" | "PROMPTPAY" | "BANK_TRANSFER";
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  paid: number;
  due: number;
  notes?: string | null;
  items?: SaleItem[];
  invoices?: Invoice[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  saleId?: string | null;
  sale?: Sale | null;
  saleReference?: string | null;
  customerId?: string | null;
  customerName: string;
  customerAvatar?: string | null;
  issueDate: string;
  dueDate: string;
  amount: number;
  paid: number;
  amountDue: number;
  status: "PAID" | "UNPAID" | "OVERDUE" | "PARTIAL";
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesReturn {
  id: string;
  reference: string;
  saleReference?: string | null;
  customerId?: string | null;
  customerName: string;
  customerAvatar?: string | null;
  warehouseName?: string | null;
  productId?: string | null;
  productName?: string | null;
  productImage?: string | null;
  quantity: number;
  date: string;
  status: "RECEIVED" | "PENDING" | "CANCELLED";
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "PAID" | "UNPAID" | "OVERDUE";
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quotation {
  id: string;
  reference: string;
  customerId?: string | null;
  customerName: string;
  customerAvatar?: string | null;
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  total: number;
  status: "SENT" | "ORDERED" | "PENDING";
  validUntil?: string | null;
  notes?: string | null;
  convertedSaleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductStock {
  id: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reservedQuantity?: number;
  minAlert?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  type:
    | "INITIAL_STOCK"
    | "PURCHASE_RECEIPT"
    | "CUSTOMER_RETURN"
    | "TRANSFER_IN"
    | "ADJUSTMENT_PLUS"
    | "SALE_ISSUE"
    | "TRANSFER_OUT"
    | "INTERNAL_ISSUE"
    | "DAMAGE_ISSUE"
    | "SUPPLIER_RETURN"
    | "ADJUSTMENT_MINUS";
  referenceNo?: string | null;
  quantity: number;
  balanceAfter: number;
  unitCost?: number | null;
  department?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt?: string;
}




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
  avatar?: string | null;
  status: "ACTIVE" | "INACTIVE";
  password?: string | null;
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

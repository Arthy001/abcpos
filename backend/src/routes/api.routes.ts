import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getDeleteAccountRequests,
  createDeleteAccountRequest,
  deleteAccountRequestAction,
} from "../controllers/user.controller.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/category.controller.js";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../controllers/unit.controller.js";
import {
  getWarranties,
  createWarranty,
  updateWarranty,
  deleteWarranty,
} from "../controllers/warranty.controller.js";
import {
  getVariantAttributes,
  createVariantAttribute,
  updateVariantAttribute,
  deleteVariantAttribute,
} from "../controllers/variant.controller.js";
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../controllers/warehouse.controller.js";
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} from "../controllers/store.controller.js";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller.js";
import {
  getBillers,
  getBillerById,
  createBiller,
  updateBiller,
  deleteBiller,
} from "../controllers/biller.controller.js";
import {
  getStockTransfers,
  createStockTransfer,
  deleteStockTransfer,
  getStockAdjustments,
  createStockAdjustment,
  deleteStockAdjustment,
} from "../controllers/stock.controller.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from "../controllers/product.controller.js";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../controllers/shift.controller.js";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "../controllers/designation.controller.js";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller.js";
import {
  getAttendanceRecords,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} from "../controllers/attendance.controller.js";
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  getLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
} from "../controllers/leave.controller.js";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holiday.controller.js";
import {
  getPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from "../controllers/payroll.controller.js";
import {
  getSalesReport,
  getBestsellerReport,
  getPurchaseReport,
  getInventoryReport,
  getStockHistoryReport,
  getSoldStockReport,
  getInvoiceReport,
  getSupplierReport,
  getSupplierDueReport,
  getCustomerReport,
  getCustomerDueReport,
  getProductReport,
  getProductExpiryReport,
  getProductQuantityAlertReport,
  getExpenseReport,
  getIncomeReport,
  getPurchaseTaxReport,
  getSalesTaxReport,
  getProfitLossReport,
  getAnnualReport,
} from "../controllers/report.controller.js";
import {
  getProfileSettings,
  updateProfileSettings,
  getSecuritySettings,
  updateSecuritySettings,
  terminateSessionLog,
  getNotificationSettings,
  updateNotificationSettings,
  getConnectedApps,
  toggleConnectedApp,
} from "../controllers/settings.controller.js";
import { getOrders, createOrder } from "../controllers/order.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();

// Health Check
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "A POS Backend API is running smoothly." });
});

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Customers
router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomerById);
router.post("/customers", createCustomer);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

// Categories
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Sub Categories
router.get("/sub-categories", getSubCategories);
router.post("/sub-categories", createSubCategory);
router.put("/sub-categories/:id", updateSubCategory);
router.delete("/sub-categories/:id", deleteSubCategory);

// Brands
router.get("/brands", getBrands);
router.post("/brands", createBrand);
router.put("/brands/:id", updateBrand);
router.delete("/brands/:id", deleteBrand);

// Units
router.get("/units", getUnits);
router.post("/units", createUnit);
router.put("/units/:id", updateUnit);
router.delete("/units/:id", deleteUnit);

// Warranties
router.get("/warranties", getWarranties);
router.post("/warranties", createWarranty);
router.put("/warranties/:id", updateWarranty);
router.delete("/warranties/:id", deleteWarranty);

// Variant Attributes
router.get("/variant-attributes", getVariantAttributes);
router.post("/variant-attributes", createVariantAttribute);
router.put("/variant-attributes/:id", updateVariantAttribute);
router.delete("/variant-attributes/:id", deleteVariantAttribute);

// Warehouses
router.get("/warehouses", getWarehouses);
router.get("/warehouses/:id", getWarehouseById);
router.post("/warehouses", createWarehouse);
router.put("/warehouses/:id", updateWarehouse);
router.delete("/warehouses/:id", deleteWarehouse);

// Stores
router.get("/stores", getStores);
router.get("/stores/:id", getStoreById);
router.post("/stores", createStore);
router.put("/stores/:id", updateStore);
router.delete("/stores/:id", deleteStore);

// Suppliers
router.get("/suppliers", getSuppliers);
router.get("/suppliers/:id", getSupplierById);
router.post("/suppliers", createSupplier);
router.put("/suppliers/:id", updateSupplier);
router.delete("/suppliers/:id", deleteSupplier);

// Billers
router.get("/billers", getBillers);
router.get("/billers/:id", getBillerById);
router.post("/billers", createBiller);
router.put("/billers/:id", updateBiller);
router.delete("/billers/:id", deleteBiller);

// Stock Transfers
router.get("/stock-transfers", getStockTransfers);
router.post("/stock-transfers", createStockTransfer);
router.delete("/stock-transfers/:id", deleteStockTransfer);

// Stock Adjustments
router.get("/stock-adjustments", getStockAdjustments);
router.post("/stock-adjustments", createStockAdjustment);
router.delete("/stock-adjustments/:id", deleteStockAdjustment);

// Products
router.get("/products", getProducts);
router.post("/products/bulk-delete", bulkDeleteProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders / POS
router.get("/orders", getOrders);
router.post("/orders", createOrder);

// HRM: Shifts
router.get("/shifts", getShifts);
router.post("/shifts", createShift);
router.put("/shifts/:id", updateShift);
router.delete("/shifts/:id", deleteShift);

// HRM: Departments
router.get("/departments", getDepartments);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// HRM: Designations
router.get("/designations", getDesignations);
router.post("/designations", createDesignation);
router.put("/designations/:id", updateDesignation);
router.delete("/designations/:id", deleteDesignation);

// HRM: Employees
router.get("/employees", getEmployees);
router.post("/employees", createEmployee);
router.put("/employees/:id", updateEmployee);
router.delete("/employees/:id", deleteEmployee);

// HRM: Attendance
router.get("/attendance", getAttendanceRecords);
router.post("/attendance", createAttendanceRecord);
router.put("/attendance/:id", updateAttendanceRecord);
router.delete("/attendance/:id", deleteAttendanceRecord);

// HRM: Leave Types
router.get("/leave-types", getLeaveTypes);
router.post("/leave-types", createLeaveType);
router.put("/leave-types/:id", updateLeaveType);
router.delete("/leave-types/:id", deleteLeaveType);

// HRM: Leaves
router.get("/leaves", getLeaves);
router.post("/leaves", createLeave);
router.put("/leaves/:id", updateLeave);
router.delete("/leaves/:id", deleteLeave);

// HRM: Holidays
router.get("/holidays", getHolidays);
router.post("/holidays", createHoliday);
router.put("/holidays/:id", updateHoliday);
router.delete("/holidays/:id", deleteHoliday);

// HRM: Payroll & Payslip
router.get("/payroll", getPayrolls);
router.get("/payroll/:id", getPayrollById);
router.post("/payroll", createPayroll);
router.put("/payroll/:id", updatePayroll);
router.delete("/payroll/:id", deletePayroll);

// Reports: Sales, Bestsellers, Purchases, Inventory, Invoices, Suppliers, Customers, Products & Expenses
router.get("/reports/sales", getSalesReport);
router.get("/reports/bestsellers", getBestsellerReport);
router.get("/reports/purchases", getPurchaseReport);
router.get("/reports/inventory", getInventoryReport);
router.get("/reports/stock-history", getStockHistoryReport);
router.get("/reports/sold-stock", getSoldStockReport);
router.get("/reports/invoices", getInvoiceReport);
router.get("/reports/suppliers", getSupplierReport);
router.get("/reports/suppliers/due", getSupplierDueReport);
router.get("/reports/customers", getCustomerReport);
router.get("/reports/customers/due", getCustomerDueReport);
router.get("/reports/products", getProductReport);
router.get("/reports/products/expiry", getProductExpiryReport);
router.get("/reports/products/quantity-alert", getProductQuantityAlertReport);
router.get("/reports/expenses", getExpenseReport);
router.get("/reports/income", getIncomeReport);
router.get("/reports/tax/purchase", getPurchaseTaxReport);
router.get("/reports/tax/sales", getSalesTaxReport);
router.get("/reports/profit-loss", getProfitLossReport);
router.get("/reports/annual", getAnnualReport);

// User Management: Users
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// User Management: Roles & Permissions
router.get("/roles", getRoles);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

// User Management: Delete Account Requests
router.get("/delete-account-requests", getDeleteAccountRequests);
router.post("/delete-account-requests", createDeleteAccountRequest);
router.delete("/delete-account-requests/:id", deleteAccountRequestAction);

// General Settings
router.get("/settings/profile", getProfileSettings);
router.put("/settings/profile", updateProfileSettings);
router.get("/settings/security", getSecuritySettings);
router.put("/settings/security", updateSecuritySettings);
router.delete("/settings/security/sessions/:id", terminateSessionLog);
router.get("/settings/notifications", getNotificationSettings);
router.put("/settings/notifications", updateNotificationSettings);
router.get("/settings/connected-apps", getConnectedApps);
router.put("/settings/connected-apps/:id", toggleConnectedApp);

export default router;

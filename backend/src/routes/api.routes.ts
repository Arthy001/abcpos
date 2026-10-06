import { Router } from "express";
import {
  login,
  getMe,
  changePassword,
} from "../controllers/auth.controller.js";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  createExpenseCategory,
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeCategories,
  createIncomeCategory,
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getMoneyTransfers,
  createMoneyTransfer,
  getBalanceSheetData,
  getTrialBalanceData,
} from "../controllers/finance.controller.js";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscountPlans,
  createDiscountPlan,
  getGiftCards,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  verifyGiftCard,
} from "../controllers/promo.controller.js";
import {
  getAuditLogs,
  restoreFromAuditLog,
  deleteAuditLog,
} from "../controllers/audit.controller.js";
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
  getStockTransferById,
  createStockTransfer,
  updateStockTransfer,
  deleteStockTransfer,
  getStockAdjustments,
  getStockAdjustmentById,
  createStockAdjustment,
  updateStockAdjustment,
  deleteStockAdjustment,
  getStockMovements,
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
  getCompanySettings,
  updateCompanySettings,
  getPrefixSettings,
  updatePrefixSettings,
  getPosSettings,
  updatePosSettings,
  getTaxRates,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
  getPaymentGateways,
  updatePaymentGateway,
  togglePaymentGateway,
  getCurrencies,
  createCurrency,
  updateCurrency,
  setDefaultCurrency,
  deleteCurrency,
  getInvoiceSettings,
  updateInvoiceSettings,
} from "../controllers/settings.controller.js";
import { getOrders, createOrder, getOrderById, voidOrder } from "../controllers/order.controller.js";
import {
  getCurrentShift,
  openShift,
  recordShiftMovement,
  closeShift,
  getShiftsHistory,
  getShiftById,
} from "../controllers/pos-shift.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseOrders,
  getPurchaseReturns,
  getPurchaseReturnById,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
} from "../controllers/purchase.controller.js";
import {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getInvoices,
  updateInvoicePayment,
  getSalesReturns,
  createSalesReturn,
  updateSalesReturn,
  deleteSalesReturn,
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  convertQuotationToSale,
} from "../controllers/sale.controller.js";

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
router.get("/stock-transfers/:id", getStockTransferById);
router.post("/stock-transfers", createStockTransfer);
router.put("/stock-transfers/:id", updateStockTransfer);
router.delete("/stock-transfers/:id", deleteStockTransfer);

// Stock Adjustments
router.get("/stock-adjustments", getStockAdjustments);
router.get("/stock-adjustments/:id", getStockAdjustmentById);
router.post("/stock-adjustments", createStockAdjustment);
router.put("/stock-adjustments/:id", updateStockAdjustment);
router.delete("/stock-adjustments/:id", deleteStockAdjustment);

// Stock Movements (Stock Card / Audit Trail)
router.get("/stock-movements", getStockMovements);

// Purchases
router.get("/purchases", getPurchases);
router.get("/purchases/:id", getPurchaseById);
router.post("/purchases", createPurchase);
router.put("/purchases/:id", updatePurchase);
router.delete("/purchases/:id", deletePurchase);

// Purchase Orders (Item Breakdown)
router.get("/purchase-orders", getPurchaseOrders);

// Purchase Returns
router.get("/purchase-returns", getPurchaseReturns);
router.get("/purchase-returns/:id", getPurchaseReturnById);
router.post("/purchase-returns", createPurchaseReturn);
router.put("/purchase-returns/:id", updatePurchaseReturn);
router.delete("/purchase-returns/:id", deletePurchaseReturn);

// Sales
router.get("/sales", getSales);
router.get("/sales/:id", getSaleById);
router.post("/sales", createSale);
router.put("/sales/:id", updateSale);
router.delete("/sales/:id", deleteSale);

// Invoices
router.get("/invoices", getInvoices);
router.put("/invoices/:id/pay", updateInvoicePayment);

// Sales Returns
router.get("/sales-returns", getSalesReturns);
router.post("/sales-returns", createSalesReturn);
router.put("/sales-returns/:id", updateSalesReturn);
router.delete("/sales-returns/:id", deleteSalesReturn);

// Quotations
router.get("/quotations", getQuotations);
router.post("/quotations", createQuotation);
router.put("/quotations/:id", updateQuotation);
router.delete("/quotations/:id", deleteQuotation);
router.post("/quotations/:id/convert", convertQuotationToSale);

// Products
router.get("/products", getProducts);
router.post("/products/bulk-delete", bulkDeleteProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders / POS
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders", createOrder);
router.put("/orders/:id/void", voidOrder);

// POS Shifts & Cash Drawer
router.get("/pos-shifts/current", getCurrentShift);
router.post("/pos-shifts/open", openShift);
router.post("/pos-shifts/movement", recordShiftMovement);
router.post("/pos-shifts/close", closeShift);
router.get("/pos-shifts", getShiftsHistory);
router.get("/pos-shifts/history", getShiftsHistory);
router.get("/pos-shifts/:id", getShiftById);

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
router.get("/settings/company", getCompanySettings);
router.put("/settings/company", updateCompanySettings);
router.get("/settings/prefixes", getPrefixSettings);
router.put("/settings/prefixes", updatePrefixSettings);
router.get("/settings/pos", getPosSettings);
router.put("/settings/pos", updatePosSettings);
router.get("/settings/tax-rates", getTaxRates);
router.post("/settings/tax-rates", createTaxRate);
router.put("/settings/tax-rates/:id", updateTaxRate);
router.delete("/settings/tax-rates/:id", deleteTaxRate);
router.get("/settings/payment-gateways", getPaymentGateways);
router.put("/settings/payment-gateways/:id", updatePaymentGateway);
router.patch("/settings/payment-gateways/:id/toggle", togglePaymentGateway);
router.get("/settings/currencies", getCurrencies);
router.post("/settings/currencies", createCurrency);
router.put("/settings/currencies/:id", updateCurrency);
router.patch("/settings/currencies/:id/set-default", setDefaultCurrency);
router.delete("/settings/currencies/:id", deleteCurrency);
router.get("/settings/invoice-settings", getInvoiceSettings);
router.put("/settings/invoice-settings", updateInvoiceSettings);

// Audit Logs & Activity History
router.get("/audit-logs", getAuditLogs);
router.post("/audit-logs/:id/restore", restoreFromAuditLog);
router.delete("/audit-logs/:id", deleteAuditLog);

// ==========================================
// 💰 FINANCE ENDPOINTS
// ==========================================
router.get("/finance/expenses", getExpenses);
router.post("/finance/expenses", createExpense);
router.put("/finance/expenses/:id", updateExpense);
router.delete("/finance/expenses/:id", deleteExpense);

router.get("/finance/expense-categories", getExpenseCategories);
router.post("/finance/expense-categories", createExpenseCategory);

router.get("/finance/income", getIncomes);
router.post("/finance/income", createIncome);
router.put("/finance/income/:id", updateIncome);
router.delete("/finance/income/:id", deleteIncome);

router.get("/finance/income-categories", getIncomeCategories);
router.post("/finance/income-categories", createIncomeCategory);

router.get("/finance/bank-accounts", getBankAccounts);
router.post("/finance/bank-accounts", createBankAccount);
router.put("/finance/bank-accounts/:id", updateBankAccount);
router.delete("/finance/bank-accounts/:id", deleteBankAccount);

router.get("/finance/money-transfers", getMoneyTransfers);
router.post("/finance/money-transfers", createMoneyTransfer);
router.get("/finance/balance-sheet", getBalanceSheetData);
router.get("/finance/trial-balance", getTrialBalanceData);

// ==========================================
// 🎁 PROMO & DISCOUNT ENDPOINTS
// ==========================================
router.get("/promo/coupons", getCoupons);
router.post("/promo/coupons", createCoupon);
router.put("/promo/coupons/:id", updateCoupon);
router.delete("/promo/coupons/:id", deleteCoupon);

router.get("/promo/discounts", getDiscounts);
router.post("/promo/discounts", createDiscount);
router.put("/promo/discounts/:id", updateDiscount);
router.delete("/promo/discounts/:id", deleteDiscount);

router.get("/promo/discount-plans", getDiscountPlans);
router.post("/promo/discount-plans", createDiscountPlan);

router.get("/promo/gift-cards", getGiftCards);
router.get("/promo/gift-cards/verify/:code", verifyGiftCard);
router.post("/promo/gift-cards", createGiftCard);
router.put("/promo/gift-cards/:id", updateGiftCard);
router.delete("/promo/gift-cards/:id", deleteGiftCard);

// ==========================================
// 🔐 AUTHENTICATION ENDPOINTS
// ==========================================
router.post("/auth/login", login);
router.get("/auth/me", getMe);
router.post("/auth/change-password", changePassword);

export default router;

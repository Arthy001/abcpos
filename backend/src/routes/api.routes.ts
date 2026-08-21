import { Router } from "express";
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
} from "../controllers/product.controller.js";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";
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
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders / POS
router.get("/orders", getOrders);
router.post("/orders", createOrder);

export default router;

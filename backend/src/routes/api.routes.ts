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
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { getOrders, createOrder } from "../controllers/order.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();

// Health Check
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "ABC POS Backend API is running smoothly." });
});

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

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

"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Product, Category, Brand, Warehouse, Store } from "@/types";
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchWarehouses,
  fetchStores,
  deleteProductApi,
  bulkDeleteProductsApi,
  updateProductApi,
} from "@/lib/api";
import {
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronDown,
  Mail,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  AlertTriangle,
  Package,
  CheckCircle,
  X,
  TrendingDown,
  ShieldAlert,
  SlidersHorizontal,
  ArrowUpRight,
  Layers,
} from "lucide-react";

export default function LowStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<"low" | "out" | "all">("low");
  const [isNotify, setIsNotify] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lowest");

  // Selection & Pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modals
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  const [editMinAlertProduct, setEditMinAlertProduct] = useState<Product | null>(null);
  const [newMinAlert, setNewMinAlert] = useState<number>(5);

  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper for primary image
  const getPrimaryImage = (img?: string | null): string => {
    if (!img) return "/assets/images/product-01.jpg";
    if (img.startsWith("[")) {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {}
    }
    return img;
  };

  const showAlert = (type: "success" | "error", text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats, brds, whs, strs] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands(),
        fetchWarehouses(),
        fetchStores(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brds);
      setWarehouses(whs);
      setStores(strs);
    } catch (err: any) {
      console.error(err);
      showAlert("error", err.message || "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyCount = 0;
    let reorderCostEst = 0;

    products.forEach((p) => {
      const minAlert = p.minStockAlert || 5;
      if (p.stock <= 0) {
        outOfStockCount++;
        reorderCostEst += minAlert * 2 * (p.costPrice || p.price || 0);
      } else if (p.stock <= minAlert) {
        lowStockCount++;
        const deficit = Math.max(0, minAlert * 2 - p.stock);
        reorderCostEst += deficit * (p.costPrice || p.price || 0);
      } else {
        healthyCount++;
      }
    });

    return {
      lowStockCount,
      outOfStockCount,
      healthyCount,
      reorderCostEst,
      totalAlerts: lowStockCount + outOfStockCount,
    };
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const minAlert = item.minStockAlert || 5;
        const isOutOfStock = item.stock <= 0;
        const isLowStock = item.stock <= minAlert && item.stock > 0;

        // Tab Filter
        let matchesTab = true;
        if (activeTab === "low") {
          matchesTab = isLowStock;
        } else if (activeTab === "out") {
          matchesTab = isOutOfStock;
        } else if (activeTab === "all") {
          matchesTab = isLowStock || isOutOfStock;
        }

        // Search Filter
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          (item.barcode && item.barcode.toLowerCase().includes(query));

        // Category Filter
        const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;

        // Brand Filter
        const matchesBrand = selectedBrand === "all" || item.brandId === selectedBrand;

        // Warehouse Filter
        const matchesWarehouse = selectedWarehouse === "all" || item.warehouseId === selectedWarehouse;

        // Store Filter
        const matchesStore = selectedStore === "all" || item.storeId === selectedStore;

        return matchesTab && matchesSearch && matchesCategory && matchesBrand && matchesWarehouse && matchesStore;
      })
      .sort((a, b) => {
        if (sortBy === "lowest") {
          return a.stock - b.stock;
        } else if (sortBy === "deficit") {
          const deficitA = Math.max(0, (a.minStockAlert || 5) - a.stock);
          const deficitB = Math.max(0, (b.minStockAlert || 5) - b.stock);
          return deficitB - deficitA;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
  }, [
    products,
    activeTab,
    search,
    selectedCategory,
    selectedBrand,
    selectedWarehouse,
    selectedStore,
    sortBy,
  ]);

  // Pagination
  const totalEntries = filteredProducts.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, currentPage, rowsPerPage]);

  // Selection Handlers
  const toggleSelectAll = () => {
    if (paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id))) {
      setSelectedIds(selectedIds.filter((id) => !paginatedProducts.some((p) => p.id === id)));
    } else {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Quick Restock Handler
  const handleOpenRestock = (prod: Product) => {
    setRestockProduct(prod);
    const suggested = Math.max(10, ((prod.minStockAlert || 5) * 2) - prod.stock);
    setRestockQty(suggested);
  };

  const handleSaveRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;

    try {
      setActionLoading(true);
      const newStock = Number(restockProduct.stock) + Number(restockQty);
      await updateProductApi(restockProduct.id, {
        stock: newStock,
        status: newStock > 0 ? "ACTIVE" : "OUT_OF_STOCK",
      });

      showAlert("success", `Restocked +${restockQty} units for "${restockProduct.name}" (New Stock: ${newStock})`);
      setRestockProduct(null);
      await loadData();
    } catch (err: any) {
      showAlert("error", err.message || "Failed to restock product");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Min Stock Alert Update
  const handleOpenMinAlert = (prod: Product) => {
    setEditMinAlertProduct(prod);
    setNewMinAlert(prod.minStockAlert || 5);
  };

  const handleSaveMinAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMinAlertProduct) return;

    try {
      setActionLoading(true);
      await updateProductApi(editMinAlertProduct.id, {
        minStockAlert: Number(newMinAlert),
      });

      showAlert("success", `Updated Min Alert to ${newMinAlert} for "${editMinAlertProduct.name}"`);
      setEditMinAlertProduct(null);
      await loadData();
    } catch (err: any) {
      showAlert("error", err.message || "Failed to update alert threshold");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Single Product
  const handleConfirmDelete = async () => {
    if (!deleteProductTarget) return;
    try {
      setActionLoading(true);
      await deleteProductApi(deleteProductTarget.id);
      showAlert("success", `Removed "${deleteProductTarget.name}" from inventory`);
      setDeleteProductTarget(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteProductTarget.id));
      await loadData();
    } catch (err: any) {
      showAlert("error", err.message || "Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      const res = await bulkDeleteProductsApi(selectedIds);
      showAlert("success", `Deleted ${res.count || selectedIds.length} items`);
      setIsBulkDeleting(false);
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      showAlert("error", err.message || "Failed to delete selected items");
    } finally {
      setActionLoading(false);
    }
  };

  // Send Email Alert Simulation
  const handleSendEmailAlerts = () => {
    showAlert("success", `Sent low stock alert digest to manager email (${metrics.totalAlerts} items)`);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      showAlert("error", "No products to export");
      return;
    }

    const headers = [
      "Warehouse",
      "Store",
      "Product Name",
      "Category",
      "SKU",
      "Current Stock",
      "Min Stock Alert",
      "Deficit To Reorder",
      "Unit",
      "Selling Price",
      "Cost Price",
      "Status",
    ];

    const rows = filteredProducts.map((p) => {
      const minAlert = p.minStockAlert || 5;
      const deficit = Math.max(0, minAlert * 2 - p.stock);
      const statusText = p.stock <= 0 ? "Out of Stock" : "Low Stock";

      return [
        `"${p.warehouse?.name || "-"}"`,
        `"${p.store?.name || "-"}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category?.name || "-"}"`,
        `"${p.sku}"`,
        p.stock,
        minAlert,
        deficit,
        `"${p.unit?.shortName || "Pc"}"`,
        p.price,
        p.costPrice || 0,
        `"${statusText}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `low_stock_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-5 w-full font-sans">
        {/* Toast Alert */}
        {alertMessage && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
              alertMessage.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {alertMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{alertMessage.text}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">Low Stocks & Inventory Alerts</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Monitor shortage levels, reorder alerts, and replenish inventory
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export */}
            <button
              title="Export PDF / Print"
              onClick={handleExportPDF}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export */}
            <button
              title="Export CSV"
              onClick={handleExportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>

            {/* Send Email Notification Button */}
            <button
              onClick={handleSendEmailAlerts}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email Alerts</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Low Stocks Card */}
          <div
            onClick={() => setActiveTab("low")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-md ${
              activeTab === "low" ? "border-amber-500 ring-2 ring-amber-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Low Stock Level</p>
                <h3 className="text-2xl font-black text-amber-600">{metrics.lowStockCount} Items</h3>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
                  Below Min Alert Threshold
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 2. Out of Stock Card */}
          <div
            onClick={() => setActiveTab("out")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-md ${
              activeTab === "out" ? "border-rose-500 ring-2 ring-rose-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Out of Stock (0 Qty)</p>
                <h3 className="text-2xl font-black text-rose-600">{metrics.outOfStockCount} Items</h3>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Immediate Replenish Required
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 3. Reorder Value Card */}
          <div
            onClick={() => setActiveTab("all")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-md ${
              activeTab === "all" ? "border-[#FE9F43] ring-2 ring-orange-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Reorder Budget</p>
                <h3 className="text-2xl font-black text-gray-900">฿{metrics.reorderCostEst.toLocaleString()}</h3>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  Estimated Cost to Normal Stock
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-[#FE9F43] flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons & Notify Toggle Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveTab("low");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "low"
                  ? "bg-[#FE9F43] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Low Stocks ({metrics.lowStockCount})
            </button>
            <button
              onClick={() => {
                setActiveTab("out");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "out"
                  ? "bg-[#FE9F43] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Out of Stocks ({metrics.outOfStockCount})
            </button>
            <button
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-[#FE9F43] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All Alerts ({metrics.totalAlerts})
            </button>
          </div>

          <div className="flex items-center space-x-2.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-semibold text-gray-700">Auto Notify</span>
            <button
              type="button"
              onClick={() => setIsNotify(!isNotify)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                isNotify ? "bg-[#28C76F]" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isNotify ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Low Stocks Table Card Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-72">
              <input
                type="text"
                placeholder="Search SKU, Product, Barcode..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white text-gray-900 placeholder-gray-400"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-7 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Brand Filter */}
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-7 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Warehouse Filter */}
              <div className="relative">
                <select
                  value={selectedWarehouse}
                  onChange={(e) => {
                    setSelectedWarehouse(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-7 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Store Filter */}
              <div className="relative">
                <select
                  value={selectedStore}
                  onChange={(e) => {
                    setSelectedStore(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-7 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">All Stores</option>
                  {stores.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-7 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="lowest">Sort : Lowest Stock</option>
                  <option value="deficit">Sort : Highest Deficit</option>
                  <option value="name">Sort : Name (A-Z)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Bulk Delete Button */}
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setIsBulkDeleting(true)}
                  className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Clean Table with White Thead */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 text-gray-900 bg-gray-50/70">
                <tr>
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProducts.length > 0 &&
                        paginatedProducts.every((p) => selectedIds.includes(p.id))
                      }
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-gray-300"
                    />
                  </th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Warehouse</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Store</th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">Product Name</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Category</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">SKU</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Current Qty</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Min Alert Qty</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FE9F43]" />
                      Loading inventory stock data...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No matching low stock or out-of-stock items found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const minAlert = item.minStockAlert || 5;
                    const isOutOfStock = item.stock <= 0;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/70 transition-colors ${
                          isSelected
                            ? "bg-orange-50/40"
                            : isOutOfStock
                            ? "bg-rose-50/30"
                            : "bg-amber-50/15"
                        }`}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-gray-300"
                          />
                        </td>

                        {/* 1. Warehouse */}
                        <td className="py-3.5 px-3 font-medium text-gray-800">{item.warehouse?.name || "Central Warehouse"}</td>

                        {/* 2. Store */}
                        <td className="py-3.5 px-3 font-medium text-gray-800">{item.store?.name || "Main Store"}</td>

                        {/* Product with Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getPrimaryImage(item.image)}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-contain bg-white border border-gray-200 p-0.5 flex-shrink-0 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                              }}
                            />
                            <div>
                              <span className="font-semibold text-gray-900 line-clamp-1">{item.name}</span>
                              {item.barcode && (
                                <span className="text-[10px] text-gray-400 font-mono">Barcode: {item.barcode}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 text-gray-600">{item.category?.name || "-"}</td>

                        {/* SKU */}
                        <td className="py-3.5 px-3 text-gray-500 font-mono font-medium">{item.sku}</td>

                        {/* Current Stock */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                              isOutOfStock
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.stock} {item.unit?.shortName || "Pc"}
                          </span>
                        </td>

                        {/* Min Alert Qty */}
                        <td className="py-3.5 px-3 font-semibold text-gray-700">
                          {minAlert} {item.unit?.shortName || "Pc"}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Low Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Quick Restock (+ Stock) */}
                            <button
                              onClick={() => handleOpenRestock(item)}
                              title="Quick Restock / เติมสต็อก"
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center space-x-1 font-bold text-[11px] transition-colors shadow-2xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Restock</span>
                            </button>

                            {/* View Modal */}
                            <button
                              onClick={() => setViewProduct(item)}
                              title="View Details"
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors bg-white shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Min Stock Alert */}
                            <button
                              onClick={() => handleOpenMinAlert(item)}
                              title="Adjust Min Alert Limit"
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-amber-50 text-gray-500 hover:text-amber-600 flex items-center justify-center transition-colors bg-white shadow-2xs"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {/* Full Product Edit Link */}
                            <Link
                              href={`/products/edit/${item.id}`}
                              title="Edit Full Product"
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-orange-50 text-gray-500 hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white shadow-2xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Delete Product */}
                            <button
                              onClick={() => setDeleteProductTarget(item)}
                              title="Delete Product"
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-rose-50 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors bg-white shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-gray-500 gap-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span>Showing</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-2.5 pr-6 py-1 text-xs text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>of {totalEntries} entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 disabled:opacity-40"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shadow-xs ${
                      currentPage === pageNum
                        ? "bg-[#FE9F43] text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400 disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* ==================== QUICK RESTOCK MODAL ==================== */}
        {restockProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Quick Restock / เติมสต็อก</h3>
                    <p className="text-[11px] text-gray-500 truncate max-w-[220px]">{restockProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRestockProduct(null)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Current Stock:</span>
                  <span className="font-bold text-gray-900">{restockProduct.stock} {restockProduct.unit?.shortName || "Pc"}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Min Alert Threshold:</span>
                  <span className="font-bold text-amber-600">{restockProduct.minStockAlert || 5} {restockProduct.unit?.shortName || "Pc"}</span>
                </div>
              </div>

              <form onSubmit={handleSaveRestock} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Quantity to Add (+ Stock)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-gray-500">
                    New total stock will be: <strong className="text-gray-900">{Number(restockProduct.stock) + Number(restockQty)}</strong> {restockProduct.unit?.shortName || "Pc"}
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setRestockProduct(null)}
                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || restockQty <= 0}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center space-x-1"
                  >
                    {actionLoading && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Restock</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== ADJUST MIN ALERT MODAL ==================== */}
        {editMinAlertProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Adjust Min Stock Alert</h3>
                    <p className="text-[11px] text-gray-500 truncate max-w-[220px]">{editMinAlertProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditMinAlertProduct(null)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMinAlert} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Minimum Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMinAlert}
                    onChange={(e) => setNewMinAlert(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-amber-600 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                  />
                  <p className="text-[11px] text-gray-500">
                    System will flag this item when stock reaches or drops below this number.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditMinAlertProduct(null)}
                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || newMinAlert < 1}
                    className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center space-x-1"
                  >
                    {actionLoading && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Alert Threshold</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== VIEW PRODUCT MODAL ==================== */}
        {viewProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-orange-100 text-[#FE9F43] rounded-xl">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Product Stock Overview</h3>
                    <p className="text-xs text-gray-500 font-mono">SKU: {viewProduct.sku}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewProduct(null)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center space-x-4">
                  <img
                    src={getPrimaryImage(viewProduct.image)}
                    alt={viewProduct.name}
                    className="w-20 h-20 rounded-xl object-contain bg-gray-50 border border-gray-200 p-2 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border font-bold ${
                        viewProduct.stock <= 0
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {viewProduct.stock <= 0 ? "Out of Stock" : "Low Stock Level"}
                    </span>
                    <h2 className="text-base font-bold text-gray-900">{viewProduct.name}</h2>
                    <p className="text-xs text-gray-500">
                      Category: {viewProduct.category?.name || "General"} | Brand: {viewProduct.brand?.name || "Standard"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Current Stock</p>
                    <p className={`text-base font-bold ${viewProduct.stock <= 0 ? "text-rose-600" : "text-amber-600"}`}>
                      {viewProduct.stock} {viewProduct.unit?.shortName || "Pc"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Min Alert Limit</p>
                    <p className="text-base font-bold text-gray-900">
                      {viewProduct.minStockAlert || 5} {viewProduct.unit?.shortName || "Pc"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Selling Price</p>
                    <p className="text-base font-bold text-orange-600">
                      ฿{viewProduct.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warehouse:</span>
                    <span className="font-semibold text-gray-800">
                      {viewProduct.warehouse?.name || "Central Warehouse"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Store / Branch:</span>
                    <span className="font-semibold text-gray-800">
                      {viewProduct.store?.name || "Main Store"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Barcode:</span>
                    <span className="font-mono font-semibold text-gray-800">
                      {viewProduct.barcode || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estimated Reorder Need:</span>
                    <span className="font-bold text-emerald-600">
                      +{Math.max(0, ((viewProduct.minStockAlert || 5) * 2) - viewProduct.stock)} {viewProduct.unit?.shortName || "Pc"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                <button
                  onClick={() => {
                    const target = viewProduct;
                    setViewProduct(null);
                    handleOpenRestock(target);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Restock Now
                </button>
                <button
                  onClick={() => setViewProduct(null)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DELETE SINGLE MODAL ==================== */}
        {deleteProductTarget && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">Remove Product from Inventory?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to delete <strong className="text-gray-900 font-bold">&quot;{deleteProductTarget.name}&quot;</strong> ({deleteProductTarget.sku})?
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeleteProductTarget(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors min-w-[100px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs min-w-[100px] flex items-center justify-center space-x-1"
                >
                  {actionLoading && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Delete Product</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== BULK DELETE MODAL ==================== */}
        {isBulkDeleting && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">
                  Delete {selectedIds.length} Selected Items?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  This will remove all {selectedIds.length} selected products from your inventory.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setIsBulkDeleting(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors min-w-[100px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmBulkDelete}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs min-w-[100px] flex items-center justify-center space-x-1"
                >
                  {actionLoading && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Delete All ({selectedIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

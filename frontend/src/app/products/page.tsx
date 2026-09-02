"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Product, Category, Brand, Warehouse } from "@/types";
import { SearchableSelect, OptionItem } from "@/components/common/SearchableSelect";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchWarehouses,
  deleteProductApi,
  bulkDeleteProductsApi,
} from "@/lib/api";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  X,
  AlertTriangle,
  Package,
  Calendar,
  Layers,
  DollarSign,
  Tag,
  Building2,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  Info,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function ProductsPage() {
  const {
    user,
    isAdmin,
    canCreateProduct,
    canEditProduct,
    canDeleteProduct,
    fetchRolePermissions,
  } = useAuthStore();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Helper to compute effective stock of a product for the currently selected warehouse
  const getProductWhStock = (item: Product): number => {
    if (selectedWarehouse === "all") {
      return item.stock;
    }
    if (selectedWarehouse.includes(",")) {
      const ids = selectedWarehouse.split(",").map((s) => s.trim());
      const myStocks = item.stocks?.filter((s) => ids.includes(s.warehouseId)) || [];
      return myStocks.reduce((sum, s) => sum + s.quantity, 0);
    }
    const whStockItem = item.stocks?.find((s) => s.warehouseId === selectedWarehouse);
    return whStockItem?.quantity ?? (item.warehouseId === selectedWarehouse ? item.stock : 0);
  };

  // Determine permitted warehouses for currently logged-in user
  const isAdminUser = isAdmin() || !user?.warehouseName || user?.warehouseName === "All Warehouses";

  const allowedWarehouses = useMemo(() => {
    if (isAdminUser) return warehouses;

    // Check user.assignedWarehouses
    if (user?.assignedWarehouses && user.assignedWarehouses.length > 0) {
      const assignedIds = user.assignedWarehouses.map((aw) => aw.warehouseId);
      const matched = warehouses.filter((w) => assignedIds.includes(w.id));
      if (matched.length > 0) return matched;
    }

    // Check user.warehouseIds
    if (user?.warehouseIds && user.warehouseIds.length > 0) {
      const matched = warehouses.filter((w) => user.warehouseIds?.includes(w.id));
      if (matched.length > 0) return matched;
    }

    // Check user.warehouseName
    if (user?.warehouseName) {
      const names = user.warehouseName.split(",").map((s) => s.trim().toLowerCase());
      const matched = warehouses.filter((w) => names.includes(w.name.toLowerCase()));
      if (matched.length > 0) return matched;
    }

    return warehouses;
  }, [warehouses, user, isAdminUser]);

  // Dropdown options for warehouse filter (Global Visibility with clean icons)
  const warehouseOptions = useMemo(() => {
    const assignedIds = allowedWarehouses.map((w) => w.id);
    const options: OptionItem[] = [];

    // If non-admin has multiple assigned warehouses, provide shortcut to view all their warehouses combined
    if (!isAdminUser && allowedWarehouses.length > 1) {
      options.push({
        value: allowedWarehouses.map((w) => w.id).join(","),
        label: `All Assigned (${allowedWarehouses.length})`,
        icon: <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
      });
    }

    // List all warehouses in the company
    for (const w of warehouses) {
      const isMyWh = assignedIds.includes(w.id);
      options.push({
        value: w.id,
        label: w.name,
        icon: isMyWh ? (
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <WarehouseIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        ),
      });
    }

    return options;
  }, [isAdminUser, warehouses, allowedWarehouses]);

  // Smart initial default: Default to user's assigned warehouse on initial load without blocking manual selection
  const [hasDefaultedWarehouse, setHasDefaultedWarehouse] = useState<boolean>(false);

  useEffect(() => {
    if (!isMounted || hasDefaultedWarehouse || warehouses.length === 0) return;

    if (!isAdminUser && allowedWarehouses.length > 0) {
      if (allowedWarehouses.length === 1) {
        setSelectedWarehouse(allowedWarehouses[0].id);
      } else {
        setSelectedWarehouse(allowedWarehouses.map((w) => w.id).join(","));
      }
    }
    setHasDefaultedWarehouse(true);
  }, [isMounted, hasDefaultedWarehouse, isAdminUser, allowedWarehouses, warehouses]);

  // Modals state
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string>("");
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Calculation for View Modal consistent with selectedWarehouse dropdown
  const selectedWhName = useMemo(() => {
    if (selectedWarehouse === "all") return "All Warehouses (ทุกคลังสินค้า)";
    if (selectedWarehouse.includes(",")) return `คลังที่คุณดูแลทั้งหมด (${selectedWarehouse.split(",").length} คลัง)`;
    const matched = warehouses.find((w) => w.id === selectedWarehouse);
    return matched?.name || "คลังที่เลือก";
  }, [selectedWarehouse, warehouses]);

  const viewModalStockData = useMemo(() => {
    if (!viewProduct) return { qty: 0, label: "All Warehouses", isFiltered: false };

    if (selectedWarehouse === "all") {
      return {
        qty: viewProduct.stock,
        label: "ทุกคลังสินค้า",
        isFiltered: false,
      };
    }

    if (selectedWarehouse.includes(",")) {
      const ids = selectedWarehouse.split(",");
      const myStocks = viewProduct.stocks?.filter((s) => ids.includes(s.warehouseId)) || [];
      const totalMyQty = myStocks.reduce((sum, s) => sum + s.quantity, 0);
      return {
        qty: totalMyQty,
        label: `รวมคลังที่คุณดูแล (${ids.length} คลัง)`,
        isFiltered: true,
      };
    }

    // Single specific warehouse selected in dropdown
    const stk = viewProduct.stocks?.find((s) => s.warehouseId === selectedWarehouse);
    const whQty = stk?.quantity ?? (viewProduct.warehouseId === selectedWarehouse ? viewProduct.stock : 0);
    const wh = warehouses.find((w) => w.id === selectedWarehouse);
    return {
      qty: whQty,
      label: `ในคลัง: ${wh?.name || "คลังนี้"}`,
      isFiltered: true,
    };
  }, [viewProduct, selectedWarehouse, warehouses]);

  // Filter stocks to display in View Modal strictly according to selectedWarehouse in dropdown
  const modalDisplayStocks = useMemo(() => {
    if (!viewProduct) return [];
    const allStocks = viewProduct.stocks || [];

    if (selectedWarehouse === "all") {
      return allStocks;
    }

    if (selectedWarehouse.includes(",")) {
      const ids = selectedWarehouse.split(",").map((s) => s.trim());
      const matched = allStocks.filter((stk) => ids.includes(stk.warehouseId));
      for (const id of ids) {
        if (!matched.some((m) => m.warehouseId === id)) {
          const wh = warehouses.find((w) => w.id === id);
          if (wh) {
            matched.push({
              id: `fallback-${id}`,
              warehouseId: id,
              warehouse: wh,
              quantity: viewProduct.warehouseId === id ? viewProduct.stock : 0,
            } as any);
          }
        }
      }
      return matched;
    }

    // Single selected warehouse
    const matched = allStocks.filter((stk) => stk.warehouseId === selectedWarehouse);
    if (matched.length === 0) {
      const wh = warehouses.find((w) => w.id === selectedWarehouse);
      if (wh) {
        matched.push({
          id: `fallback-${selectedWarehouse}`,
          warehouseId: selectedWarehouse,
          warehouse: wh,
          quantity: viewProduct.warehouseId === selectedWarehouse ? viewProduct.stock : 0,
        } as any);
      }
    }
    return matched;
  }, [viewProduct, selectedWarehouse, warehouses]);

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
    itemName?: string;
  }>({
    isOpen: false,
    type: "delete_success",
    title: "",
    message: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [prods, cats, brds, whs] = await Promise.all([
        fetchProducts({
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          brandId: selectedBrand !== "all" ? selectedBrand : undefined,
          search: search.trim() || undefined,
        }),
        fetchCategories(),
        fetchBrands(),
        fetchWarehouses(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brds);
      setWarehouses(whs || []);
    } catch (err: any) {
      console.error(err);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Products",
        message: err.message || "An error occurred while fetching products.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchRolePermissions();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedBrand]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Filter client-side for instant response across Warehouse, Stock Status, and Search
  const filteredProducts = products.filter((item) => {
    // 1. Search filter
    const term = search.toLowerCase().trim();
    if (term) {
      const matchName = item.name.toLowerCase().includes(term);
      const matchSku = item.sku.toLowerCase().includes(term);
      const matchBarcode = item.barcode?.toLowerCase().includes(term);
      const matchCategory = item.category?.name.toLowerCase().includes(term);
      const matchBrand = item.brand?.name.toLowerCase().includes(term);
      if (!matchName && !matchSku && !matchBarcode && !matchCategory && !matchBrand) {
        return false;
      }
    }

    // 2. Stock Status filter relative to the currently selected warehouse
    if (selectedStockStatus !== "all") {
      const whQty = getProductWhStock(item);
      const minAlert = item.minStockAlert || 5;

      if (selectedStockStatus === "in_stock") {
        if (whQty <= 0) return false;
      } else if (selectedStockStatus === "low_stock") {
        if (whQty <= 0 || whQty > minAlert) return false;
      } else if (selectedStockStatus === "out_of_stock") {
        if (whQty > 0) return false;
      }
    }

    return true;
  });

  // Pagination calculation
  const totalEntries = filteredProducts.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Delete Single Product
  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;
    if (!canDeleteProduct()) {
      setDeleteProductTarget(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การใช้งาน)",
        message: "คุณไม่มีสิทธิ์ในการลบสินค้าหลักออกจากระบบ (สงวนสิทธิ์เฉพาะผู้ดูแลระบบ)",
      });
      return;
    }
    const targetName = deleteProductTarget.name;
    try {
      setActionLoading(true);
      await deleteProductApi(deleteProductTarget.id);
      setDeleteProductTarget(null);
      setSelectedIds(selectedIds.filter((id) => id !== deleteProductTarget.id));
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Product Removed!",
        message: `Product "${targetName}" has been successfully removed/deactivated.`,
        itemName: targetName,
      });
      await loadData();
    } catch (err: any) {
      setDeleteProductTarget(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "Failed to delete product.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    if (!canDeleteProduct()) {
      setIsBulkDeleting(false);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การใช้งาน)",
        message: "คุณไม่มีสิทธิ์ในการลบสินค้าหลักออกจากระบบ (สงวนสิทธิ์เฉพาะผู้ดูแลระบบ)",
      });
      return;
    }
    const count = selectedIds.length;
    try {
      setActionLoading(true);
      const res = await bulkDeleteProductsApi(selectedIds);
      setIsBulkDeleting(false);
      setSelectedIds([]);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Bulk Delete Successful!",
        message: `Successfully removed/deactivated ${res.count || count} selected products.`,
      });
      await loadData();
    } catch (err: any) {
      setIsBulkDeleting(false);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Bulk Delete Failed",
        message: err.message || "Failed to deactivate selected products.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      alert("No product data to export.");
      return;
    }
    const headers = ["SKU", "Product Name", "Category", "Brand", "Price", "Cost Price", "Stock", "Unit", "Min Alert", "Status"];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category?.name || "N/A"}"`,
      `"${p.brand?.name || "N/A"}"`,
      p.price,
      p.costPrice || 0,
      p.stock,
      `"${p.unit?.shortName || "Pc"}"`,
      p.minStockAlert,
      `"${p.status}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `products_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF / Print
  const handleExportPDF = () => {
    window.print();
  };

  // Parse primary image helper
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

  const getProductImageList = (img?: string | null): string[] => {
    if (!img) return ["/assets/images/product-01.jpg"];
    if (img.startsWith("[")) {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [img];
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-12">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Product List</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage and organize your inventory products</p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Bulk Delete Button when items selected */}
            {isMounted && selectedIds.length > 0 && canDeleteProduct() && (
              <button
                onClick={() => setIsBulkDeleting(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

            {/* PDF Export (Red) */}
            <button
              title="Export PDF / Print"
              onClick={handleExportPDF}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export (Green) */}
            <button
              title="Export Excel / CSV"
              onClick={handleExportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh Products"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>

            {/* + Add Product Button (Orange) - only show if permitted and mounted on client */}
            {isMounted && canCreateProduct() && (
              <Link
                href="/products/add"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </Link>
            )}
          </div>
        </div>

        {/* Product Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by SKU, Name, Barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                  }}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 flex-wrap">
              {/* Warehouse Filter */}
              {/* Warehouse Filter */}
              <div className="w-60">
                <SearchableSelect
                  size="sm"
                  showSelectOption={false}
                  showAllOption={true}
                  allOptionLabel="All Warehouses"
                  placeholder="All Warehouses"
                  options={warehouseOptions}
                  value={selectedWarehouse}
                  onChange={(val) => {
                    setSelectedWarehouse(val);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Category Filter */}
              <div className="w-40">
                <SearchableSelect
                  size="sm"
                  showAllOption
                  allOptionLabel="All Categories"
                  placeholder="All Categories"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Brand Filter */}
              <div className="w-36">
                <SearchableSelect
                  size="sm"
                  showAllOption
                  allOptionLabel="All Brands"
                  placeholder="All Brands"
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                  value={selectedBrand}
                  onChange={(val) => {
                    setSelectedBrand(val);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Stock Status Filter (On Hand / Low Stock / Out of Stock) */}
              <div className="w-40">
                <SearchableSelect
                  size="sm"
                  showSelectOption={false}
                  showAllOption={false}
                  placeholder="All Stock Status"
                  options={[
                    { value: "all", label: "All Stock Status" },
                    { value: "in_stock", label: "On Hand" },
                    { value: "low_stock", label: "Low Stock" },
                    { value: "out_of_stock", label: "Out of Stock" },
                  ]}
                  value={selectedStockStatus}
                  onChange={(val) => {
                    setSelectedStockStatus(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </form>

          {/* Clean Table matching template */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProducts.length > 0 &&
                        paginatedProducts.every((p) => selectedIds.includes(p.id))
                      }
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-3 font-bold text-[#111827]">SKU</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Product Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Brand</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Price</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Unit</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Qty</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-3 text-right font-bold text-[#111827]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FE9F43]" />
                      Loading products...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No products found. Click &quot;Add Product&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isLowStock = item.stock <= (item.minStockAlert || 5) && item.stock > 0;
                    const isOutOfStock = item.stock <= 0;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#F9FAFB] transition-colors ${
                          isSelected ? "bg-[#FFF8F2]" : ""
                        }`}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                          />
                        </td>

                        <td className="py-3.5 px-3 text-[#64748B] font-mono font-medium">{item.sku}</td>

                        {/* Product Name with Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={getPrimaryImage(item.image)}
                              alt={item.name}
                              className="w-8 h-8 rounded object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                              }}
                            />
                            <div>
                              <span className="font-semibold text-[#1E293B] line-clamp-1">{item.name}</span>
                              {item.barcode && (
                                <span className="text-[10px] text-gray-400 font-mono">Barcode: {item.barcode}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B]">{item.category?.name || "-"}</td>
                        <td className="py-3.5 px-4 text-[#64748B]">{item.brand?.name || "-"}</td>
                        <td className="py-3.5 px-3 text-[#1E293B] font-semibold">฿{item.price.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-[#64748B]">{item.unit?.shortName || "Pc"}</td>
                        <td className="py-3.5 px-3">
                          {(() => {
                            const whQty = getProductWhStock(item);
                            const minAlert = item.minStockAlert || 5;
                            const isZero = whQty <= 0;
                            const isLow = whQty <= minAlert && whQty > 0;

                            return (
                              <span
                                className={`font-semibold ${
                                  isZero
                                    ? "text-rose-600"
                                    : isLow
                                    ? "text-amber-600"
                                    : "text-slate-700"
                                }`}
                              >
                                {whQty}
                              </span>
                            );
                          })()}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3">
                          {(() => {
                            const whQty = getProductWhStock(item);
                            const minAlert = item.minStockAlert || 5;
                            const isZero = whQty <= 0;
                            const isLow = whQty <= minAlert && whQty > 0;

                            if (isZero) {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                                  Out of Stock
                                </span>
                              );
                            }
                            if (isLow) {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                                  Low Stock
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                In Stock
                              </span>
                            );
                          })()}
                        </td>

                        {/* Actions: View (Always), Edit (if canEditProduct), Delete (if canDeleteProduct) */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View Button (Always visible) */}
                            <button
                              onClick={() => {
                                setActiveModalImage(getPrimaryImage(item.image));
                                setViewProduct(item);
                              }}
                              title="View Details"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit Button (Only if permitted) */}
                            {isMounted && canEditProduct() && (
                              <Link
                                href={`/products/edit/${item.id}`}
                                title="Edit Product"
                                className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            {/* 3. Delete Button (Only if permitted) */}
                            {isMounted && canDeleteProduct() && (
                              <button
                                onClick={() => setDeleteProductTarget(item)}
                                title="Delete Product"
                                className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center transition-colors bg-white cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-[#64748B] gap-3 border-t border-[#F1F3F5]">
            <div className="flex items-center space-x-2">
              <span>Showing</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>of {totalEntries} entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#94A3B8] disabled:opacity-40"
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
                        : "hover:bg-gray-100 text-[#64748B]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B] disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* ==================== VIEW PRODUCT MODAL ==================== */}
        {viewProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-orange-100 text-[#FE9F43] rounded-xl">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Product Details</h3>
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

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="space-y-2.5 flex-shrink-0">
                    <div className="w-36 h-36 rounded-2xl object-contain bg-gray-50 border border-gray-200 p-2 flex items-center justify-center overflow-hidden shadow-xs">
                      <img
                        src={activeModalImage || getPrimaryImage(viewProduct.image)}
                        alt={viewProduct.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                        }}
                      />
                    </div>
                    {/* Interactive Small Gallery Thumbnails if > 1 image */}
                    {getProductImageList(viewProduct.image).length > 1 && (
                      <div className="flex items-center gap-1.5 max-w-[144px] overflow-x-auto pb-1">
                        {getProductImageList(viewProduct.image).map((thumb, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setActiveModalImage(thumb)}
                            className={`w-9 h-9 rounded-lg object-contain bg-white border-2 p-0.5 flex-shrink-0 transition-all cursor-pointer ${
                              (activeModalImage || getPrimaryImage(viewProduct.image)) === thumb
                                ? "border-[#FE9F43] shadow-xs scale-105"
                                : "border-gray-200 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={thumb}
                              alt={`Thumb ${idx + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                        {viewProduct.category?.name || "General"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {viewProduct.brand?.name || "Standard Brand"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          viewProduct.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : viewProduct.status === "OUT_OF_STOCK"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {viewProduct.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{viewProduct.name}</h2>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                      {viewProduct.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Selling Price</p>
                    <p className="text-base font-bold text-orange-600 mt-0.5">฿{viewProduct.price.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Cost Price</p>
                    <p className="text-base font-bold text-gray-700 mt-0.5">฿{(viewProduct.costPrice || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Est. Margin</p>
                    <p className="text-base font-bold text-emerald-600 mt-0.5">
                      {viewProduct.price > 0
                        ? `${(((viewProduct.price - (viewProduct.costPrice || 0)) / viewProduct.price) * 100).toFixed(0)}%`
                        : "0%"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Stock Qty</p>
                      {viewModalStockData.isFiltered && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/50">
                          {viewModalStockData.label}
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {viewModalStockData.qty}{" "}
                      <span className="text-xs font-normal text-gray-500">{viewProduct.unit?.shortName || "Pc"}</span>
                    </p>
                  </div>
                </div>

                {/* Inventory & Logistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                    <div className="flex justify-between items-center pb-1 border-b border-gray-200/60 font-semibold text-gray-700">
                      <span>Inventory & Storage</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Warehouse:</span>
                      <span className="font-semibold text-gray-900">{selectedWhName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Store / Branch:</span>
                      <span className="font-medium text-gray-900">{viewProduct.store?.name || "Main Store"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Min Alert Qty:</span>
                      <span className="font-bold text-amber-600">{viewProduct.minStockAlert} {viewProduct.unit?.shortName || "Pc"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Stock Value:</span>
                      <span className="font-bold text-gray-900">
                        ฿{(viewModalStockData.qty * viewProduct.price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                    <div className="flex justify-between items-center pb-1 border-b border-gray-200/60 font-semibold text-gray-700">
                      <span>Tracking & Codes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Barcode:</span>
                      <span className="font-mono font-medium text-gray-900">{viewProduct.barcode || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Manufactured Date:</span>
                      <span className="font-medium text-gray-900">
                        {viewProduct.manufacturedDate ? new Date(viewProduct.manufacturedDate).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expiry Date:</span>
                      <span className="font-medium text-gray-900">
                        {viewProduct.expiredDate ? new Date(viewProduct.expiredDate).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unit Type:</span>
                      <span className="font-medium text-gray-900">{viewProduct.unit?.name || "Piece"}</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Warehouse Stock Breakdown */}
                {modalDisplayStocks.length > 0 && (
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/80 text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-blue-900 pb-1 border-b border-blue-200/50">
                      <div className="flex items-center space-x-1.5">
                        <WarehouseIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {selectedWarehouse === "all"
                            ? "Multi-Warehouse Stock Breakdown (ทุกคลังสินค้า)"
                            : `Stock Breakdown (${selectedWhName})`}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700">Total: {viewModalStockData.qty} {viewProduct.unit?.shortName || "Pcs"}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {modalDisplayStocks.map((stk) => {
                        const assignedIds = allowedWarehouses.map((w) => w.id);
                        const isUserWh =
                          isAdminUser ||
                          assignedIds.includes(stk.warehouseId) ||
                          (user?.warehouseName &&
                            stk.warehouse?.name?.toLowerCase().trim() ===
                              user.warehouseName.toLowerCase().trim());
                        const isCurrentlySelectedWh = selectedWarehouse === stk.warehouseId;

                        return (
                          <div
                            key={stk.id}
                            className={`flex justify-between items-center p-2 rounded-lg border shadow-2xs transition-all ${
                              isCurrentlySelectedWh
                                ? "bg-orange-50/80 border-[#FE9F43] ring-2 ring-orange-200"
                                : isUserWh && !isAdminUser
                                ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200"
                                : "bg-white border-blue-100"
                            }`}
                          >
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`font-medium ${
                                  isCurrentlySelectedWh
                                    ? "text-orange-950 font-bold"
                                    : isUserWh
                                    ? "text-emerald-900 font-bold"
                                    : "text-gray-700"
                                }`}
                              >
                                {stk.warehouse?.name || "Warehouse"}
                              </span>
                              {isCurrentlySelectedWh && (
                                <span className="text-[9px] font-bold bg-[#FE9F43] text-white px-1.5 py-0.2 rounded-full">
                                  เลือกดูอยู่
                                </span>
                              )}
                              {!isCurrentlySelectedWh && isUserWh && !isAdminUser && (
                                <span className="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded-full">
                                  คลังของคุณ
                                </span>
                              )}
                            </div>
                            <span
                              className={`font-bold ${
                                isCurrentlySelectedWh
                                  ? "text-orange-600"
                                  : isUserWh
                                  ? "text-emerald-700"
                                  : "text-blue-700"
                              }`}
                            >
                              {stk.quantity}{" "}
                              <span className="text-[10px] text-gray-400 font-normal">
                                {viewProduct.unit?.shortName || "Pcs"}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                {canEditProduct() && (
                  <Link
                    href={`/products/edit/${viewProduct.id}`}
                    className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                  >
                    Edit Product
                  </Link>
                )}
                <button
                  onClick={() => setViewProduct(null)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DELETE SINGLE PRODUCT MODAL ==================== */}
        {deleteProductTarget && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">Delete Product</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">&quot;{deleteProductTarget.name}&quot;</span> (SKU: {deleteProductTarget.sku})? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setDeleteProductTarget(null)}
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  {actionLoading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{actionLoading ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Action Feedback / Alert Modal (Delete / Bulk Delete)      */}
        {/* ========================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
              {/* Top Icon Badge */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs ${
                  feedbackModal.type === "add_success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : feedbackModal.type === "edit_success"
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : feedbackModal.type === "delete_success"
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}
              >
                {feedbackModal.type === "add_success" && <Sparkles className="w-7 h-7" />}
                {feedbackModal.type === "edit_success" && <CheckCircle2 className="w-7 h-7" />}
                {feedbackModal.type === "delete_success" && <Trash2 className="w-7 h-7" />}
                {feedbackModal.type === "error" && <AlertTriangle className="w-7 h-7" />}
              </div>

              {/* Title & Message */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feedbackModal.message}</p>
              </div>

              {/* Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                  className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-colors ${
                    feedbackModal.type === "error"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-[#FE9F43] hover:bg-[#E88B32]"
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}


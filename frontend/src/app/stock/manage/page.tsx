"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Product, Warehouse, Store } from "@/types";
import {
  fetchProducts,
  fetchWarehouses,
  fetchStores,
  updateProductApi,
  deleteProductApi,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Edit,
  Trash2,
  Eye,
  X,
  Package,
  Boxes,
  Warehouse as WarehouseIcon,
  Store as StoreIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Tag,
  ShieldAlert,
} from "lucide-react";

export default function ManageStockPage() {
  const { user, isAdmin, canManageWarehouse } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
    itemName?: string;
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  // View Details Modal
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Edit / Adjust Stock Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustMinAlert, setAdjustMinAlert] = useState<number>(5);
  const [adjustWarehouseId, setAdjustWarehouseId] = useState<string>("");
  const [adjustStoreId, setAdjustStoreId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Confirmation Modal
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsData, whData, stData] = await Promise.all([
        fetchProducts({ search }),
        fetchWarehouses(),
        fetchStores(),
      ]);
      setProducts(prodsData || []);
      setWarehouses(whData || []);
      setStores(stData || []);

      // Smart Default: Auto-select user's warehouse if not Admin and not already filtered
      if (whData && user?.warehouseName && !isAdmin() && warehouseFilter === "all") {
        const match = whData.find(
          (w) => w.name.toLowerCase().trim() === user.warehouseName?.toLowerCase().trim()
        );
        if (match) {
          setWarehouseFilter(match.id);
        }
      }
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Stock Data",
        message: err.message || "An error occurred while fetching inventory records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Warehouse name mapping helper
  const getWarehouseName = (whId?: string | null) => {
    if (!whId) return "Main Warehouse";
    const wh = warehouses.find((w) => w.id === whId);
    return wh ? wh.name : "Main Warehouse";
  };

  // Store name mapping helper
  const getStoreName = (stId?: string | null) => {
    if (!stId) return "Electro Mart";
    const st = stores.find((s) => s.id === stId);
    return st ? st.name : "Electro Mart";
  };

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(search.toLowerCase()));

      const matchesWarehouse =
        warehouseFilter === "all" || p.warehouseId === warehouseFilter;
      const matchesStore =
        storeFilter === "all" || p.storeId === storeFilter;
      const matchesProduct =
        productFilter === "all" || p.id === productFilter;

      return matchesSearch && matchesWarehouse && matchesStore && matchesProduct;
    });
  }, [products, search, warehouseFilter, storeFilter, productFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
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

  // Open Quick Edit / Adjust Modal
  const handleOpenAdjust = (prod: Product) => {
    const prodWarehouseName = getWarehouseName(prod.warehouseId);
    if (!canManageWarehouse(prodWarehouseName) && !isAdmin()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `You are assigned to "${user.warehouseName}". You do not have permission to adjust inventory in "${prodWarehouseName}". Please switch to your assigned warehouse.`,
      });
      return;
    }
    setAdjustingProduct(prod);
    setAdjustQty(prod.stock);
    setAdjustMinAlert(prod.minStockAlert || 5);
    setAdjustWarehouseId(prod.warehouseId || "");
    setAdjustStoreId(prod.storeId || "");
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    try {
      setIsSubmitting(true);
      await updateProductApi(adjustingProduct.id, {
        stock: Number(adjustQty),
        minStockAlert: Number(adjustMinAlert),
        warehouseId: adjustWarehouseId || null,
        storeId: adjustStoreId || null,
        status: Number(adjustQty) <= 0 ? "OUT_OF_STOCK" : "ACTIVE",
      });

      setAdjustingProduct(null);
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Stock Updated!",
        message: `Inventory stock for "${adjustingProduct.name}" has been updated to ${adjustQty} units.`,
        itemName: adjustingProduct.name,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to update stock quantity.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    const prodName = deletingProduct.name;
    const prodWarehouseName = getWarehouseName(deletingProduct.warehouseId);

    if (!canManageWarehouse(prodWarehouseName) && !isAdmin()) {
      setDeletingProduct(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `You are assigned to "${user.warehouseName}". You do not have permission to delete items from "${prodWarehouseName}".`,
      });
      return;
    }
    try {
      setIsDeleting(true);
      await deleteProductApi(deletingProduct.id);
      setDeletingProduct(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Stock Item Deleted!",
        message: `Product "${prodName}" has been removed from inventory.`,
        itemName: prodName,
      });
      loadData();
    } catch (err: any) {
      setDeletingProduct(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to delete item.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredProducts.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Product Name", "SKU", "Warehouse", "Store", "Stock Qty", "Min Alert", "Price", "Status"];
    const rows = filteredProducts.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${getWarehouseName(p.warehouseId)}"`,
      `"${getStoreName(p.storeId)}"`,
      p.stock,
      p.minStockAlert,
      p.price,
      p.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `manage_stock_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Manage Stock</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage and monitor your warehouse & store inventory stocks</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export */}
            <button
              title="Export PDF / Print"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel / CSV Export */}
            <button
              title="Export CSV"
              onClick={exportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>

            {/* Add Stock / Adjustment */}
            <Link
              href="/stock/adjustment"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Stock Adjustment</span>
            </Link>
          </div>
        </div>

        {/* Manage Stock Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & 3 SearchableSelect Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-72">
              <input
                type="text"
                placeholder="Search by product, SKU, brand..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 w-full lg:w-auto">
              {/* Warehouse Filter */}
              <div className="w-full lg:w-44">
                <SearchableSelect
                  placeholder="All Warehouses"
                  value={warehouseFilter}
                  onChange={(val) => {
                    setWarehouseFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All Warehouses" },
                    ...warehouses.map((w) => ({ value: w.id, label: w.name })),
                  ]}
                />
              </div>

              {/* Store Filter */}
              <div className="w-full lg:w-44">
                <SearchableSelect
                  placeholder="All Stores"
                  value={storeFilter}
                  onChange={(val) => {
                    setStoreFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All Stores" },
                    ...stores.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
              </div>

              {/* Product Filter */}
              <div className="w-full lg:w-48">
                <SearchableSelect
                  placeholder="All Products"
                  value={productFilter}
                  onChange={(val) => {
                    setProductFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All Products" },
                    ...products.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto min-h-[300px] -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Warehouse</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Store</th>
                  <th className="py-3 px-4 font-bold text-[#111827] min-w-[180px]">Product</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">SKU / Barcode</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Price</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">In Stock</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827] w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading live stock records...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Package className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <p className="text-sm font-medium text-gray-500">No stock records found</p>
                        <p className="text-xs text-gray-400">Try adjusting your search query or dropdown filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isLowStock = item.stock <= (item.minStockAlert || 5) && item.stock > 0;
                    const isOutOfStock = item.stock === 0;

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

                        {/* Warehouse */}
                        <td className="py-3.5 px-4 text-[#64748B]">
                          <div className="flex items-center space-x-1.5">
                            <WarehouseIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{getWarehouseName(item.warehouseId)}</span>
                          </div>
                        </td>

                        {/* Store */}
                        <td className="py-3.5 px-4 text-[#64748B]">
                          <div className="flex items-center space-x-1.5">
                            <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{getStoreName(item.storeId)}</span>
                          </div>
                        </td>

                        {/* Product with Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image || "/assets/images/product-01.jpg"}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                              }}
                            />
                            <div>
                              <span className="font-semibold text-[#1E293B] line-clamp-1">{item.name}</span>
                              <span className="text-[11px] text-gray-400">
                                {item.category?.name || "General"} {item.brand ? `• ${item.brand.name}` : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-4 font-mono text-[#64748B] text-[11px]">
                          {item.sku}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-semibold text-[#1E293B]">
                          ${item.price.toFixed(2)}
                        </td>

                        {/* Qty with Badges */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                              isOutOfStock
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : isLowStock
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            {item.stock} {item.unit?.shortName || "Pcs"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "ACTIVE" && !isOutOfStock
                                ? "bg-green-100 text-green-700"
                                : item.status === "OUT_OF_STOCK" || isOutOfStock
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isOutOfStock ? "Out of Stock" : item.status}
                          </span>
                        </td>

                        {/* Action Buttons: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View Button */}
                            <button
                              onClick={() => setViewProduct(item)}
                              title="View Stock Details"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-50 text-[#64748B] hover:text-[#0E1422] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit / Quick Adjust Button */}
                            <button
                              onClick={() => handleOpenAdjust(item)}
                              title="Adjust Stock"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete Button */}
                            <button
                              onClick={() => setDeletingProduct(item)}
                              title="Delete Item"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center transition-colors bg-white cursor-pointer"
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-[#64748B] gap-3 border-t border-[#F1F3F5]">
            <div className="flex items-center space-x-2">
              <span>Row Per Page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>Entries • Total {filteredProducts.length} items</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-[#94A3B8] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#FE9F43] text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW STOCK DETAILS MODAL */}
        {/* ========================================================================= */}
        {viewProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{viewProduct.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">SKU: {viewProduct.sku}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewProduct(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center space-x-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <img
                    src={viewProduct.image || "/assets/images/product-01.jpg"}
                    alt={viewProduct.name}
                    className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                    }}
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Current Stock Level</p>
                    <p className="text-xl font-bold text-[#1E293B]">
                      {viewProduct.stock} <span className="text-xs font-normal text-gray-500">{viewProduct.unit?.shortName || "Units"}</span>
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        viewProduct.stock > (viewProduct.minStockAlert || 5)
                          ? "bg-emerald-100 text-emerald-700"
                          : viewProduct.stock > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {viewProduct.stock > (viewProduct.minStockAlert || 5)
                        ? "Well Stocked"
                        : viewProduct.stock > 0
                        ? "Low Stock Warning"
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-gray-400">Warehouse</span>
                  <p className="text-xs font-semibold text-gray-800">{getWarehouseName(viewProduct.warehouseId)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-gray-400">Store / Branch</span>
                  <p className="text-xs font-semibold text-gray-800">{getStoreName(viewProduct.storeId)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-gray-400">Selling Price</span>
                  <p className="text-xs font-semibold text-gray-800">${viewProduct.price.toFixed(2)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-gray-400">Cost Price</span>
                  <p className="text-xs font-semibold text-gray-800">${(viewProduct.costPrice || 0).toFixed(2)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-gray-400">Min Alert Quantity</span>
                  <p className="text-xs font-semibold text-gray-800">{viewProduct.minStockAlert || 5} units</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-gray-400">Category / Brand</span>
                  <p className="text-xs font-semibold text-gray-800">
                    {viewProduct.category?.name || "N/A"} / {viewProduct.brand?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setViewProduct(null)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* QUICK ADJUST STOCK MODAL */}
        {/* ========================================================================= */}
        {adjustingProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Adjust Stock</h3>
                    <p className="text-xs text-gray-400">{adjustingProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAdjustingProduct(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjust} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Min Alert Limit</label>
                    <input
                      type="number"
                      min={0}
                      value={adjustMinAlert}
                      onChange={(e) => setAdjustMinAlert(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Warehouse Location</label>
                  <SearchableSelect
                    placeholder="Select Warehouse..."
                    value={adjustWarehouseId}
                    onChange={(val) => setAdjustWarehouseId(val)}
                    options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Store / Branch</label>
                  <SearchableSelect
                    placeholder="Select Store..."
                    value={adjustStoreId}
                    onChange={(val) => setAdjustStoreId(val)}
                    options={stores.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setAdjustingProduct(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? "Updating..." : "Save Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION MODAL (STEP 1: ROSE TRASH) */}
        {/* ========================================================================= */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <Trash2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Delete Product Record?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-gray-800">"{deletingProduct.name}"</span> from the inventory database?
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEEDBACK MODALS (ADD/EDIT/DELETE/ERROR AS PER GEMINI.MD) */}
        {/* ========================================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
              {/* Icon per type */}
              {feedbackModal.type === "add_success" && (
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                  <Sparkles className="w-7 h-7 stroke-[1.75]" />
                </div>
              )}
              {feedbackModal.type === "edit_success" && (
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
                  <CheckCircle2 className="w-7 h-7 stroke-[1.75]" />
                </div>
              )}
              {feedbackModal.type === "delete_success" && (
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                  <Trash2 className="w-7 h-7 stroke-[1.75]" />
                </div>
              )}
              {feedbackModal.type === "error" && (
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                  <AlertTriangle className="w-7 h-7 stroke-[1.75]" />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feedbackModal.message}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-center space-x-2">
                {feedbackModal.type === "add_success" ? (
                  <>
                    <button
                      onClick={() => {
                        setFeedbackModal({ ...feedbackModal, isOpen: false });
                        window.location.href = "/products/add";
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      + Add Another
                    </button>
                    <button
                      onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                    className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}


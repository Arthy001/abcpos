"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Product, Category, Brand } from "@/types";
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
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
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modals state
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string>("");
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats, brds] = await Promise.all([
        fetchProducts({
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          brandId: selectedBrand !== "all" ? selectedBrand : undefined,
          search: search.trim() || undefined,
        }),
        fetchCategories(),
        fetchBrands(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brds);
    } catch (err: any) {
      console.error(err);
      showNotification("error", err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedBrand]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Filter client-side if needed for instant response
  const filteredProducts = products.filter((item) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const matchName = item.name.toLowerCase().includes(term);
    const matchSku = item.sku.toLowerCase().includes(term);
    const matchBarcode = item.barcode?.toLowerCase().includes(term);
    const matchCategory = item.category?.name.toLowerCase().includes(term);
    const matchBrand = item.brand?.name.toLowerCase().includes(term);
    return matchName || matchSku || matchBarcode || matchCategory || matchBrand;
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
    try {
      setActionLoading(true);
      await deleteProductApi(deleteProductTarget.id);
      showNotification("success", `Product "${deleteProductTarget.name}" deleted successfully.`);
      setDeleteProductTarget(null);
      setSelectedIds(selectedIds.filter((id) => id !== deleteProductTarget.id));
      await loadData();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to delete product.");
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      const res = await bulkDeleteProductsApi(selectedIds);
      showNotification("success", `Deleted ${res.count || selectedIds.length} products successfully.`);
      setIsBulkDeleting(false);
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      showNotification("error", err.message || "Failed to delete selected products.");
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
        {/* Toast / Notification Banner */}
        {alertMessage && (
          <div
            className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium border transition-all ${
              alertMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              {alertMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{alertMessage.text}</span>
            </div>
            <button onClick={() => setAlertMessage(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Product List</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage and organize your inventory products</p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Bulk Delete Button when items selected */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setIsBulkDeleting(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold shadow-2xs active:scale-95 transition-all"
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

            {/* + Add Product Button (Orange) */}
            <Link
              href="/products/add"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Link>
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
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Brand Filter */}
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
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
                  <th className="py-3 px-3 font-bold text-[#111827]">Qty / Stock</th>
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
                          <span
                            className={`font-semibold ${
                              isOutOfStock
                                ? "text-rose-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-slate-700"
                            }`}
                          >
                            {item.stock}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions: View, Edit, Delete */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setActiveModalImage(getPrimaryImage(item.image));
                                setViewProduct(item);
                              }}
                              title="View Details"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/products/edit/${item.id}`}
                              title="Edit Product"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => setDeleteProductTarget(item)}
                              title="Delete Product"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center transition-colors bg-white"
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
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Stock Qty</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {viewProduct.stock} <span className="text-xs font-normal text-gray-500">{viewProduct.unit?.shortName || "Pc"}</span>
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
                      <span className="font-medium text-gray-900">{viewProduct.warehouse?.name || "Central Warehouse"}</span>
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
                      <span className="font-bold text-gray-900">฿{(viewProduct.stock * viewProduct.price).toLocaleString()}</span>
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
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                <Link
                  href={`/products/edit/${viewProduct.id}`}
                  className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                >
                  Edit Product
                </Link>
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

        {/* ==================== BULK DELETE CONFIRM MODAL ==================== */}
        {isBulkDeleting && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">Delete Selected Products</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to delete <span className="font-bold text-rose-600">{selectedIds.length}</span> selected products? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setIsBulkDeleting(false)}
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDeleteConfirm}
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  {actionLoading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{actionLoading ? "Deleting..." : "Delete All"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}


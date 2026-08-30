"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Product, Category, Brand, Warehouse } from "@/types";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchWarehouses,
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
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Calendar,
  Package,
  CheckCircle,
  X,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CalendarCheck,
  TrendingDown,
} from "lucide-react";

export default function ExpiredProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  // Filters
  const [expiryFilter, setExpiryFilter] = useState<"all" | "expired" | "expiring_7d" | "expiring_30d" | "good">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("soonest");

  // Selection & Pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modals
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editDateProduct, setEditDateProduct] = useState<Product | null>(null);
  const [editMfgDate, setEditMfgDate] = useState<string>("");
  const [editExpDate, setEditExpDate] = useState<string>("");

  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper to extract primary image
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

  // Helper for expiry calculation
  const getExpiryInfo = (expiredDateStr?: string | null) => {
    if (!expiredDateStr) {
      return {
        status: "NONE" as const,
        label: "No Expiry Date",
        days: null,
        badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
        indicator: "gray",
      };
    }

    const exp = new Date(expiredDateStr);
    if (isNaN(exp.getTime())) {
      return {
        status: "NONE" as const,
        label: "Invalid Date",
        days: null,
        badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
        indicator: "gray",
      };
    }

    const today = new Date();
    exp.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "EXPIRED" as const,
        label: `Expired (${Math.abs(diffDays)}d ago)`,
        days: diffDays,
        badgeClass: "bg-rose-100 text-rose-700 border-rose-200 font-bold",
        indicator: "rose",
      };
    } else if (diffDays <= 7) {
      return {
        status: "CRITICAL" as const,
        label: diffDays === 0 ? "Expires Today!" : `Expires in ${diffDays}d`,
        days: diffDays,
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse",
        indicator: "amber",
      };
    } else if (diffDays <= 30) {
      return {
        status: "WARNING" as const,
        label: `Expires in ${diffDays}d`,
        days: diffDays,
        badgeClass: "bg-orange-100 text-orange-700 border-orange-200 font-semibold",
        indicator: "orange",
      };
    } else {
      return {
        status: "GOOD" as const,
        label: `Good (${diffDays}d left)`,
        days: diffDays,
        badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200 font-medium",
        indicator: "emerald",
      };
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodData, catData, brandData, whData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands(),
        fetchWarehouses(),
      ]);
      setProducts(prodData);
      setCategories(catData);
      setBrands(brandData);
      setWarehouses(whData);
    } catch (err: any) {
      console.error(err);
      showAlert("error", err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showAlert = (type: "success" | "error", text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    let expiredCount = 0;
    let expiredCostValue = 0;
    let expiring30dCount = 0;
    let expiring30dCostValue = 0;
    let totalTracked = 0;

    products.forEach((p) => {
      if (p.expiredDate) {
        totalTracked++;
        const info = getExpiryInfo(p.expiredDate);
        const costVal = (p.costPrice || p.price || 0) * (p.stock || 0);

        if (info.status === "EXPIRED") {
          expiredCount++;
          expiredCostValue += costVal;
        } else if (info.status === "CRITICAL" || info.status === "WARNING") {
          expiring30dCount++;
          expiring30dCostValue += costVal;
        }
      }
    });

    return {
      expiredCount,
      expiredCostValue,
      expiring30dCount,
      expiring30dCostValue,
      totalTracked,
    };
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // Search Filter
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          (item.barcode && item.barcode.toLowerCase().includes(query));

        // Category Filter
        const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;

        // Brand Filter
        const matchesBrand = brandFilter === "all" || item.brandId === brandFilter;

        // Expiry Status Filter
        const expInfo = getExpiryInfo(item.expiredDate);
        let matchesExpiry = true;
        if (expiryFilter === "expired") {
          matchesExpiry = expInfo.status === "EXPIRED";
        } else if (expiryFilter === "expiring_7d") {
          matchesExpiry = expInfo.status === "CRITICAL";
        } else if (expiryFilter === "expiring_30d") {
          matchesExpiry = expInfo.status === "CRITICAL" || expInfo.status === "WARNING";
        } else if (expiryFilter === "good") {
          matchesExpiry = expInfo.status === "GOOD";
        }

        return matchesSearch && matchesCategory && matchesBrand && matchesExpiry;
      })
      .sort((a, b) => {
        const timeA = a.expiredDate ? new Date(a.expiredDate).getTime() : Infinity;
        const timeB = b.expiredDate ? new Date(b.expiredDate).getTime() : Infinity;

        if (sortBy === "soonest") {
          return timeA - timeB;
        } else if (sortBy === "latest") {
          return timeB - timeA;
        } else if (sortBy === "stock_high") {
          return (b.stock || 0) - (a.stock || 0);
        } else {
          return a.name.localeCompare(b.name);
        }
      });
  }, [products, search, categoryFilter, brandFilter, expiryFilter, sortBy]);

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

  // Quick Date Edit Modal Open
  const handleOpenEditDate = (prod: Product) => {
    setEditDateProduct(prod);
    setEditMfgDate(
      prod.manufacturedDate ? new Date(prod.manufacturedDate).toISOString().split("T")[0] : ""
    );
    setEditExpDate(
      prod.expiredDate ? new Date(prod.expiredDate).toISOString().split("T")[0] : ""
    );
  };

  // Save Quick Date Update
  const handleSaveDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDateProduct) return;

    try {
      setActionLoading(true);
      await updateProductApi(editDateProduct.id, {
        manufacturedDate: editMfgDate || null,
        expiredDate: editExpDate || null,
      });

      showAlert("success", `Updated expiry dates for "${editDateProduct.name}"`);
      setEditDateProduct(null);
      await loadData();
    } catch (err: any) {
      showAlert("error", err.message || "Failed to update dates");
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
      showAlert("success", `Disposed/deleted "${deleteProductTarget.name}" successfully`);
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
      showAlert("success", `Disposed/deleted ${res.count || selectedIds.length} expired items`);
      setIsBulkDeleting(false);
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      showAlert("error", err.message || "Failed to delete selected products");
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      showAlert("error", "No products to export");
      return;
    }

    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Brand",
      "Stock Qty",
      "Unit",
      "Selling Price",
      "Cost Price",
      "Lost Value",
      "Manufactured Date",
      "Expired Date",
      "Days Left",
      "Status",
    ];

    const rows = filteredProducts.map((p) => {
      const info = getExpiryInfo(p.expiredDate);
      const costVal = (p.costPrice || 0) * (p.stock || 0);
      return [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category?.name || "-"}"`,
        `"${p.brand?.name || "-"}"`,
        p.stock,
        `"${p.unit?.shortName || "Pc"}"`,
        p.price,
        p.costPrice || 0,
        costVal,
        `"${p.manufacturedDate ? new Date(p.manufacturedDate).toISOString().split("T")[0] : "-"}"`,
        `"${p.expiredDate ? new Date(p.expiredDate).toISOString().split("T")[0] : "-"}"`,
        info.days !== null ? info.days : "-",
        `"${info.label}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expired_products_${new Date().toISOString().split("T")[0]}.csv`);
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
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">Expired Products</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Monitor, track shelf life, and dispose of expired inventory items
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
          </div>
        </div>

        {/* Expired Products Table Card Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-4">
          {/* Filter Bar & Bulk Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full lg:w-72">
              <input
                type="text"
                placeholder="Search SKU, Name, Barcode..."
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
              {/* Expiry Status Filter */}
              <div className="w-44">
                <SearchableSelect
                  size="sm"
                  searchable={false}
                  showAllOption
                  allOptionLabel="All Expiry Status"
                  placeholder="All Expiry Status"
                  options={[
                    { value: "expired", label: "🔴 Already Expired" },
                    { value: "expiring_7d", label: "⚠️ Expiring in 7 Days" },
                    { value: "expiring_30d", label: "⏳ Expiring in 30 Days" },
                    { value: "good", label: "🟢 Good Shelf Life" },
                  ]}
                  value={expiryFilter}
                  onChange={(val) => {
                    setExpiryFilter(val as any);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Category Filter */}
              <div className="w-36">
                <SearchableSelect
                  size="sm"
                  showAllOption
                  allOptionLabel="All Categories"
                  placeholder="All Categories"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Brand Filter */}
              <div className="w-32">
                <SearchableSelect
                  size="sm"
                  showAllOption
                  allOptionLabel="All Brands"
                  placeholder="All Brands"
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                  value={brandFilter}
                  onChange={(val) => {
                    setBrandFilter(val);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Sort By */}
              <div className="w-44">
                <SearchableSelect
                  size="sm"
                  searchable={false}
                  options={[
                    { value: "soonest", label: "Expiring Soonest" },
                    { value: "latest", label: "Latest Expiry" },
                    { value: "stock_high", label: "Highest Stock" },
                    { value: "name", label: "Name (A-Z)" },
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>

              {/* Bulk Dispose Button */}
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setIsBulkDeleting(true)}
                  className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dispose Selected ({selectedIds.length})</span>
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
                  <th className="py-3.5 px-3 font-bold text-gray-900">SKU</th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">Product</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Category</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Stock Qty</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Cost Value</th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">Manufactured Date</th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">Expired Date</th>
                  <th className="py-3.5 px-3 font-bold text-gray-900">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FE9F43]" />
                      Loading inventory expiry data...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const expiry = getExpiryInfo(item.expiredDate);
                    const lostCostVal = (item.costPrice || 0) * (item.stock || 0);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/70 transition-colors ${
                          isSelected
                            ? "bg-orange-50/40"
                            : expiry.status === "EXPIRED"
                            ? "bg-rose-50/20"
                            : ""
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

                        <td className="py-3.5 px-3 text-gray-500 font-mono font-medium">{item.sku}</td>

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

                        <td className="py-3.5 px-3 text-gray-600">{item.category?.name || "-"}</td>

                        {/* Stock Qty */}
                        <td className="py-3.5 px-3 font-semibold text-gray-800">
                          {item.stock} <span className="text-[10px] font-normal text-gray-400">{item.unit?.shortName || "Pc"}</span>
                        </td>

                        {/* Cost Value */}
                        <td className="py-3.5 px-3 font-bold text-gray-700">
                          ฿{lostCostVal.toLocaleString()}
                        </td>

                        {/* Manufactured Date */}
                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                          {item.manufacturedDate ? (
                            new Date(item.manufacturedDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          ) : (
                            <span className="text-gray-400 italic">Not set</span>
                          )}
                        </td>

                        {/* Expired Date */}
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {item.expiredDate ? (
                            new Date(item.expiredDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          ) : (
                            <span className="text-gray-400 font-normal italic">Not set</span>
                          )}
                        </td>

                        {/* Expiry Status Badge */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] border shadow-2xs ${expiry.badgeClass}`}
                          >
                            {expiry.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* View Modal */}
                            <button
                              onClick={() => setViewProduct(item)}
                              title="View Details"
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors bg-white shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Edit Dates Modal */}
                            <button
                              onClick={() => handleOpenEditDate(item)}
                              title="Update Expiry Date"
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-amber-50 text-gray-500 hover:text-amber-600 flex items-center justify-center transition-colors bg-white shadow-2xs"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>

                            {/* Full Product Edit Link */}
                            <Link
                              href={`/products/edit/${item.id}`}
                              title="Edit Full Product"
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-orange-50 text-gray-500 hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white shadow-2xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Delete / Dispose Product */}
                            <button
                              onClick={() => setDeleteProductTarget(item)}
                              title="Dispose / Delete Product"
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

        {/* ==================== VIEW EXPIRED PRODUCT MODAL ==================== */}
        {viewProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-orange-100 text-[#FE9F43] rounded-xl">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Product Expiry Details</h3>
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
                        getExpiryInfo(viewProduct.expiredDate).badgeClass
                      }`}
                    >
                      {getExpiryInfo(viewProduct.expiredDate).label}
                    </span>
                    <h2 className="text-base font-bold text-gray-900">{viewProduct.name}</h2>
                    <p className="text-xs text-gray-500">
                      Category: {viewProduct.category?.name || "General"} | Brand: {viewProduct.brand?.name || "Standard"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Stock Quantity</p>
                    <p className="text-base font-bold text-gray-900">
                      {viewProduct.stock} {viewProduct.unit?.shortName || "Pc"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Total Lost Value</p>
                    <p className="text-base font-bold text-rose-600">
                      ฿{((viewProduct.costPrice || 0) * (viewProduct.stock || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Manufactured Date:</span>
                    <span className="font-semibold text-gray-800">
                      {viewProduct.manufacturedDate
                        ? new Date(viewProduct.manufacturedDate).toLocaleDateString()
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expired Date:</span>
                    <span className="font-bold text-rose-600">
                      {viewProduct.expiredDate
                        ? new Date(viewProduct.expiredDate).toLocaleDateString()
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warehouse:</span>
                    <span className="font-semibold text-gray-800">
                      {viewProduct.warehouse?.name || "Central Warehouse"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Store:</span>
                    <span className="font-semibold text-gray-800">
                      {viewProduct.store?.name || "Main Store"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                <button
                  onClick={() => {
                    const target = viewProduct;
                    setViewProduct(null);
                    handleOpenEditDate(target);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                >
                  Edit Expiry Dates
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

        {/* ==================== QUICK EDIT DATE MODAL ==================== */}
        {editDateProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Update Expiry Dates</h3>
                    <p className="text-[11px] text-gray-500 truncate max-w-[220px]">{editDateProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditDateProduct(null)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDates} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Manufactured Date</label>
                  <input
                    type="date"
                    value={editMfgDate}
                    onChange={(e) => setEditMfgDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Expired Date</label>
                  <input
                    type="date"
                    value={editExpDate}
                    onChange={(e) => setEditExpDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-rose-600 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditDateProduct(null)}
                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center space-x-1"
                  >
                    {actionLoading && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Dates</span>
                  </button>
                </div>
              </form>
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
                <h3 className="text-base font-bold text-gray-900">Dispose & Delete Expired Product?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to write-off and remove{" "}
                  <strong className="text-gray-900 font-bold">&quot;{deleteProductTarget.name}&quot;</strong> ({deleteProductTarget.sku})? This action cannot be undone.
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
                  <span>Dispose Item</span>
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
                  Dispose {selectedIds.length} Selected Expired Items?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  This will permanently write-off and remove all {selectedIds.length} selected items from inventory.
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
                  <span>Dispose All ({selectedIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

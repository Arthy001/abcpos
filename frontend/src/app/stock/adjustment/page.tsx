"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StockAdjustment, Product, Warehouse, Store } from "@/types";
import {
  fetchStockAdjustments,
  createStockAdjustmentApi,
  updateStockAdjustmentApi,
  deleteStockAdjustmentApi,
  fetchProducts,
  fetchWarehouses,
  fetchStores,
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
  SlidersHorizontal,
  Warehouse as WarehouseIcon,
  Store as StoreIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Minus,
  Calendar,
  User,
} from "lucide-react";

export default function StockAdjustmentPage() {
  const { user, isAdmin, canManageWarehouse } = useAuthStore();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
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

  // Modal State (Add / Edit)
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAdjustment, setEditingAdjustment] = useState<StockAdjustment | null>(null);
  const [formWarehouse, setFormWarehouse] = useState<string>("");
  const [formStore, setFormStore] = useState<string>("");
  const [formProductName, setFormProductName] = useState<string>("");
  const [formProductImage, setFormProductImage] = useState<string>("");
  const [formPersonName, setFormPersonName] = useState<string>("James Kirwin");
  const [formQty, setFormQty] = useState<number>(1);
  const [formType, setFormType] = useState<"ADDITION" | "SUBTRACTION">("ADDITION");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal
  const [viewAdjustment, setViewAdjustment] = useState<StockAdjustment | null>(null);

  // Delete Confirmation Modal
  const [deletingAdjustment, setDeletingAdjustment] = useState<StockAdjustment | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [adjData, prodData, whData, stData] = await Promise.all([
        fetchStockAdjustments({
          warehouse: warehouseFilter,
          type: typeFilter,
          search,
        }),
        fetchProducts(),
        fetchWarehouses(),
        fetchStores(),
      ]);
      setAdjustments(adjData || []);
      setProducts(prodData || []);
      setWarehouses(whData || []);
      setStores(stData || []);

      // Smart Default: Auto-select user's warehouse filter if not Admin
      if (whData && user?.warehouseName && !isAdmin() && warehouseFilter === "all") {
        setWarehouseFilter(user.warehouseName);
      }
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Adjustments",
        message: err.message || "An error occurred while fetching stock adjustment history.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [warehouseFilter, typeFilter, search]);

  // Filtering
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(search.toLowerCase()) ||
        item.store.toLowerCase().includes(search.toLowerCase()) ||
        item.personName.toLowerCase().includes(search.toLowerCase());

      const matchesWh =
        warehouseFilter === "all" || item.warehouse === warehouseFilter;
      const matchesType =
        typeFilter === "all" || item.type === typeFilter;

      return matchesSearch && matchesWh && matchesType;
    });
  }, [adjustments, search, warehouseFilter, typeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAdjustments.length / pageSize) || 1;
  const paginatedAdjustments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdjustments.slice(start, start + pageSize);
  }, [filteredAdjustments, currentPage, pageSize]);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedAdjustments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAdjustments.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingAdjustment(null);
    setFormWarehouse(user?.warehouseName || (warehouses.length > 0 ? warehouses[0].name : "Lavish Warehouse"));
    setFormStore(user?.storeName || (stores.length > 0 ? stores[0].name : "ElectroMart Main"));
    setFormProductName(products.length > 0 ? products[0].name : "");
    setFormProductImage(products.length > 0 ? products[0].image || "" : "");
    setFormPersonName(user?.name || "James Kirwin");
    setFormQty(10);
    setFormType("ADDITION");
    setFormNotes("");
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (adj: StockAdjustment) => {
    if (!canManageWarehouse(adj.warehouse) && !isAdmin()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `You are assigned to "${user.warehouseName}". You do not have permission to edit adjustments in "${adj.warehouse}".`,
      });
      return;
    }
    setEditingAdjustment(adj);
    setFormWarehouse(adj.warehouse);
    setFormStore(adj.store);
    setFormProductName(adj.productName);
    setFormProductImage(adj.productImage || "");
    setFormPersonName(adj.personName);
    setFormQty(adj.qty);
    setFormType(adj.type);
    setFormNotes(adj.notes || "");
    setShowModal(true);
  };

  // Submit Add / Edit Form
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductName || !formWarehouse || !formStore) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please ensure Warehouse, Store, and Product are selected.",
      });
      return;
    }

    if (!canManageWarehouse(formWarehouse) && !isAdmin()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `You are assigned to "${user.warehouseName}". You cannot submit adjustments for "${formWarehouse}".`,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAdjustment) {
        await updateStockAdjustmentApi(editingAdjustment.id, {
          warehouse: formWarehouse,
          store: formStore,
          productName: formProductName,
          productImage: formProductImage,
          personName: formPersonName,
          qty: Number(formQty),
          type: formType,
          notes: formNotes,
        });

        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Adjustment Updated!",
          message: `Stock adjustment for "${formProductName}" has been successfully updated.`,
          itemName: formProductName,
        });
      } else {
        await createStockAdjustmentApi({
          warehouse: formWarehouse,
          store: formStore,
          productName: formProductName,
          productImage: formProductImage,
          personName: formPersonName,
          qty: Number(formQty),
          type: formType,
          notes: formNotes,
        });

        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Adjustment Created!",
          message: `Stock adjustment of ${formType === "ADDITION" ? "+" : "-"}${formQty} for "${formProductName}" recorded successfully.`,
          itemName: formProductName,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save stock adjustment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingAdjustment) return;
    const prodName = deletingAdjustment.productName;
    try {
      setIsDeleting(true);
      await deleteStockAdjustmentApi(deletingAdjustment.id);
      setDeletingAdjustment(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Adjustment Deleted!",
        message: `Adjustment record for "${prodName}" was removed and stock levels were recalculated.`,
        itemName: prodName,
      });
      loadData();
    } catch (err: any) {
      setDeletingAdjustment(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to delete adjustment record.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredAdjustments.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Warehouse", "Store", "Product", "Type", "Quantity", "Person", "Date", "Notes"];
    const rows = filteredAdjustments.map((a) => [
      `"${a.warehouse}"`,
      `"${a.store}"`,
      `"${a.productName.replace(/"/g, '""')}"`,
      a.type,
      a.qty,
      `"${a.personName}"`,
      new Date(a.date).toLocaleDateString(),
      `"${(a.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_adjustments_${new Date().toISOString().split("T")[0]}.csv`);
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Stock Adjustment</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage and record physical inventory count adjustments</p>
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

            {/* Excel Export */}
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

            {/* + Add Adjustment Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Adjustment</span>
            </button>
          </div>
        </div>

        {/* Stock Adjustment Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search adjustments..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center space-x-2">
              {/* Warehouse Filter */}
              <div className="w-48">
                <SearchableSelect
                  placeholder="All Warehouses"
                  value={warehouseFilter}
                  onChange={(val) => {
                    setWarehouseFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All Warehouses" },
                    ...warehouses.map((w) => ({ value: w.name, label: w.name })),
                  ]}
                />
              </div>

              {/* Type Filter */}
              <div className="w-40">
                <SearchableSelect
                  placeholder="All Types"
                  value={typeFilter}
                  onChange={(val) => {
                    setTypeFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All Types" },
                    { value: "ADDITION", label: "Addition (+)" },
                    { value: "SUBTRACTION", label: "Subtraction (-)" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedAdjustments.length > 0 && selectedIds.length === paginatedAdjustments.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Warehouse</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Store</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Product</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Person</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Type</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Qty</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading stock adjustments...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Package className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <p className="text-sm font-medium text-gray-500">No stock adjustments found</p>
                        <p className="text-xs text-gray-400">Click "+ Add Adjustment" to create your first adjustment</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedAdjustments.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isAdd = item.type === "ADDITION";

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

                        <td className="py-3.5 px-4 text-[#64748B]">{item.warehouse}</td>
                        <td className="py-3.5 px-4 text-[#64748B]">{item.store}</td>

                        {/* Product with Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.productImage || "/assets/images/product-01.jpg"}
                              alt={item.productName}
                              className="w-7 h-7 rounded object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                              }}
                            />
                            <span className="font-semibold text-[#1E293B] line-clamp-1">{item.productName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B]">
                          {new Date(item.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Person with Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                              {item.personName.slice(0, 1)}
                            </div>
                            <span className="text-[#334155]">{item.personName}</span>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAdd
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {isAdd ? "+ Addition" : "- Subtraction"}
                          </span>
                        </td>

                        {/* Qty */}
                        <td className="py-3.5 px-4">
                          <span className={`font-bold ${isAdd ? "text-emerald-600" : "text-rose-600"}`}>
                            {isAdd ? `+${item.qty}` : `-${item.qty}`}
                          </span>
                        </td>

                        {/* Actions: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View Button */}
                            <button
                              onClick={() => setViewAdjustment(item)}
                              title="View Details"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Adjustment"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete Button */}
                            <button
                              onClick={() => setDeletingAdjustment(item)}
                              title="Delete Adjustment Record"
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
              <span>Entries • Total {filteredAdjustments.length} records</span>
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
        {/* ADD / EDIT ADJUSTMENT MODAL */}
        {/* ========================================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingAdjustment ? "Edit Stock Adjustment" : "Add Stock Adjustment"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="space-y-3.5">
                {/* Product Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    placeholder="Select Product..."
                    value={formProductName}
                    onChange={(val) => {
                      setFormProductName(val);
                      const prod = products.find((p) => p.name === val);
                      if (prod) setFormProductImage(prod.image || "");
                    }}
                    options={products.map((p) => ({ value: p.name, label: `${p.name} (SKU: ${p.sku})` }))}
                  />
                </div>

                {/* Warehouse & Store */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Warehouse <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Warehouse..."
                      value={formWarehouse}
                      onChange={(val) => setFormWarehouse(val)}
                      options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Store <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Store..."
                      value={formStore}
                      onChange={(val) => setFormStore(val)}
                      options={stores.map((s) => ({ value: s.name, label: s.name }))}
                    />
                  </div>
                </div>

                {/* Adjustment Type & Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Adjustment Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormType("ADDITION")}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                          formType === "ADDITION"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Addition</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormType("SUBTRACTION")}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                          formType === "SUBTRACTION"
                            ? "border-rose-500 bg-rose-50 text-rose-700 shadow-xs"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Subtraction</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formQty}
                      onChange={(e) => setFormQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                {/* Responsible Person */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Responsible Person / Manager</label>
                  <input
                    type="text"
                    value={formPersonName}
                    onChange={(e) => setFormPersonName(e.target.value)}
                    placeholder="e.g. James Kirwin"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Notes / Reason for Adjustment</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Periodic stock count discrepancy, damaged item disposal..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : editingAdjustment ? "Update Adjustment" : "Record Adjustment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW ADJUSTMENT DETAILS MODAL */}
        {/* ========================================================================= */}
        {viewAdjustment && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Stock Adjustment Slip</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(viewAdjustment.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewAdjustment(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <img
                    src={viewAdjustment.productImage || "/assets/images/product-01.jpg"}
                    alt={viewAdjustment.productName}
                    className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{viewAdjustment.productName}</h4>
                    <span
                      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                        viewAdjustment.type === "ADDITION"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {viewAdjustment.type === "ADDITION" ? `+ ${viewAdjustment.qty} Units Added` : `- ${viewAdjustment.qty} Units Deducted`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Warehouse</span>
                    <p className="font-semibold text-gray-800">{viewAdjustment.warehouse}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Store</span>
                    <p className="font-semibold text-gray-800">{viewAdjustment.store}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Responsible Person</span>
                    <p className="font-semibold text-gray-800">{viewAdjustment.personName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Recorded Date</span>
                    <p className="font-semibold text-gray-800">
                      {new Date(viewAdjustment.date).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>

                {viewAdjustment.notes && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Adjustment Notes</span>
                    <p className="text-xs text-amber-900 leading-relaxed">{viewAdjustment.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setViewAdjustment(null)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION MODAL (STEP 1: ROSE TRASH) */}
        {/* ========================================================================= */}
        {deletingAdjustment && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <Trash2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Delete Adjustment Record?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to remove the adjustment for <span className="font-bold text-gray-800">"{deletingAdjustment.productName}"</span>? The product stock will be automatically reconciled.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingAdjustment(null)}
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

              <div className="pt-2 flex items-center justify-center space-x-2">
                {feedbackModal.type === "add_success" ? (
                  <>
                    <button
                      onClick={() => {
                        setFeedbackModal({ ...feedbackModal, isOpen: false });
                        handleOpenAddModal();
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


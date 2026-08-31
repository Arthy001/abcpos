"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StockTransfer, Warehouse } from "@/types";
import {
  fetchStockTransfers,
  createStockTransferApi,
  updateStockTransferApi,
  deleteStockTransferApi,
  fetchWarehouses,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
  Download,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Edit,
  Trash2,
  Eye,
  X,
  ArrowLeftRight,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Truck,
  FileCheck,
  Printer,
} from "lucide-react";

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [fromWarehouseFilter, setFromWarehouseFilter] = useState<string>("all");
  const [toWarehouseFilter, setToWarehouseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
  const [editingTransfer, setEditingTransfer] = useState<StockTransfer | null>(null);
  const [fromWh, setFromWh] = useState<string>("");
  const [toWh, setToWh] = useState<string>("");
  const [noOfProds, setNoOfProds] = useState<number>(1);
  const [qtyTransferred, setQtyTransferred] = useState<number>(1);
  const [refNum, setRefNum] = useState<string>("");
  const [formStatus, setFormStatus] = useState<"COMPLETED" | "PENDING" | "CANCELLED">("COMPLETED");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal
  const [viewTransfer, setViewTransfer] = useState<StockTransfer | null>(null);

  // Delete Confirmation Modal
  const [deletingTransfer, setDeletingTransfer] = useState<StockTransfer | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, whData] = await Promise.all([
        fetchStockTransfers({
          fromWarehouse: fromWarehouseFilter,
          toWarehouse: toWarehouseFilter,
          status: statusFilter,
          search,
        }),
        fetchWarehouses(),
      ]);
      setTransfers(tData || []);
      setWarehouses(whData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Transfers",
        message: err.message || "An error occurred while fetching stock transfer records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fromWarehouseFilter, toWarehouseFilter, statusFilter, search]);

  // Filtering
  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.refNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.fromWarehouse.toLowerCase().includes(search.toLowerCase()) ||
        item.toWarehouse.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesFrom =
        fromWarehouseFilter === "all" || item.fromWarehouse === fromWarehouseFilter;
      const matchesTo =
        toWarehouseFilter === "all" || item.toWarehouse === toWarehouseFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesFrom && matchesTo && matchesStatus;
    });
  }, [transfers, search, fromWarehouseFilter, toWarehouseFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransfers.length / pageSize) || 1;
  const paginatedTransfers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransfers.slice(start, start + pageSize);
  }, [filteredTransfers, currentPage, pageSize]);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedTransfers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTransfers.map((t) => t.id));
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
    setEditingTransfer(null);
    setFromWh(warehouses.length > 0 ? warehouses[0].name : "");
    setToWh(warehouses.length > 1 ? warehouses[1].name : "");
    setNoOfProds(1);
    setQtyTransferred(10);
    setRefNum(`#TR-${Math.floor(100000 + Math.random() * 900000)}`);
    setFormStatus("COMPLETED");
    setFormNotes("");
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (t: StockTransfer) => {
    setEditingTransfer(t);
    setFromWh(t.fromWarehouse);
    setToWh(t.toWarehouse);
    setNoOfProds(t.noOfProducts);
    setQtyTransferred(t.quantityTransferred);
    setRefNum(t.refNumber);
    setFormStatus(t.status || "COMPLETED");
    setFormNotes(t.notes || "");
    setShowModal(true);
  };

  // Save Transfer
  const handleSaveTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromWh || !toWh) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please select both Source and Destination Warehouses.",
      });
      return;
    }
    if (fromWh === toWh) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        message: "Source Warehouse and Destination Warehouse cannot be identical.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingTransfer) {
        await updateStockTransferApi(editingTransfer.id, {
          fromWarehouse: fromWh,
          toWarehouse: toWh,
          noOfProducts: Number(noOfProds),
          quantityTransferred: Number(qtyTransferred),
          refNumber: refNum,
          status: formStatus,
          notes: formNotes,
        });

        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Transfer Updated!",
          message: `Stock transfer "${refNum}" has been updated successfully.`,
          itemName: refNum,
        });
      } else {
        await createStockTransferApi({
          fromWarehouse: fromWh,
          toWarehouse: toWh,
          noOfProducts: Number(noOfProds),
          quantityTransferred: Number(qtyTransferred),
          refNumber: refNum,
          status: formStatus,
          notes: formNotes,
        });

        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Transfer Created!",
          message: `Stock transfer order "${refNum}" (${qtyTransferred} units from ${fromWh} to ${toWh}) has been recorded.`,
          itemName: refNum,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save stock transfer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingTransfer) return;
    const ref = deletingTransfer.refNumber;
    try {
      setIsDeleting(true);
      await deleteStockTransferApi(deletingTransfer.id);
      setDeletingTransfer(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Transfer Deleted!",
        message: `Stock transfer order "${ref}" has been deleted.`,
        itemName: ref,
      });
      loadData();
    } catch (err: any) {
      setDeletingTransfer(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to delete stock transfer.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredTransfers.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Reference", "From Warehouse", "To Warehouse", "No of Products", "Quantity Transferred", "Status", "Date", "Notes"];
    const rows = filteredTransfers.map((t) => [
      `"${t.refNumber}"`,
      `"${t.fromWarehouse}"`,
      `"${t.toWarehouse}"`,
      t.noOfProducts,
      t.quantityTransferred,
      t.status,
      new Date(t.date).toLocaleDateString(),
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_transfers_${new Date().toISOString().split("T")[0]}.csv`);
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Stock Transfer</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage and track transfers between multiple warehouses</p>
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

            {/* + Add New Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>

            {/* Import Transfer Button */}
            <button
              onClick={() => alert("CSV/Excel Import feature ready. Please upload a structured transfer spreadsheet.")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import Transfer</span>
            </button>
          </div>
        </div>

        {/* Stock Transfer Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & 3 Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder="Search reference, warehouse..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* From Warehouse Filter */}
              <div className="w-44">
                <SearchableSelect
                  placeholder="From Warehouse: All"
                  value={fromWarehouseFilter}
                  onChange={(val) => {
                    setFromWarehouseFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "From Warehouse: All" },
                    ...warehouses.map((w) => ({ value: w.name, label: w.name })),
                  ]}
                />
              </div>

              {/* To Warehouse Filter */}
              <div className="w-44">
                <SearchableSelect
                  placeholder="To Warehouse: All"
                  value={toWarehouseFilter}
                  onChange={(val) => {
                    setToWarehouseFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "To Warehouse: All" },
                    ...warehouses.map((w) => ({ value: w.name, label: w.name })),
                  ]}
                />
              </div>

              {/* Status Filter */}
              <div className="w-36">
                <SearchableSelect
                  placeholder="Status: All"
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "COMPLETED", label: "Completed" },
                    { value: "PENDING", label: "Pending" },
                    { value: "CANCELLED", label: "Cancelled" },
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
                      checked={paginatedTransfers.length > 0 && selectedIds.length === paginatedTransfers.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">From Warehouse</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">To Warehouse</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">No of Products</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Quantity Transferred</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Ref Number</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading stock transfer records...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Truck className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <p className="text-sm font-medium text-gray-500">No stock transfers found</p>
                        <p className="text-xs text-gray-400">Click "+ Add New" to create a warehouse stock transfer</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTransfers.map((item) => {
                    const isSelected = selectedIds.includes(item.id);

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

                        <td className="py-3.5 px-4 font-semibold text-[#1E293B]">
                          <div className="flex items-center space-x-1.5">
                            <WarehouseIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{item.fromWarehouse}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B]">
                          <div className="flex items-center space-x-1.5">
                            <WarehouseIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{item.toWarehouse}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B] font-medium">{item.noOfProducts}</td>

                        <td className="py-3.5 px-4 text-[#1E293B] font-bold">
                          {item.quantityTransferred} <span className="text-[10px] font-normal text-gray-400">units</span>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">{item.refNumber}</td>

                        <td className="py-3.5 px-4 text-[#64748B]">
                          {new Date(item.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {item.status || "COMPLETED"}
                          </span>
                        </td>

                        {/* Action Buttons: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View Button */}
                            <button
                              onClick={() => setViewTransfer(item)}
                              title="View Transfer Slip"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Transfer"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete Button */}
                            <button
                              onClick={() => setDeletingTransfer(item)}
                              title="Delete Transfer Record"
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
              <span>Entries • Total {filteredTransfers.length} transfers</span>
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
        {/* ADD / EDIT STOCK TRANSFER MODAL */}
        {/* ========================================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingTransfer ? "Edit Stock Transfer" : "Add Stock Transfer"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTransfer} className="space-y-3.5">
                {/* Source & Destination Warehouses */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      From Warehouse <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Warehouse..."
                      value={fromWh}
                      onChange={(val) => setFromWh(val)}
                      options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      To Warehouse <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Warehouse..."
                      value={toWh}
                      onChange={(val) => setToWh(val)}
                      options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
                    />
                  </div>
                </div>

                {/* Items & Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">No of Products</label>
                    <input
                      type="number"
                      min={1}
                      value={noOfProds}
                      onChange={(e) => setNoOfProds(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Total Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={qtyTransferred}
                      onChange={(e) => setQtyTransferred(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                {/* Reference Number & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Reference Number</label>
                    <input
                      type="text"
                      value={refNum}
                      onChange={(e) => setRefNum(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Transfer Status</label>
                    <SearchableSelect
                      placeholder="Select Status..."
                      value={formStatus}
                      onChange={(val) => setFormStatus(val as any)}
                      options={[
                        { value: "COMPLETED", label: "Completed" },
                        { value: "PENDING", label: "Pending" },
                        { value: "CANCELLED", label: "Cancelled" },
                      ]}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Transfer Notes / Tracking Info</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Dispatched via Express Logistics, driver contact..."
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
                    {isSubmitting ? "Saving..." : editingTransfer ? "Update Transfer" : "Create Transfer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW STOCK TRANSFER SLIP MODAL */}
        {/* ========================================================================= */}
        {viewTransfer && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Stock Transfer Slip</h3>
                    <p className="text-xs text-gray-400 font-mono">Ref: {viewTransfer.refNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewTransfer(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Visual Route */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Source Warehouse</span>
                    <p className="text-xs font-bold text-gray-800">{viewTransfer.fromWarehouse}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FE9F43] flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Destination</span>
                    <p className="text-xs font-bold text-gray-800">{viewTransfer.toWarehouse}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Quantity Transferred</span>
                    <p className="font-bold text-gray-900 text-sm">{viewTransfer.quantityTransferred} Units</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Product Lines</span>
                    <p className="font-bold text-gray-900 text-sm">{viewTransfer.noOfProducts} Items</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Transfer Date</span>
                    <p className="font-semibold text-gray-800">
                      {new Date(viewTransfer.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Status</span>
                    <div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          viewTransfer.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : viewTransfer.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {viewTransfer.status || "COMPLETED"}
                      </span>
                    </div>
                  </div>
                </div>

                {viewTransfer.notes && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Logistics & Notes</span>
                    <p className="text-xs text-blue-900 leading-relaxed">{viewTransfer.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 border border-gray-200 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewTransfer(null)}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
        {deletingTransfer && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <Trash2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Delete Transfer Record?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to remove transfer record <span className="font-bold text-gray-800 font-mono">"{deletingTransfer.refNumber}"</span>?
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingTransfer(null)}
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


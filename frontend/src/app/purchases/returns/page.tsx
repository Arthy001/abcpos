"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PurchaseReturn, Supplier, Product, Warehouse } from "@/types";
import {
  fetchPurchaseReturns,
  createPurchaseReturnApi,
  updatePurchaseReturnApi,
  deletePurchaseReturnApi,
  fetchSuppliers,
  fetchProducts,
  fetchWarehouses,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PlusCircle,
  Download,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  X,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Undo2,
  ReceiptText,
} from "lucide-react";

export default function PurchaseReturnsPage() {
  const { user, isAdmin, canManageWarehouse } = useAuthStore();
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
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
  const [editingReturn, setEditingReturn] = useState<PurchaseReturn | null>(null);

  // Form Fields
  const [formSupplier, setFormSupplier] = useState<string>("");
  const [formWarehouse, setFormWarehouse] = useState<string>("Lavish Warehouse");
  const [formProduct, setFormProduct] = useState<string>("");
  const [formQty, setFormQty] = useState<number>(1);
  const [formReference, setFormReference] = useState<string>("");
  const [formPurchaseRef, setFormPurchaseRef] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formStatus, setFormStatus] = useState<"COMPLETED" | "PENDING" | "CANCELLED">("COMPLETED");
  const [formTotal, setFormTotal] = useState<number>(100);
  const [formPaid, setFormPaid] = useState<number>(100);
  const [formPaymentStatus, setFormPaymentStatus] = useState<"PAID" | "UNPAID" | "OVERDUE">("PAID");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal State
  const [viewReturn, setViewReturn] = useState<PurchaseReturn | null>(null);

  // Delete Confirmation State
  const [deletingReturn, setDeletingReturn] = useState<PurchaseReturn | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, sData, pData, wData] = await Promise.all([
        fetchPurchaseReturns({
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          search,
        }),
        fetchSuppliers(),
        fetchProducts(),
        fetchWarehouses(),
      ]);
      setReturns(rData || []);
      setSuppliers(sData || []);
      setProducts(pData || []);
      setWarehouses(wData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Returns",
        message: err.message || "An error occurred while fetching purchase returns.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, paymentStatusFilter, search]);

  // Filtering
  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.reference.toLowerCase().includes(search.toLowerCase()) ||
        (item.purchaseReference && item.purchaseReference.toLowerCase().includes(search.toLowerCase())) ||
        item.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        (item.productName && item.productName.toLowerCase().includes(search.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || item.status.toUpperCase() === statusFilter.toUpperCase();
      const matchesPayment =
        paymentStatusFilter === "all" ||
        item.paymentStatus.toUpperCase() === paymentStatusFilter.toUpperCase();
      const matchesSupplier =
        supplierFilter === "all" || item.supplierName === supplierFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesSupplier;
    });
  }, [returns, search, statusFilter, paymentStatusFilter, supplierFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReturns.length / pageSize) || 1;
  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReturns.slice(start, start + pageSize);
  }, [filteredReturns, currentPage, pageSize]);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedReturns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedReturns.map((r) => r.id));
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
    setEditingReturn(null);
    setFormSupplier(suppliers.length > 0 ? suppliers[0].name : "");
    setFormWarehouse(user?.warehouseName || (warehouses.length > 0 ? warehouses[0].name : "Lavish Warehouse"));
    if (products.length > 0) {
      setFormProduct(products[0].name);
      setFormTotal(products[0].costPrice ? products[0].costPrice * 2 : 200);
      setFormPaid(products[0].costPrice ? products[0].costPrice * 2 : 200);
    } else {
      setFormProduct("");
      setFormTotal(100);
      setFormPaid(100);
    }
    setFormQty(2);
    setFormReference(`PR${Math.floor(100 + Math.random() * 900)}`);
    setFormPurchaseRef(`PT${Math.floor(100 + Math.random() * 900)}`);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStatus("COMPLETED");
    setFormPaymentStatus("PAID");
    setFormNotes("Damaged packaging / product defect on delivery");
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (r: PurchaseReturn) => {
    if (r.warehouseName && !canManageWarehouse(r.warehouseName) && !isAdmin()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `คุณสังกัดคลัง "${user?.warehouseName}" ไม่ได้รับอนุญาตให้แก้ไขใบคืนสินค้าของคลัง "${r.warehouseName}"`,
      });
      return;
    }

    setEditingReturn(r);
    setFormSupplier(r.supplierName);
    setFormWarehouse(r.warehouseName || (user?.warehouseName || "Lavish Warehouse"));
    setFormProduct(r.productName || "");
    setFormQty(r.quantity || 1);
    setFormReference(r.reference);
    setFormPurchaseRef(r.purchaseReference || "");
    setFormDate(new Date(r.date).toISOString().split("T")[0]);
    setFormStatus((r.status as any) || "COMPLETED");
    setFormTotal(r.totalAmount || 0);
    setFormPaid(r.paidAmount || 0);
    setFormPaymentStatus((r.paymentStatus as any) || "PAID");
    setFormNotes(r.notes || "");
    setShowModal(true);
  };

  // Save Purchase Return
  const handleSaveReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplier) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please select a Supplier.",
      });
      return;
    }

    if (!canManageWarehouse(formWarehouse) && !isAdmin()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `คุณสังกัดคลัง "${user?.warehouseName}" ไม่ได้รับอนุญาตให้ทำรายการของคลัง "${formWarehouse}"`,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const prod = products.find((p) => p.name === formProduct);
      const due = Math.max(0, formTotal - formPaid);

      const payload = {
        reference: formReference,
        purchaseReference: formPurchaseRef,
        supplierName: formSupplier,
        warehouseName: formWarehouse,
        productName: formProduct,
        productImage: prod?.image || "/assets/images/product-01.jpg",
        quantity: Number(formQty),
        date: formDate,
        status: formStatus,
        totalAmount: Number(formTotal),
        paidAmount: Number(formPaid),
        dueAmount: due,
        paymentStatus: formPaymentStatus,
        notes: formNotes,
      };

      if (editingReturn) {
        await updatePurchaseReturnApi(editingReturn.id, payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Return Updated!",
          message: `Purchase return record "${formReference}" has been updated.`,
          itemName: formReference,
        });
      } else {
        await createPurchaseReturnApi(payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Return Created!",
          message: `Purchase return "${formReference}" (${formQty} units of ${formProduct}) has been submitted and inventory stock updated.`,
          itemName: formReference,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save purchase return.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingReturn) return;
    const ref = deletingReturn.reference;
    try {
      setIsDeleting(true);
      await deletePurchaseReturnApi(deletingReturn.id);
      setDeletingReturn(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Return Record Deleted!",
        message: `Purchase return "${ref}" has been deleted.`,
        itemName: ref,
      });
      loadData();
    } catch (err: any) {
      setDeletingReturn(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to delete return record.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredReturns.length === 0) {
      alert("No return data available to export.");
      return;
    }
    const headers = ["Reference", "Purchase Ref", "Product", "Supplier", "Warehouse", "Date", "Status", "Total", "Refunded", "Due", "Payment Status"];
    const rows = filteredReturns.map((r) => [
      `"${r.reference}"`,
      `"${r.purchaseReference || "N/A"}"`,
      `"${r.productName || "N/A"}"`,
      `"${r.supplierName}"`,
      `"${r.warehouseName || "N/A"}"`,
      new Date(r.date).toLocaleDateString(),
      r.status,
      `$${r.totalAmount.toFixed(2)}`,
      `$${r.paidAmount.toFixed(2)}`,
      `$${r.dueAmount.toFixed(2)}`,
      r.paymentStatus,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchase_returns_${new Date().toISOString().split("T")[0]}.csv`);
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Purchase Returns</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage goods returned to suppliers and debit vouchers</p>
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

            {/* + Add Return Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Return</span>
            </button>

            {/* Import Button */}
            <button
              onClick={() => alert("CSV/Excel Import feature ready. Please upload a structured return spreadsheet.")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import Returns</span>
            </button>
          </div>
        </div>

        {/* Returns Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & 3 Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder="Search reference, product, supplier..."
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
              {/* Supplier Filter */}
              <div className="w-44">
                <SearchableSelect
                  placeholder="Supplier: All"
                  value={supplierFilter}
                  onChange={(val) => {
                    setSupplierFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Supplier: All" },
                    ...suppliers.map((s) => ({ value: s.name, label: s.name })),
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

              {/* Payment Status Filter */}
              <div className="w-36">
                <SearchableSelect
                  placeholder="Payment: All"
                  value={paymentStatusFilter}
                  onChange={(val) => {
                    setPaymentStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Payment: All" },
                    { value: "PAID", label: "Paid" },
                    { value: "UNPAID", label: "Unpaid" },
                    { value: "OVERDUE", label: "Overdue" },
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
                      checked={paginatedReturns.length > 0 && selectedIds.length === paginatedReturns.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Product</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Supplier</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Grand Total</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Refunded</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Due</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Payment Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading purchase returns...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedReturns.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Undo2 className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <p className="text-sm font-medium text-gray-500">No purchase returns recorded</p>
                        <p className="text-xs text-gray-400">Click "+ Add Return" to create a return note to supplier</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedReturns.map((item) => {
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
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <span className="truncate max-w-[140px] block">{item.productName || "General Return"}</span>
                              <span className="text-[10px] text-gray-400 font-normal">Qty: {item.quantity || 1} units</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B]">
                          {new Date(item.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-[#1E293B] font-medium">{item.supplierName}</td>

                        <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">{item.reference}</td>

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

                        <td className="py-3.5 px-4 font-bold text-[#1E293B]">${item.totalAmount.toFixed(2)}</td>

                        <td className="py-3.5 px-4 font-medium text-emerald-600">${item.paidAmount.toFixed(2)}</td>

                        <td className="py-3.5 px-4 font-medium text-rose-600">${item.dueAmount.toFixed(2)}</td>

                        {/* Payment Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.paymentStatus === "UNPAID"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {item.paymentStatus || "PAID"}
                          </span>
                        </td>

                        {/* Action Buttons: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View Button */}
                            <button
                              onClick={() => setViewReturn(item)}
                              title="View Return Debit Slip"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Return"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete Button */}
                            <button
                              onClick={() => {
                                if (item.warehouseName && !canManageWarehouse(item.warehouseName) && !isAdmin()) {
                                  setFeedbackModal({
                                    isOpen: true,
                                    type: "error",
                                    title: "Permission Denied (สิทธิ์การจัดการคลัง)",
                                    message: `คุณสังกัดคลัง "${user?.warehouseName}" ไม่ได้รับอนุญาตให้ลบใบคืนสินค้าของคลัง "${item.warehouseName}"`,
                                  });
                                  return;
                                }
                                setDeletingReturn(item);
                              }}
                              title="Delete Return Record"
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
              <span>Entries • Total {filteredReturns.length} returns</span>
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
        {/* ADD / EDIT PURCHASE RETURN MODAL */}
        {/* ========================================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Undo2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingReturn ? "Edit Purchase Return" : "Add Purchase Return"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReturn} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Supplier..."
                      value={formSupplier}
                      onChange={(val) => setFormSupplier(val)}
                      options={suppliers.map((s) => ({ value: s.name, label: s.name }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">Warehouse</label>
                      {!isAdmin() && user?.warehouseName && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          คลังที่สังกัด
                        </span>
                      )}
                    </div>
                    <SearchableSelect
                      placeholder="Select Warehouse..."
                      value={formWarehouse}
                      onChange={(val) => {
                        if (!canManageWarehouse(val) && !isAdmin()) {
                          setFeedbackModal({
                            isOpen: true,
                            type: "error",
                            title: "Permission Denied (สิทธิ์การจัดการคลัง)",
                            message: `คุณสังกัดคลัง "${user?.warehouseName}" สามารถทำรายการได้เฉพาะคลังของตนเองเท่านั้น`,
                          });
                          return;
                        }
                        setFormWarehouse(val);
                      }}
                      options={
                        !isAdmin() && user?.warehouseName
                          ? [{ value: user.warehouseName, label: `${user.warehouseName} (คลังที่คุณรับผิดชอบ)` }]
                          : warehouses.map((w) => ({ value: w.name, label: w.name }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Product Item to Return</label>
                  <SearchableSelect
                    placeholder="Select Product..."
                    value={formProduct}
                    onChange={(val) => {
                      setFormProduct(val);
                      const prod = products.find((p) => p.name === val);
                      if (prod && prod.costPrice) {
                        setFormTotal(prod.costPrice * formQty);
                        setFormPaid(prod.costPrice * formQty);
                      }
                    }}
                    options={products.map((p) => ({ value: p.name, label: `${p.name} (${p.sku})` }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formQty}
                      onChange={(e) => {
                        const q = Number(e.target.value);
                        setFormQty(q);
                        const prod = products.find((p) => p.name === formProduct);
                        if (prod && prod.costPrice) {
                          setFormTotal(prod.costPrice * q);
                          setFormPaid(prod.costPrice * q);
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Refund Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      value={formTotal}
                      onChange={(e) => setFormTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Paid / Refunded ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      value={formPaid}
                      onChange={(e) => setFormPaid(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Return Status</label>
                    <SearchableSelect
                      placeholder="Select Status..."
                      value={formStatus}
                      onChange={(val) => setFormStatus(val as any)}
                      options={[
                        { value: "COMPLETED", label: "Completed (Stock Deducted)" },
                        { value: "PENDING", label: "Pending" },
                        { value: "CANCELLED", label: "Cancelled" },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Payment Status</label>
                    <SearchableSelect
                      placeholder="Select Payment..."
                      value={formPaymentStatus}
                      onChange={(val) => setFormPaymentStatus(val as any)}
                      options={[
                        { value: "PAID", label: "Paid" },
                        { value: "UNPAID", label: "Unpaid" },
                        { value: "OVERDUE", label: "Overdue" },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Return Reason / Notes</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Defective unit, cracked screen, wrong item model sent..."
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
                    {isSubmitting ? "Saving..." : editingReturn ? "Update Return" : "Create Return"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW RETURN DEBIT SLIP MODAL */}
        {/* ========================================================================= */}
        {viewReturn && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <ReceiptText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Purchase Return Slip</h3>
                    <p className="text-xs text-gray-400 font-mono">Ref: {viewReturn.reference}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewReturn(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Supplier</span>
                    <p className="font-bold text-gray-800">{viewReturn.supplierName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Warehouse</span>
                    <p className="font-semibold text-gray-800">{viewReturn.warehouseName || "Lavish Warehouse"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Product Returned</span>
                    <p className="font-bold text-gray-900">{viewReturn.productName || "General Items"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Quantity Returned</span>
                    <p className="font-bold text-gray-900">{viewReturn.quantity} Units</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Refund Amount</span>
                    <p className="font-bold text-[#FE9F43] text-sm">${viewReturn.totalAmount.toFixed(2)}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Status</span>
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {viewReturn.status}
                      </span>
                    </div>
                  </div>
                </div>

                {viewReturn.notes && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Return Reason</span>
                    <p className="text-xs text-blue-900 leading-relaxed">{viewReturn.notes}</p>
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
                  onClick={() => setViewReturn(null)}
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
        {deletingReturn && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <Trash2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Delete Return Record?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to remove purchase return record <span className="font-bold text-gray-800 font-mono">"{deletingReturn.reference}"</span>?
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingReturn(null)}
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

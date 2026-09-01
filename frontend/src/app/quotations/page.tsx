"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Quotation, Customer, Product } from "@/types";
import {
  fetchQuotations,
  createQuotationApi,
  updateQuotationApi,
  deleteQuotationApi,
  convertQuotationToSaleApi,
  fetchCustomers,
  fetchProducts,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
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
  Receipt,
  ShoppingCart,
  Send,
  ArrowRightCircle,
} from "lucide-react";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters
  const [search, setSearch] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
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

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // Form Fields
  const [formReference, setFormReference] = useState<string>("");
  const [formCustomer, setFormCustomer] = useState<string>("");
  const [formProduct, setFormProduct] = useState<string>("");
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnitPrice, setFormUnitPrice] = useState<number>(0);
  const [formTax, setFormTax] = useState<number>(0);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<"SENT" | "ORDERED" | "PENDING">("SENT");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Slip State
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);

  // Delete State
  const [deletingQuotation, setDeletingQuotation] = useState<Quotation | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Converting to Sale State
  const [convertingQuotation, setConvertingQuotation] = useState<Quotation | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qData, cData, pData] = await Promise.all([
        fetchQuotations({
          status: statusFilter,
          search,
        }),
        fetchCustomers(),
        fetchProducts(),
      ]);
      setQuotations(qData || []);
      setCustomers(cData || []);
      setProducts(pData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Quotations",
        message: err.message || "An error occurred while fetching quotations.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  // Filtering
  const filteredQuotations = useMemo(() => {
    return quotations.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.reference.toLowerCase().includes(search.toLowerCase()) ||
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesCustomer =
        customerFilter === "all" || item.customerName === customerFilter;
      const matchesProduct =
        productFilter === "all" || item.productName === productFilter;
      const matchesStatus =
        statusFilter === "all" || item.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesCustomer && matchesProduct && matchesStatus;
    });
  }, [quotations, search, customerFilter, productFilter, statusFilter]);

  // Total Calculation for form
  const formCalculatedTotal = useMemo(() => {
    const sub = formQuantity * formUnitPrice;
    return Math.max(0, sub + formTax - formDiscount);
  }, [formQuantity, formUnitPrice, formTax, formDiscount]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuotations.length / pageSize) || 1;
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuotations.slice(start, start + pageSize);
  }, [filteredQuotations, currentPage, pageSize]);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedQuotations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedQuotations.map((q) => q.id));
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
    setEditingQuotation(null);
    setFormReference(`QT${Math.floor(100 + Math.random() * 900)}`);
    setFormCustomer(customers.length > 0 ? customers[0].name : "Carl Evans");
    const prod = products.length > 0 ? products[0] : null;
    setFormProduct(prod ? prod.name : "Lenovo 3rd Generation");
    setFormQuantity(1);
    setFormUnitPrice(prod ? prod.price || 550 : 550);
    setFormTax(0);
    setFormDiscount(0);
    setFormStatus("SENT");
    setFormNotes("");
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (q: Quotation) => {
    setEditingQuotation(q);
    setFormReference(q.reference);
    setFormCustomer(q.customerName);
    setFormProduct(q.productName);
    setFormQuantity(q.quantity || 1);
    setFormUnitPrice(q.unitPrice || 0);
    setFormTax(q.tax || 0);
    setFormDiscount(q.discount || 0);
    setFormStatus(q.status as any);
    setFormNotes(q.notes || "");
    setShowModal(true);
  };

  // Product Selection auto-fills price
  const handleProductChange = (prodName: string) => {
    setFormProduct(prodName);
    const prod = products.find((p) => p.name === prodName);
    if (prod && prod.price) {
      setFormUnitPrice(prod.price);
    }
  };

  // Save Quotation
  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer || !formProduct) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please select both a Customer and a Product.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const cust = customers.find((c) => c.name === formCustomer);
      const prod = products.find((p) => p.name === formProduct);

      const payload = {
        reference: formReference,
        customerId: cust ? cust.id : null,
        customerName: formCustomer,
        customerAvatar: cust?.avatar || "/assets/images/avatar-01.jpg",
        productId: prod ? prod.id : null,
        productName: formProduct,
        productImage: prod?.image || "/assets/images/product-01.jpg",
        quantity: Number(formQuantity),
        unitPrice: Number(formUnitPrice),
        tax: Number(formTax),
        discount: Number(formDiscount),
        total: Number(formCalculatedTotal),
        status: formStatus,
        notes: formNotes,
      };

      if (editingQuotation) {
        await updateQuotationApi(editingQuotation.id, payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Quotation Updated!",
          message: `Quotation "${formReference}" has been updated successfully.`,
          itemName: formReference,
        });
      } else {
        await createQuotationApi(payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Quotation Created!",
          message: `Quotation "${formReference}" has been sent to customer ${formCustomer}.`,
          itemName: formReference,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save quotation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert Quotation to Live Sale
  const handleConvertQuotation = async () => {
    if (!convertingQuotation) return;
    try {
      setIsConverting(true);
      const res = await convertQuotationToSaleApi(convertingQuotation.id);
      setConvertingQuotation(null);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Quotation Converted to Order!",
        message: res.message || `Quotation ${convertingQuotation.reference} has been converted into a live Sale and stock deducted.`,
      });
      loadData();
    } catch (err: any) {
      setConvertingQuotation(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Conversion Failed",
        message: err.message || "Failed to convert quotation to sale.",
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingQuotation) return;
    const ref = deletingQuotation.reference;
    try {
      setIsDeleting(true);
      await deleteQuotationApi(deletingQuotation.id);
      setDeletingQuotation(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Quotation Deleted!",
        message: `Quotation "${ref}" has been removed.`,
        itemName: ref,
      });
      loadData();
    } catch (err: any) {
      setDeletingQuotation(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to delete quotation.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredQuotations.length === 0) {
      alert("No quotations data available to export.");
      return;
    }
    const headers = ["Reference", "Product", "Customer", "Unit Price", "Qty", "Total", "Status"];
    const rows = filteredQuotations.map((q) => [
      `"${q.reference}"`,
      `"${q.productName}"`,
      `"${q.customerName}"`,
      `$${q.unitPrice.toFixed(2)}`,
      q.quantity,
      `$${q.total.toFixed(2)}`,
      q.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quotations_${new Date().toISOString().split("T")[0]}.csv`);
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Quotations</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage customer quotations, price proposals and order conversions</p>
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

            {/* + Add Quotation Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Quotation</span>
            </button>
          </div>
        </div>

        {/* Quotations Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder="Search reference, product, customer..."
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
              {/* Product Filter */}
              <div className="w-44">
                <SearchableSelect
                  placeholder="Product: All"
                  value={productFilter}
                  onChange={(val) => {
                    setProductFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Product: All" },
                    ...products.map((p) => ({ value: p.name, label: p.name })),
                  ]}
                />
              </div>

              {/* Customer Filter */}
              <div className="w-40">
                <SearchableSelect
                  placeholder="Customer: All"
                  value={customerFilter}
                  onChange={(val) => {
                    setCustomerFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Customer: All" },
                    ...customers.map((c) => ({ value: c.name, label: c.name })),
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
                    { value: "SENT", label: "Sent" },
                    { value: "ORDERED", label: "Ordered" },
                    { value: "PENDING", label: "Pending" },
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
                      checked={paginatedQuotations.length > 0 && selectedIds.length === paginatedQuotations.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Product Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Customer Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Unit Price</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Quantity</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total Amount</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading quotations...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Send className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <p className="text-sm font-medium text-gray-500">No quotations found</p>
                        <p className="text-xs text-gray-400">Click "+ Add Quotation" to create customer price proposals</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedQuotations.map((item) => {
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

                        {/* Product */}
                        <td className="py-3.5 px-4 font-semibold text-[#1E293B]">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={item.productImage || "/assets/images/product-01.jpg"}
                              alt={item.productName}
                              className="w-7 h-7 rounded-lg object-cover bg-gray-100"
                            />
                            <span className="truncate max-w-[150px]">{item.productName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">{item.reference}</td>

                        {/* Customer */}
                        <td className="py-3.5 px-4 font-semibold text-[#1E293B]">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={item.customerAvatar || "/assets/images/avatar-01.jpg"}
                              alt={item.customerName}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200"
                            />
                            <span className="truncate max-w-[130px]">{item.customerName}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "ORDERED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.status === "SENT"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {item.status || "SENT"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B]">${item.unitPrice.toFixed(2)}</td>

                        <td className="py-3.5 px-4 text-[#1E293B] font-bold">{item.quantity}</td>

                        <td className="py-3.5 px-4 font-bold text-[#1E293B]">${item.total.toFixed(2)}</td>

                        {/* Action Buttons: Convert (ShoppingCart) -> View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Convert to Sale Button */}
                            {item.status !== "ORDERED" && (
                              <button
                                onClick={() => setConvertingQuotation(item)}
                                title="Convert to Order"
                                className="w-7 h-7 rounded border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* 1. View Button */}
                            <button
                              onClick={() => setViewQuotation(item)}
                              title="View Quotation Slip"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Quotation"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete Button */}
                            <button
                              onClick={() => setDeletingQuotation(item)}
                              title="Delete Quotation"
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
              <span>Entries • Total {filteredQuotations.length} quotations</span>
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
        {/* ADD / EDIT QUOTATION MODAL */}
        {/* ========================================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingQuotation ? `Edit Quotation (${editingQuotation.reference})` : "Create Quotation"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveQuotation} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Quotation Ref</label>
                    <input
                      type="text"
                      value={formReference}
                      onChange={(e) => setFormReference(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Customer *</label>
                    <SearchableSelect
                      placeholder="Select Customer..."
                      value={formCustomer}
                      onChange={(val) => setFormCustomer(val)}
                      options={customers.map((c) => ({ value: c.name, label: c.name }))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Product Item *</label>
                  <SearchableSelect
                    placeholder="Select Product..."
                    value={formProduct}
                    onChange={(val) => handleProductChange(val)}
                    options={products.map((p) => ({ value: p.name, label: `${p.name} ($${p.price})` }))}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formUnitPrice}
                      onChange={(e) => setFormUnitPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Tax ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formTax}
                      onChange={(e) => setFormTax(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Discount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Status</label>
                  <SearchableSelect
                    placeholder="Select Status..."
                    value={formStatus}
                    onChange={(val) => setFormStatus(val as any)}
                    options={[
                      { value: "SENT", label: "Sent" },
                      { value: "ORDERED", label: "Ordered" },
                      { value: "PENDING", label: "Pending" },
                    ]}
                  />
                </div>

                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Calculated Total:</span>
                  <span className="text-base font-bold text-[#FE9F43]">${formCalculatedTotal.toFixed(2)}</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Notes / Terms</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Quotation validity, terms & conditions..."
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
                    {isSubmitting ? "Saving..." : editingQuotation ? "Update Quotation" : "Send Quotation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW QUOTATION SLIP MODAL */}
        {/* ========================================================================= */}
        {viewQuotation && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Price Quotation Slip</h3>
                    <p className="text-xs text-gray-400 font-mono">Ref: {viewQuotation.reference}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewQuotation(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 font-medium">Customer</span>
                    <p className="font-bold text-gray-800">{viewQuotation.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Status</span>
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {viewQuotation.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-gray-400">Quoted Item:</span>
                  <p className="font-bold text-gray-900 text-sm">
                    {viewQuotation.productName} × {viewQuotation.quantity} @ ${viewQuotation.unitPrice.toFixed(2)}
                  </p>
                  {viewQuotation.notes && (
                    <p className="text-gray-500 text-xs italic mt-1">Notes: "{viewQuotation.notes}"</p>
                  )}
                </div>

                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 space-y-1.5">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-900">Total Quotation:</span>
                    <span className="text-[#FE9F43]">${viewQuotation.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 border border-gray-200 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Quotation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewQuotation(null)}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CONVERT QUOTATION TO ORDER CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {convertingQuotation && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-emerald-100">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <ShoppingCart className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Convert to Sales Order?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Convert Quotation <span className="font-bold text-gray-800 font-mono">"{convertingQuotation.reference}"</span> for <span className="font-bold text-gray-800">{convertingQuotation.customerName}</span> into a live completed Sale and automatically deduct inventory stock?
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertingQuotation(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isConverting}
                  onClick={handleConvertQuotation}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  {isConverting ? "Converting..." : "Convert Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION MODAL (STEP 1: ROSE TRASH) */}
        {/* ========================================================================= */}
        {deletingQuotation && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <Trash2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Delete Quotation?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to remove quotation <span className="font-bold text-gray-800 font-mono">"{deletingQuotation.reference}"</span>?
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingQuotation(null)}
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

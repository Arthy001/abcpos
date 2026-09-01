"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sale, SaleItem, Customer, Product, Warehouse, Store } from "@/types";
import {
  fetchSales,
  createSaleApi,
  updateSaleApi,
  deleteSaleApi,
  fetchCustomers,
  fetchProducts,
  fetchWarehouses,
  fetchStores,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
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
  Receipt,
  ShoppingCart,
  Trash,
} from "lucide-react";

interface SalesOrderTemplateProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const SalesOrderTemplate: React.FC<SalesOrderTemplateProps> = ({
  pageTitle = "Sales List",
  pageSubtitle = "Manage sales orders, customer invoices and transactions",
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters
  const [search, setSearch] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
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
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  // Form Fields
  const [formCustomer, setFormCustomer] = useState<string>("");
  const [formBiller, setFormBiller] = useState<string>("Admin");
  const [formStore, setFormStore] = useState<string>("Electro Mart");
  const [formWarehouse, setFormWarehouse] = useState<string>("Lavish Warehouse");
  const [formReference, setFormReference] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formStatus, setFormStatus] = useState<"COMPLETED" | "PENDING" | "ORDERED" | "CANCELLED">("COMPLETED");
  const [formPaymentStatus, setFormPaymentStatus] = useState<"PAID" | "UNPAID" | "OVERDUE" | "PARTIAL">("PAID");
  const [formPaymentMethod, setFormPaymentMethod] = useState<"CASH" | "CREDIT_CARD" | "PROMPTPAY" | "BANK_TRANSFER">("CASH");
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formShipping, setFormShipping] = useState<number>(0);
  const [formTaxRate, setFormTaxRate] = useState<number>(7);
  const [formPaid, setFormPaid] = useState<number>(0);
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Multi-item Lines for Sale
  const [saleItems, setSaleItems] = useState<
    Array<{
      productId: string | null;
      productName: string;
      productImage: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>
  >([]);

  // Selected Product to add to line
  const [selectedAddProduct, setSelectedAddProduct] = useState<string>("");

  // View Invoice Slip State
  const [viewSale, setViewSale] = useState<Sale | null>(null);

  // Delete Confirmation State
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, cData, pData, wData, stData] = await Promise.all([
        fetchSales({
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          search,
        }),
        fetchCustomers(),
        fetchProducts(),
        fetchWarehouses(),
        fetchStores(),
      ]);
      setSales(sData || []);
      setCustomers(cData || []);
      setProducts(pData || []);
      setWarehouses(wData || []);
      setStores(stData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Sales",
        message: err.message || "An error occurred while fetching sales.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, paymentStatusFilter, search]);

  // Filtering
  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.reference.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (item.billerName && item.billerName.toLowerCase().includes(search.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesCustomer =
        customerFilter === "all" || item.customerName === customerFilter;
      const matchesStatus =
        statusFilter === "all" || item.status.toUpperCase() === statusFilter.toUpperCase();
      const matchesPayment =
        paymentStatusFilter === "all" ||
        item.paymentStatus.toUpperCase() === paymentStatusFilter.toUpperCase();

      return matchesSearch && matchesCustomer && matchesStatus && matchesPayment;
    });
  }, [sales, search, customerFilter, statusFilter, paymentStatusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage, pageSize]);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedSales.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedSales.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Calculations for Add/Edit Form
  const formSubtotal = useMemo(() => {
    return saleItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  }, [saleItems]);

  const formTaxAmount = useMemo(() => {
    return (formSubtotal * formTaxRate) / 100;
  }, [formSubtotal, formTaxRate]);

  const formGrandTotal = useMemo(() => {
    return Math.max(0, formSubtotal + formTaxAmount + formShipping - formDiscount);
  }, [formSubtotal, formTaxAmount, formShipping, formDiscount]);

  const formDue = useMemo(() => {
    return Math.max(0, formGrandTotal - formPaid);
  }, [formGrandTotal, formPaid]);

  // Add Item to Line
  const handleAddItemToLine = (productName: string) => {
    if (!productName) return;
    const prod = products.find((p) => p.name === productName);
    if (!prod) return;

    const existingIndex = saleItems.findIndex((it) => it.productName === productName);
    if (existingIndex >= 0) {
      const updated = [...saleItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setSaleItems(updated);
    } else {
      const price = prod.price || 100;
      setSaleItems([
        ...saleItems,
        {
          productId: prod.id,
          productName: prod.name,
          productImage: prod.image || "/assets/images/product-01.jpg",
          sku: prod.sku || "SKU-001",
          quantity: 1,
          unitPrice: price,
          subtotal: price,
        },
      ]);
    }
    setSelectedAddProduct("");
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleUpdateItemQty = (index: number, qty: number) => {
    const updated = [...saleItems];
    updated[index].quantity = Math.max(1, qty);
    updated[index].subtotal = updated[index].quantity * updated[index].unitPrice;
    setSaleItems(updated);
  };

  const handleUpdateItemPrice = (index: number, price: number) => {
    const updated = [...saleItems];
    updated[index].unitPrice = Math.max(0, price);
    updated[index].subtotal = updated[index].quantity * updated[index].unitPrice;
    setSaleItems(updated);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSale(null);
    setFormCustomer(customers.length > 0 ? customers[0].name : "Walk-in Customer");
    setFormBiller("Admin");
    setFormStore(stores.length > 0 ? stores[0].name : "Electro Mart");
    setFormWarehouse(warehouses.length > 0 ? warehouses[0].name : "Lavish Warehouse");
    setFormReference(`SL${Math.floor(100 + Math.random() * 900)}`);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStatus("COMPLETED");
    setFormPaymentStatus("PAID");
    setFormPaymentMethod("CASH");
    setFormDiscount(0);
    setFormShipping(0);
    setFormTaxRate(7);
    setFormNotes("");

    // Initial item line
    if (products.length > 0) {
      const p = products[0];
      const price = p.price || 100;
      setSaleItems([
        {
          productId: p.id,
          productName: p.name,
          productImage: p.image || "/assets/images/product-01.jpg",
          sku: p.sku || "SKU-001",
          quantity: 1,
          unitPrice: price,
          subtotal: price,
        },
      ]);
      const initialTotal = price * 1.07;
      setFormPaid(initialTotal);
    } else {
      setSaleItems([]);
      setFormPaid(0);
    }

    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (s: Sale) => {
    setEditingSale(s);
    setFormCustomer(s.customerName);
    setFormBiller(s.billerName || "Admin");
    setFormStore(s.storeName || "Electro Mart");
    setFormWarehouse(s.warehouseName || "Lavish Warehouse");
    setFormReference(s.reference);
    setFormDate(new Date(s.date).toISOString().split("T")[0]);
    setFormStatus(s.status as any);
    setFormPaymentStatus(s.paymentStatus as any);
    setFormPaymentMethod((s.paymentMethod as any) || "CASH");
    setFormDiscount(s.discount || 0);
    setFormShipping(s.shipping || 0);
    setFormTaxRate(s.tax ? (s.tax / (s.subtotal || 1)) * 100 : 7);
    setFormPaid(s.paid || 0);
    setFormNotes(s.notes || "");

    if (s.items && s.items.length > 0) {
      setSaleItems(
        s.items.map((it) => ({
          productId: it.productId || null,
          productName: it.productName,
          productImage: it.productImage || "/assets/images/product-01.jpg",
          sku: it.sku || "SKU-001",
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          subtotal: it.subtotal || it.quantity * it.unitPrice,
        }))
      );
    } else {
      setSaleItems([]);
    }

    setShowModal(true);
  };

  // Save Sale
  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please select a Customer.",
      });
      return;
    }

    if (saleItems.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Items",
        message: "Please add at least one product item to this sale.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const cust = customers.find((c) => c.name === formCustomer);

      const payload = {
        reference: formReference,
        customerId: cust ? cust.id : null,
        customerName: formCustomer,
        customerAvatar: cust?.avatar || "/assets/images/avatar-01.jpg",
        billerName: formBiller,
        storeName: formStore,
        warehouseName: formWarehouse,
        date: formDate,
        status: formStatus,
        paymentStatus: formPaymentStatus,
        paymentMethod: formPaymentMethod,
        subtotal: formSubtotal,
        tax: formTaxAmount,
        discount: formDiscount,
        shipping: formShipping,
        grandTotal: formGrandTotal,
        paid: formPaid,
        due: formDue,
        notes: formNotes,
        items: saleItems.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          productImage: it.productImage,
          sku: it.sku,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          subtotal: Number(it.subtotal),
          total: Number(it.subtotal),
        })),
      };

      if (editingSale) {
        await updateSaleApi(editingSale.id, payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Sale Order Updated!",
          message: `Sales order "${formReference}" has been updated successfully.`,
          itemName: formReference,
        });
      } else {
        await createSaleApi(payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Sale Order Created!",
          message: `Sale order "${formReference}" for customer ${formCustomer} has been placed and stock deducted.`,
          itemName: formReference,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save sales order.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingSale) return;
    const ref = deletingSale.reference;
    try {
      setIsDeleting(true);
      await deleteSaleApi(deletingSale.id);
      setDeletingSale(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Sale Order Deleted!",
        message: `Sales order "${ref}" has been deleted.`,
        itemName: ref,
      });
      loadData();
    } catch (err: any) {
      setDeletingSale(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to delete sale order.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredSales.length === 0) {
      alert("No sales data available to export.");
      return;
    }
    const headers = ["Reference", "Customer", "Date", "Status", "Grand Total", "Paid", "Due", "Payment Status", "Biller"];
    const rows = filteredSales.map((s) => [
      `"${s.reference}"`,
      `"${s.customerName}"`,
      new Date(s.date).toLocaleDateString(),
      s.status,
      `$${s.grandTotal.toFixed(2)}`,
      `$${s.paid.toFixed(2)}`,
      `$${s.due.toFixed(2)}`,
      s.paymentStatus,
      `"${s.billerName || "Admin"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_list_${new Date().toISOString().split("T")[0]}.csv`);
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">{pageTitle}</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">{pageSubtitle}</p>
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

            {/* + Add Sales Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Sales</span>
            </button>

            {/* Import Button */}
            <button
              onClick={() => alert("Sales import spreadsheet ready. Please upload sales CSV.")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import Sales</span>
            </button>
          </div>
        </div>

        {/* Sales Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & 3 Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder="Search reference, customer, biller..."
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
              {/* Customer Filter */}
              <div className="w-44">
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
                    { value: "COMPLETED", label: "Completed" },
                    { value: "PENDING", label: "Pending" },
                    { value: "ORDERED", label: "Ordered" },
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
                    { value: "PARTIAL", label: "Partial" },
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
                      checked={paginatedSales.length > 0 && selectedIds.length === paginatedSales.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Customer Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Grand Total</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Paid</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Due</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Payment Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Biller</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading sales orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedSales.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ShoppingCart className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <p className="text-sm font-medium text-gray-500">No sales orders found</p>
                        <p className="text-xs text-gray-400">Click "+ Add Sales" to create a new customer order</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map((item) => {
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
                            <img
                              src={item.customerAvatar || "/assets/images/avatar-01.jpg"}
                              alt={item.customerName}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200"
                            />
                            <span className="truncate max-w-[140px]">{item.customerName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">{item.reference}</td>

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
                                : item.status === "ORDERED"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {item.status || "COMPLETED"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#1E293B]">${item.grandTotal.toFixed(2)}</td>

                        <td className="py-3.5 px-4 font-medium text-emerald-600">${item.paid.toFixed(2)}</td>

                        <td className="py-3.5 px-4 font-medium text-rose-600">${item.due.toFixed(2)}</td>

                        {/* Payment Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.paymentStatus === "UNPAID"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : item.paymentStatus === "OVERDUE"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {item.paymentStatus || "PAID"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B]">{item.billerName || "Admin"}</td>

                        {/* Action Buttons: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View Button */}
                            <button
                              onClick={() => setViewSale(item)}
                              title="View Invoice Slip"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Sale"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete Button */}
                            <button
                              onClick={() => setDeletingSale(item)}
                              title="Delete Sale"
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
              <span>Entries • Total {filteredSales.length} sales</span>
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
        {/* ADD / EDIT SALES ORDER MODAL */}
        {/* ========================================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingSale ? `Edit Sale (${editingSale.reference})` : "Create Sale Order"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSale} className="space-y-4">
                {/* Customer, Biller, Warehouse, Store */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Customer..."
                      value={formCustomer}
                      onChange={(val) => setFormCustomer(val)}
                      options={customers.map((c) => ({ value: c.name, label: c.name }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Biller</label>
                    <input
                      type="text"
                      value={formBiller}
                      onChange={(e) => setFormBiller(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Warehouse Source</label>
                    <SearchableSelect
                      placeholder="Select Warehouse..."
                      value={formWarehouse}
                      onChange={(val) => setFormWarehouse(val)}
                      options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Store Outlet</label>
                    <SearchableSelect
                      placeholder="Select Store..."
                      value={formStore}
                      onChange={(val) => setFormStore(val)}
                      options={stores.map((s) => ({ value: s.name, label: s.name }))}
                    />
                  </div>
                </div>

                {/* Items Line Builder */}
                <div className="border border-gray-200 rounded-xl p-3.5 space-y-3 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-800">Order Item Lines</span>
                    <div className="w-full sm:w-64">
                      <SearchableSelect
                        placeholder="+ Add Product..."
                        value={selectedAddProduct}
                        onChange={(val) => handleAddItemToLine(val)}
                        options={products.map((p) => ({
                          value: p.name,
                          label: `${p.name} ($${p.price})`,
                        }))}
                      />
                    </div>
                  </div>

                  {saleItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      No items added yet. Select a product from the dropdown above.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {saleItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 bg-white border border-gray-200 rounded-xl text-xs"
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-7 h-7 rounded-lg object-cover bg-gray-100"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <div className="w-16">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleUpdateItemQty(idx, Number(e.target.value))}
                                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-xs"
                              />
                            </div>
                            <span className="text-gray-400">×</span>
                            <div className="w-20">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateItemPrice(idx, Number(e.target.value))}
                                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-right text-xs"
                              />
                            </div>
                            <span className="font-bold text-gray-900 w-20 text-right">
                              ${item.subtotal.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown: Discount, Shipping, Tax, Paid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Tax / VAT (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formTaxRate}
                      onChange={(e) => setFormTaxRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Discount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Shipping ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formShipping}
                      onChange={(e) => setFormShipping(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Amount Paid ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPaid}
                      onChange={(e) => setFormPaid(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                {/* Status, Payment Status, Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Order Status</label>
                    <SearchableSelect
                      placeholder="Select Status..."
                      value={formStatus}
                      onChange={(val) => setFormStatus(val as any)}
                      options={[
                        { value: "COMPLETED", label: "Completed (Deduct Stock)" },
                        { value: "PENDING", label: "Pending" },
                        { value: "ORDERED", label: "Ordered" },
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
                        { value: "PARTIAL", label: "Partial" },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Payment Method</label>
                    <SearchableSelect
                      placeholder="Select Method..."
                      value={formPaymentMethod}
                      onChange={(val) => setFormPaymentMethod(val as any)}
                      options={[
                        { value: "CASH", label: "Cash" },
                        { value: "PROMPTPAY", label: "PromptPay QR" },
                        { value: "CREDIT_CARD", label: "Credit Card" },
                        { value: "BANK_TRANSFER", label: "Bank Transfer" },
                      ]}
                    />
                  </div>
                </div>

                {/* Order Summary Calculation Box */}
                <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Subtotal: </span>
                    <span className="font-bold text-gray-800">${formSubtotal.toFixed(2)}</span>
                    <span className="text-gray-400 ml-2">| Tax: ${formTaxAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Grand Total: </span>
                    <span className="text-base font-bold text-[#FE9F43]">${formGrandTotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Due: </span>
                    <span className={`font-bold ${formDue > 0 ? "text-red-500" : "text-emerald-600"}`}>
                      ${formDue.toFixed(2)}
                    </span>
                  </div>
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
                    {isSubmitting ? "Saving..." : editingSale ? "Update Sale" : "Create Sale"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW INVOICE SLIP MODAL */}
        {/* ========================================================================= */}
        {viewSale && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Sales Invoice Slip</h3>
                    <p className="text-xs text-gray-400 font-mono">Ref: {viewSale.reference}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewSale(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Top Info Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 font-medium">Customer</span>
                    <p className="font-bold text-gray-800">{viewSale.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Biller / Cashier</span>
                    <p className="font-semibold text-gray-800">{viewSale.billerName || "Admin"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Store Outlet</span>
                    <p className="font-semibold text-gray-800">{viewSale.storeName || "Electro Mart"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Date</span>
                    <p className="font-semibold text-gray-800">
                      {new Date(viewSale.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="p-2 font-semibold">Item</th>
                        <th className="p-2 text-center font-semibold">Qty</th>
                        <th className="p-2 text-right font-semibold">Price</th>
                        <th className="p-2 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewSale.items && viewSale.items.length > 0 ? (
                        viewSale.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium text-gray-800">{it.productName}</td>
                            <td className="p-2 text-center">{it.quantity}</td>
                            <td className="p-2 text-right">${it.unitPrice.toFixed(2)}</td>
                            <td className="p-2 text-right font-bold text-gray-900">${(it.quantity * it.unitPrice).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-3 text-center text-gray-400">General sale items</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Totals */}
                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-semibold text-gray-800">${viewSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax / VAT:</span>
                    <span className="font-semibold text-gray-800">${viewSale.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-orange-100 pt-1 text-sm font-bold">
                    <span className="text-gray-900">Grand Total:</span>
                    <span className="text-[#FE9F43]">${viewSale.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-gray-500">Paid ({viewSale.paymentMethod || "CASH"}):</span>
                    <span className="font-semibold text-emerald-600">${viewSale.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Due Amount:</span>
                    <span className={`font-semibold ${viewSale.due > 0 ? "text-red-500" : "text-gray-700"}`}>
                      ${viewSale.due.toFixed(2)}
                    </span>
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
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewSale(null)}
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
        {deletingSale && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <Trash2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Delete Sale Order?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to remove sale order <span className="font-bold text-gray-800 font-mono">"{deletingSale.reference}"</span>?
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingSale(null)}
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
};

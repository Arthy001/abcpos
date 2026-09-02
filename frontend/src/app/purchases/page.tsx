"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Purchase, PurchaseItem, Supplier, Product, Warehouse, Store } from "@/types";
import {
  fetchPurchases,
  createPurchaseApi,
  updatePurchaseApi,
  deletePurchaseApi,
  fetchSuppliers,
  fetchProducts,
  fetchWarehouses,
  fetchStores,
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
  ShoppingBag,
  Building2,
  Receipt,
  Plus,
  Minus,
} from "lucide-react";

export default function PurchasesPage() {
  const { user, isAdmin, canManageWarehouse } = useAuthStore();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
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
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  // Form Fields
  const [formSupplierName, setFormSupplierName] = useState<string>("");
  const [formWarehouse, setFormWarehouse] = useState<string>("Lavish Warehouse");
  const [formStore, setFormStore] = useState<string>("Electro Mart");
  const [formReference, setFormReference] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formStatus, setFormStatus] = useState<"RECEIVED" | "PENDING" | "ORDERED" | "CANCELLED">("RECEIVED");
  const [formPaymentStatus, setFormPaymentStatus] = useState<"PAID" | "UNPAID" | "OVERDUE" | "PARTIAL">("PAID");
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formTax, setFormTax] = useState<number>(0);
  const [formShipping, setFormShipping] = useState<number>(0);
  const [formPaid, setFormPaid] = useState<number>(0);
  const [formNotes, setFormNotes] = useState<string>("");
  const [formItems, setFormItems] = useState<PurchaseItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal State
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);

  // Delete Confirmation State
  const [deletingPurchase, setDeletingPurchase] = useState<Purchase | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, sData, prData, wData, stData] = await Promise.all([
        fetchPurchases({
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          supplierName: supplierFilter,
          search,
        }),
        fetchSuppliers(),
        fetchProducts(),
        fetchWarehouses(),
        fetchStores(),
      ]);
      setPurchases(pData || []);
      setSuppliers(sData || []);
      setProducts(prData || []);
      setWarehouses(wData || []);
      setStores(stData || []);

      // Smart Default: Auto-select warehouseFilter if user has assigned warehouse and not Admin
      if (wData && user?.warehouseName && !isAdmin() && warehouseFilter === "all") {
        setWarehouseFilter(user.warehouseName);
      }
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Purchases",
        message: err.message || "An error occurred while fetching purchase records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, paymentStatusFilter, supplierFilter, search]);

  // Filtering
  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.reference.toLowerCase().includes(search.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        (item.warehouseName && item.warehouseName.toLowerCase().includes(search.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || item.status.toUpperCase() === statusFilter.toUpperCase();
      const matchesPayment =
        paymentStatusFilter === "all" ||
        item.paymentStatus.toUpperCase() === paymentStatusFilter.toUpperCase();
      const matchesSupplier =
        supplierFilter === "all" || item.supplierName === supplierFilter;
      const matchesWarehouse =
        warehouseFilter === "all" ||
        (item.warehouseName && item.warehouseName.toLowerCase() === warehouseFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesPayment && matchesSupplier && matchesWarehouse;
    });
  }, [purchases, search, statusFilter, paymentStatusFilter, supplierFilter, warehouseFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPurchases.length / pageSize) || 1;
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPurchases.slice(start, start + pageSize);
  }, [filteredPurchases, currentPage, pageSize]);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedPurchases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedPurchases.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Form Calculations
  const calculatedSubtotal = useMemo(() => {
    return formItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  }, [formItems]);

  const calculatedTotal = useMemo(() => {
    const afterDiscount = Math.max(0, calculatedSubtotal - formDiscount);
    const taxAmount = (afterDiscount * formTax) / 100;
    return afterDiscount + taxAmount + formShipping;
  }, [calculatedSubtotal, formDiscount, formTax, formShipping]);

  const calculatedDue = useMemo(() => {
    return Math.max(0, calculatedTotal - formPaid);
  }, [calculatedTotal, formPaid]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPurchase(null);
    setFormSupplierName(suppliers.length > 0 ? suppliers[0].name : "");
    // Default to user's assigned warehouse if available
    setFormWarehouse(user?.warehouseName || (warehouses.length > 0 ? warehouses[0].name : "Lavish Warehouse"));
    setFormStore(stores.length > 0 ? stores[0].name : "Electro Mart");
    setFormReference(`PT${Math.floor(100 + Math.random() * 900)}`);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStatus("RECEIVED");
    setFormPaymentStatus("PAID");
    setFormDiscount(0);
    setFormTax(7); // 7% VAT
    setFormShipping(0);
    setFormNotes("");

    // Initial Item
    if (products.length > 0) {
      const firstP = products[0];
      setFormItems([
        {
          productId: firstP.id,
          productName: firstP.name,
          productImage: firstP.image || "/assets/images/product-01.jpg",
          sku: firstP.sku,
          quantity: 10,
          receivedQty: 10,
          unitCost: firstP.costPrice || 25,
          subtotal: (firstP.costPrice || 25) * 10,
          total: (firstP.costPrice || 25) * 10,
        },
      ]);
      setFormPaid((firstP.costPrice || 25) * 10 * 1.07);
    } else {
      setFormItems([
        {
          productName: "Sample Product",
          sku: "SKU001",
          quantity: 10,
          receivedQty: 10,
          unitCost: 100,
          subtotal: 1000,
          total: 1000,
        },
      ]);
      setFormPaid(1000 * 1.07);
    }
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p: Purchase) => {
    // Check permission if editing purchase of another warehouse
    if (p.warehouseName && !canManageWarehouse(p.warehouseName) && !isAdmin()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `คุณสังกัดคลัง "${user?.warehouseName}" ไม่ได้รับอนุญาตให้แก้ไขใบรับสินค้าของคลัง "${p.warehouseName}"`,
      });
      return;
    }

    setEditingPurchase(p);
    setFormSupplierName(p.supplierName);
    setFormWarehouse(p.warehouseName || (user?.warehouseName || "Lavish Warehouse"));
    setFormStore(p.storeName || "Electro Mart");
    setFormReference(p.reference);
    setFormDate(new Date(p.date).toISOString().split("T")[0]);
    setFormStatus(p.status || "RECEIVED");
    setFormPaymentStatus(p.paymentStatus || "PAID");
    setFormDiscount(p.discount || 0);
    setFormTax(p.tax || 0);
    setFormShipping(p.shipping || 0);
    setFormPaid(p.paid || 0);
    setFormNotes(p.notes || "");
    setFormItems(p.items && p.items.length > 0 ? p.items : []);
    setShowModal(true);
  };

  // Add Item Line
  const handleAddItemLine = () => {
    if (products.length > 0) {
      const p = products[0];
      setFormItems([
        ...formItems,
        {
          productId: p.id,
          productName: p.name,
          productImage: p.image || "/assets/images/product-01.jpg",
          sku: p.sku,
          quantity: 1,
          receivedQty: 1,
          unitCost: p.costPrice || 10,
          subtotal: p.costPrice || 10,
          total: p.costPrice || 10,
        },
      ]);
    } else {
      setFormItems([
        ...formItems,
        {
          productName: "New Product",
          sku: "SKU00" + (formItems.length + 1),
          quantity: 1,
          receivedQty: 1,
          unitCost: 50,
          subtotal: 50,
          total: 50,
        },
      ]);
    }
  };

  const handleUpdateItemLine = (index: number, field: string, val: any) => {
    const updated = [...formItems];
    const item = { ...updated[index], [field]: val };

    if (field === "productId") {
      const foundP = products.find((p) => p.id === val);
      if (foundP) {
        item.productName = foundP.name;
        item.sku = foundP.sku;
        item.productImage = foundP.image || "/assets/images/product-01.jpg";
        item.unitCost = foundP.costPrice || item.unitCost;
      }
    }

    if (field === "quantity" || field === "unitCost") {
      item.subtotal = Number(item.quantity) * Number(item.unitCost);
      item.total = item.subtotal;
    }

    updated[index] = item;
    setFormItems(updated);
  };

  const handleRemoveItemLine = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  // Save Purchase
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplierName) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please select a Supplier.",
      });
      return;
    }
    if (formItems.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Items",
        message: "Please add at least one product item to the purchase order.",
      });
      return;
    }

    // Guard: Prevent non-admin user from receiving stock into another warehouse
    if (!canManageWarehouse(formWarehouse) && !isAdmin()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `คุณสังกัดคลัง "${user?.warehouseName}" ไม่ได้รับอนุญาตให้รับสินค้าเข้าคลัง "${formWarehouse}"`,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        reference: formReference,
        supplierName: formSupplierName,
        warehouseName: formWarehouse,
        storeName: formStore,
        date: formDate,
        status: formStatus,
        paymentStatus: formPaymentStatus,
        subtotal: calculatedSubtotal,
        discount: Number(formDiscount),
        tax: Number(formTax),
        shipping: Number(formShipping),
        total: calculatedTotal,
        paid: Number(formPaid),
        due: calculatedDue,
        notes: formNotes,
        items: formItems,
      };

      if (editingPurchase) {
        await updatePurchaseApi(editingPurchase.id, payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Purchase Updated!",
          message: `Purchase order "${formReference}" has been updated successfully.`,
          itemName: formReference,
        });
      } else {
        await createPurchaseApi(payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Purchase Created!",
          message: `Purchase order "${formReference}" for ${formSupplierName} ($${calculatedTotal.toFixed(2)}) has been recorded${
            formStatus === "RECEIVED" ? " and stock has been ingested into inventory" : ""
          }.`,
          itemName: formReference,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save purchase order.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingPurchase) return;
    const ref = deletingPurchase.reference;
    try {
      setIsDeleting(true);
      await deletePurchaseApi(deletingPurchase.id);
      setDeletingPurchase(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Purchase Deleted!",
        message: `Purchase order "${ref}" has been deleted and stock adjustments reverted.`,
        itemName: ref,
      });
      loadData();
    } catch (err: any) {
      setDeletingPurchase(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to delete purchase order.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredPurchases.length === 0) {
      alert("No purchase data available to export.");
      return;
    }
    const headers = ["Reference", "Supplier", "Warehouse", "Date", "Status", "Total", "Paid", "Due", "Payment Status"];
    const rows = filteredPurchases.map((p) => [
      `"${p.reference}"`,
      `"${p.supplierName}"`,
      `"${p.warehouseName || "N/A"}"`,
      new Date(p.date).toLocaleDateString(),
      p.status,
      `$${p.total.toFixed(2)}`,
      `$${p.paid.toFixed(2)}`,
      `$${p.due.toFixed(2)}`,
      p.paymentStatus,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchases_${new Date().toISOString().split("T")[0]}.csv`);
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Purchases</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage and track your purchase orders and goods received</p>
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

            {/* + Add Purchase Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Purchase</span>
            </button>

            {/* Import Purchase Button */}
            <button
              onClick={() => alert("CSV/Excel Import feature ready. Please upload a structured purchase spreadsheet.")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import Purchase</span>
            </button>
          </div>
        </div>

        {/* Purchases Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & 3 Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder="Search reference, supplier..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 w-full lg:w-auto">
              {/* Warehouse Filter */}
              <div className="w-full lg:w-44">
                <SearchableSelect
                  placeholder="Warehouse: All"
                  value={warehouseFilter}
                  onChange={(val) => {
                    setWarehouseFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Warehouse: All" },
                    ...warehouses.map((w) => ({ value: w.name, label: w.name })),
                  ]}
                />
              </div>

              {/* Supplier Filter */}
              <div className="w-full lg:w-44">
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
              <div className="w-full lg:w-36">
                <SearchableSelect
                  placeholder="Status: All"
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "PENDING", label: "Pending" },
                    { value: "ORDERED", label: "Ordered" },
                    { value: "RECEIVED", label: "Received" },
                    { value: "CANCELLED", label: "Cancelled" },
                  ]}
                />
              </div>

              {/* Payment Status Filter */}
              <div className="w-full lg:w-36">
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
          <div className="overflow-x-auto min-h-[300px] -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[980px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedPurchases.length > 0 && selectedIds.length === paginatedPurchases.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Supplier Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Paid</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Due</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Payment Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading purchases...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ShoppingBag className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <p className="text-sm font-medium text-gray-500">No purchases found</p>
                        <p className="text-xs text-gray-400">Click "+ Add Purchase" to record a new supplier order</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPurchases.map((item) => {
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
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FE9F43] flex items-center justify-center font-bold text-[10px]">
                              {item.supplierName.charAt(0).toUpperCase()}
                            </div>
                            <span>{item.supplierName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-[#64748B] font-mono text-[11px] font-medium">{item.reference}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{item.warehouseName || "Lavish Warehouse"}</span>
                          </div>
                        </td>

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
                              item.status === "RECEIVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : item.status === "ORDERED"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {item.status || "RECEIVED"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#1E293B]">${item.total.toFixed(2)}</td>

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

                        {/* Action Buttons: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View Button */}
                            <button
                              onClick={() => setViewPurchase(item)}
                              title="View Purchase Invoice Slip"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Purchase Order"
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
                                    message: `คุณสังกัดคลัง "${user?.warehouseName}" ไม่ได้รับอนุญาตให้ลบใบสั่งซื้อของคลัง "${item.warehouseName}"`,
                                  });
                                  return;
                                }
                                setDeletingPurchase(item);
                              }}
                              title="Delete Purchase Record"
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
              <span>Entries • Total {filteredPurchases.length} purchases</span>
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
        {/* ADD / EDIT PURCHASE MODAL */}
        {/* ========================================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingPurchase ? "Edit Purchase Order" : "Add New Purchase"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePurchase} className="space-y-4">
                {/* 1. Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Supplier..."
                      value={formSupplierName}
                      onChange={(val) => setFormSupplierName(val)}
                      options={suppliers.map((s) => ({ value: s.name, label: s.name }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">Destination Warehouse</label>
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
                            message: `คุณสังกัดคลัง "${user?.warehouseName}" สามารถรับสินค้าเข้าได้เฉพาะคลังของตนเองเท่านั้น`,
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

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Purchase Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Reference No</label>
                    <input
                      type="text"
                      value={formReference}
                      onChange={(e) => setFormReference(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Goods Status <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Status..."
                      value={formStatus}
                      onChange={(val) => setFormStatus(val as any)}
                      options={[
                        { value: "PENDING", label: "Pending (Draft / Awaiting Approval)" },
                        { value: "ORDERED", label: "Ordered (PO Sent / In Transit)" },
                        { value: "RECEIVED", label: "Received (Stock Ingested)" },
                        { value: "CANCELLED", label: "Cancelled" },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Payment Status</label>
                    <SearchableSelect
                      placeholder="Select Payment Status..."
                      value={formPaymentStatus}
                      onChange={(val) => setFormPaymentStatus(val as any)}
                      options={[
                        { value: "PAID", label: "Paid" },
                        { value: "UNPAID", label: "Unpaid" },
                        { value: "PARTIAL", label: "Partial" },
                        { value: "OVERDUE", label: "Overdue" },
                      ]}
                    />
                  </div>
                </div>

                {/* 2. Product Items Table */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Purchased Items ({formItems.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemLine}
                      className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-[#FE9F43] rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Product Item</span>
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-xl bg-white overflow-visible relative min-h-[180px] pb-16">
                    <table className="w-full text-xs text-left min-w-[850px]">
                      <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3 w-28">Quantity</th>
                          <th className="py-2.5 px-3 w-28">Unit Cost ($)</th>
                          <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
                          <th className="py-2.5 px-2 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {formItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-2 px-3 relative">
                              {products.length > 0 ? (
                                <div className="relative min-w-[220px]">
                                  <SearchableSelect
                                    placeholder="Select Product..."
                                    value={item.productId || ""}
                                    onChange={(val) => handleUpdateItemLine(idx, "productId", val)}
                                    options={products.map((p) => ({
                                      value: p.id,
                                      label: `${p.name} (${p.sku})`,
                                    }))}
                                  />
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={item.productName}
                                  onChange={(e) => handleUpdateItemLine(idx, "productName", e.target.value)}
                                  className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                                />
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleUpdateItemLine(idx, "quantity", Number(e.target.value))}
                                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-center"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={item.unitCost}
                                onChange={(e) => handleUpdateItemLine(idx, "unitCost", Number(e.target.value))}
                                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-right"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-gray-900">
                              ${(item.unitCost * item.quantity).toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemLine(idx)}
                                disabled={formItems.length === 1}
                                className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer rounded hover:bg-red-50"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Totals & Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Notes / Instructions</label>
                    <textarea
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="e.g. Terms of delivery, payment bank details..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold text-gray-800">${calculatedSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Tax / VAT (%):</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formTax}
                        onChange={(e) => setFormTax(Number(e.target.value))}
                        className="w-20 px-2 py-0.5 bg-white border border-gray-200 rounded text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Discount ($):</span>
                      <input
                        type="number"
                        min={0}
                        value={formDiscount}
                        onChange={(e) => setFormDiscount(Number(e.target.value))}
                        className="w-20 px-2 py-0.5 bg-white border border-gray-200 rounded text-right text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Shipping ($):</span>
                      <input
                        type="number"
                        min={0}
                        value={formShipping}
                        onChange={(e) => setFormShipping(Number(e.target.value))}
                        className="w-20 px-2 py-0.5 bg-white border border-gray-200 rounded text-right text-xs"
                      />
                    </div>

                    <div className="flex justify-between border-t border-gray-200 pt-1.5 text-sm font-bold text-gray-900">
                      <span>Grand Total:</span>
                      <span className="text-[#FE9F43]">${calculatedTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-emerald-700">Paid Amount ($):</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formPaid}
                        onChange={(e) => setFormPaid(Number(e.target.value))}
                        className="w-24 px-2 py-1 bg-white border border-emerald-300 text-emerald-800 font-bold rounded text-right text-xs"
                      />
                    </div>

                    <div className="flex justify-between text-xs font-semibold text-rose-600">
                      <span>Due Amount:</span>
                      <span>${calculatedDue.toFixed(2)}</span>
                    </div>
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
                    {isSubmitting ? "Saving..." : editingPurchase ? "Update Purchase" : "Create Purchase"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW PURCHASE INVOICE SLIP MODAL */}
        {/* ========================================================================= */}
        {viewPurchase && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Purchase Invoice Slip</h3>
                    <p className="text-xs text-gray-400 font-mono">Ref: {viewPurchase.reference}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewPurchase(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Purchase Details */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Supplier</span>
                    <p className="font-bold text-gray-900 text-sm">{viewPurchase.supplierName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Warehouse / Store</span>
                    <p className="font-semibold text-gray-800">{viewPurchase.warehouseName || "Lavish Warehouse"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Purchase Date</span>
                    <p className="font-semibold text-gray-800">
                      {new Date(viewPurchase.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Goods Status</span>
                    <div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          viewPurchase.status === "RECEIVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : viewPurchase.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {viewPurchase.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left min-w-[850px]">
                    <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Cost</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewPurchase.items && viewPurchase.items.length > 0 ? (
                        viewPurchase.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-semibold text-gray-800">
                              {item.productName}
                              <span className="block text-[10px] text-gray-400 font-mono font-normal">
                                SKU: {item.sku}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-gray-700">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-gray-600">${item.unitCost.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                              ${(item.unitCost * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-400">
                            No item breakdown available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals Breakdown */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-semibold text-gray-800">${viewPurchase.subtotal.toFixed(2)}</span>
                  </div>
                  {viewPurchase.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-${viewPurchase.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {viewPurchase.tax > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Tax / VAT:</span>
                      <span>+{viewPurchase.tax}%</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-sm text-gray-900">
                    <span>Grand Total:</span>
                    <span className="text-[#FE9F43]">${viewPurchase.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Amount Paid:</span>
                    <span>${viewPurchase.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-rose-600">
                    <span>Amount Due:</span>
                    <span>${viewPurchase.due.toFixed(2)}</span>
                  </div>
                </div>

                {viewPurchase.notes && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Purchase Notes</span>
                    <p className="text-xs text-blue-900 leading-relaxed">{viewPurchase.notes}</p>
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
                  onClick={() => setViewPurchase(null)}
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
        {deletingPurchase && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <Trash2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">Delete Purchase Order?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to remove purchase order <span className="font-bold text-gray-800 font-mono">"{deletingPurchase.reference}"</span>?
                  This will revert any associated inventory adjustments.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPurchase(null)}
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

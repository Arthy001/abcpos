"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesOrder, Customer, Product } from "@/types";
import {
  getSalesOrdersApi,
  createSalesOrderApi,
  updateSalesOrderStatusApi,
  deleteSalesOrderApi,
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
  Trash2,
  Eye,
  X,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
  CreditCard,
  Building2,
  Clock,
  Plus,
  ShieldAlert,
  Send,
  Calendar,
  DollarSign,
  Printer,
  CheckCheck,
} from "lucide-react";

export default function B2bSalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [termFilter, setTermFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Feedback Modal (GEMINI.md standard)
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  // Create SO Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formOrderNo, setFormOrderNo] = useState<string>("");
  const [formCustomerId, setFormCustomerId] = useState<string>("");
  const [formDeliveryDate, setFormDeliveryDate] = useState<string>("");
  const [formCreditTermDays, setFormCreditTermDays] = useState<number>(30);
  const [formDeliveryAddress, setFormDeliveryAddress] = useState<string>("");
  const [formSalesPerson, setFormSalesPerson] = useState<string>("Admin");
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formTaxRate, setFormTaxRate] = useState<number>(0); // 0% or 7%
  const [formShippingFee, setFormShippingFee] = useState<number>(0);
  const [formNotes, setFormNotes] = useState<string>("");
  const [formItems, setFormItems] = useState<
    {
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      discount: number;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View SO Modal
  const [viewOrder, setViewOrder] = useState<SalesOrder | null>(null);

  // Delete Confirmation
  const [deletingOrder, setDeletingOrder] = useState<SalesOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderData, custData, prodData] = await Promise.all([
        getSalesOrdersApi(),
        fetchCustomers(),
        fetchProducts(),
      ]);
      setOrders(orderData || []);
      setCustomers(custData || []);
      setProducts(prodData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Orders",
        message: err.message || "An error occurred while loading B2B sales orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Paginated Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (o.salesPerson && o.salesPerson.toLowerCase().includes(search.toLowerCase())) ||
        (o.customer?.taxId && o.customer.taxId.includes(search));
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchTerm =
        termFilter === "all" ||
        (termFilter === "cash" && o.creditTermDays === 0) ||
        (termFilter === "30" && o.creditTermDays === 30) ||
        (termFilter === "60" && o.creditTermDays === 60);
      return matchSearch && matchStatus && matchTerm;
    });
  }, [orders, search, statusFilter, termFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalCount = orders.length;
    const pendingShipping = orders.filter((o) => o.status === "CONFIRMED").length;
    const totalCreditOutstanding = orders
      .filter((o) => o.creditTermDays > 0 && o.paymentStatus !== "PAID" && o.status !== "CANCELLED")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const completedTotal = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return { totalCount, pendingShipping, totalCreditOutstanding, completedTotal };
  }, [orders]);

  // Customer options for SearchableSelect
  const customerOptions = useMemo(() => {
    return customers.map((c) => {
      const rem = Math.max(0, (c.creditLimit || 0) - (c.currentCreditUsed || 0));
      return {
        value: c.id,
        label: `${c.name} ${c.code ? `(${c.code})` : ""}`,
        subLabel: `วงเงิน: ฿${(c.creditLimit || 0).toLocaleString()} | คงเหลือ: ฿${rem.toLocaleString()} | เทอม: ${c.creditTermDays || 0} วัน`,
      };
    });
  }, [customers]);

  // Product options for SearchableSelect
  const productOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.sku})`,
      subLabel: `ราคาขายส่ง: ฿${p.price.toFixed(2)} | คลัง: ${p.stock}`,
    }));
  }, [products]);

  // Selected Customer in Form
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === formCustomerId);
  }, [customers, formCustomerId]);

  const customerRemainingCredit = useMemo(() => {
    if (!selectedCustomer) return 0;
    return Math.max(0, (selectedCustomer.creditLimit || 0) - (selectedCustomer.currentCreditUsed || 0));
  }, [selectedCustomer]);

  // Form Calculations
  const formSubtotal = useMemo(() => {
    return formItems.reduce((sum, it) => {
      return sum + (it.quantity || 0) * (it.unitPrice || 0) - (it.discount || 0);
    }, 0);
  }, [formItems]);

  const formTaxAmount = useMemo(() => {
    return (formSubtotal - formDiscount) * (formTaxRate / 100);
  }, [formSubtotal, formDiscount, formTaxRate]);

  const formTotal = useMemo(() => {
    return Math.max(0, formSubtotal - formDiscount + formTaxAmount + formShippingFee);
  }, [formSubtotal, formDiscount, formTaxAmount, formShippingFee]);

  const isFormOverCreditLimit = useMemo(() => {
    if (!selectedCustomer || !selectedCustomer.creditLimit || selectedCustomer.creditLimit <= 0) return false;
    return formTotal > customerRemainingCredit;
  }, [selectedCustomer, formTotal, customerRemainingCredit]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const codeNum = String(orders.length + 1).padStart(4, "0");
    setFormOrderNo(`SO-2026-${codeNum}`);
    setFormCustomerId("");
    setFormDeliveryDate("");
    setFormCreditTermDays(30);
    setFormDeliveryAddress("");
    setFormSalesPerson("Admin");
    setFormDiscount(0);
    setFormTaxRate(0);
    setFormShippingFee(0);
    setFormNotes("");

    // Default 1 item row
    const defProd = products[0];
    setFormItems([
      {
        productId: defProd?.id || "",
        productName: defProd?.name || "",
        sku: defProd?.sku || "",
        quantity: 100,
        unit: "kg",
        unitPrice: defProd?.price || 68,
        discount: 0,
      },
    ]);
    setShowAddModal(true);
  };

  const handleCustomerSelect = (custId: string) => {
    setFormCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setFormCreditTermDays(cust.creditTermDays ?? 30);
      setFormDeliveryAddress(cust.address || "");
    }
  };

  const handleAddItemRow = () => {
    setFormItems((prev) => [
      ...prev,
      {
        productId: "",
        productName: "",
        sku: "",
        quantity: 50,
        unit: "kg",
        unitPrice: 0,
        discount: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemProductSelect = (idx: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    setFormItems((prev) => {
      const next = [...prev];
      if (prod) {
        next[idx] = {
          ...next[idx],
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          unitPrice: prod.price || 0,
        };
      }
      return next;
    });
  };

  const handleItemFieldChange = (idx: number, field: string, val: any) => {
    setFormItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  // Create Sales Order Submit
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrderNo.trim() || !formCustomerId || formItems.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "กรุณาระบุเลขที่ใบสั่งขาย เลือกลูกค้า และระบุรายการสินค้าอย่างน้อย 1 รายการ",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createSalesOrderApi({
        orderNo: formOrderNo.trim(),
        customerId: formCustomerId,
        deliveryDate: formDeliveryDate || undefined,
        creditTermDays: Number(formCreditTermDays),
        items: formItems,
        discount: Number(formDiscount),
        tax: Number(formTaxAmount),
        shippingFee: Number(formShippingFee),
        deliveryAddress: formDeliveryAddress,
        salesPerson: formSalesPerson,
        notes: formNotes,
      });

      setShowAddModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Sales Order Created!",
        message: `ออกใบสั่งขาย "${formOrderNo}" ยอดรวม ฿${formTotal.toLocaleString()} สำเร็จแล้ว ${
          res.isOverLimit ? "(หมายเหตุ: มียอดเกินวงเงินสินเชื่อของลูกค้า)" : ""
        }`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "ไม่สามารถออกใบสั่งขายได้",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Progression
  const handleUpdateStatus = async (order: SalesOrder, nextStatus: string) => {
    try {
      await updateSalesOrderStatusApi(order.id, { status: nextStatus });
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Order Status Updated!",
        message: `อัปเดตสถานะใบสั่งขาย "${order.orderNo}" เป็น "${nextStatus}" เรียบร้อยแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Status Update Failed",
        message: err.message || "ไม่สามารถเปลี่ยนสถานะคำสั่งขายได้",
      });
    }
  };

  // Delete Order
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    try {
      setIsDeleting(true);
      await deleteSalesOrderApi(deletingOrder.id);
      const delNo = deletingOrder.orderNo;
      setDeletingOrder(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Sales Order Deleted!",
        message: `ลบใบสั่งขาย "${delNo}" สำเร็จแล้ว และคืนวงเงินสินเชื่อเข้าบัญชีลูกค้าเรียบร้อย`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "ไม่สามารถลบใบสั่งขายได้",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Order No", "Customer", "Tax ID", "Order Date", "Due Date", "Credit Term (Days)", "Total (THB)", "Status", "Payment Status"];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNo}"`,
      `"${o.customerName}"`,
      `"${o.customer?.taxId || ""}"`,
      `"${new Date(o.orderDate).toLocaleDateString("th-TH")}"`,
      `"${o.dueDate ? new Date(o.dueDate).toLocaleDateString("th-TH") : "-"}"`,
      o.creditTermDays,
      o.total,
      `"${o.status}"`,
      `"${o.paymentStatus}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `b2b_sales_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Sales Orders (ใบสั่งขาย B2B)</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
                B2B Wholesale
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              จัดการคำสั่งขายส่ง ยี่ปั๊ว-ซาปั๊ว ควบคุมเงื่อนไขเครดิตเทอม 30-60 วัน และตรวจสอบวงเงินสินเชื่อลูกหนี้การค้า
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              title="Export PDF"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
            </button>
            <button
              type="button"
              title="Export CSV"
              onClick={handleExportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Sales Order</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">ใบสั่งขายทั้งหมด</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#1E293B]">{kpis.totalCount}</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">รอส่งมอบ (Pending Ship)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-blue-600">{kpis.pendingShipping}</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">ยอดหนี้ค้างชำระเครดิตรวม</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-rose-600">฿{kpis.totalCreditOutstanding.toLocaleString()}</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">ยอดขายส่งเสร็จสมบูรณ์</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-emerald-600">฿{kpis.completedTotal.toLocaleString()}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SO No, Customer, Tax ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] focus:ring-1 focus:ring-[#FE9F43] transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-44">
                <SearchableSelect
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "CONFIRMED", label: "Confirmed (ยืนยัน)" },
                    { value: "SHIPPED", label: "Shipped (กำลังส่ง)" },
                    { value: "COMPLETED", label: "Completed (สำเร็จ)" },
                    { value: "CANCELLED", label: "Cancelled (ยกเลิก)" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="Filter Status..."
                  showSelectOption={false}
                  size="sm"
                />
              </div>

              <div className="w-full sm:w-44">
                <SearchableSelect
                  options={[
                    { value: "all", label: "Terms: All" },
                    { value: "cash", label: "เงินสด (Cash)" },
                    { value: "30", label: "เครดิต 30 วัน" },
                    { value: "60", label: "เครดิต 60 วัน" },
                  ]}
                  value={termFilter}
                  onChange={(val) => setTermFilter(val)}
                  placeholder="Credit Term..."
                  showSelectOption={false}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F1F3F5] bg-[#F8F9FA] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">SO Number</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Credit Term</th>
                  <th className="py-3 px-4">Items / Qty</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Process</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>กำลังโหลดรายการใบสั่งขาย...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      ไม่พบข้อมูลใบสั่งขาย B2B
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const isOverdue =
                      order.dueDate &&
                      new Date(order.dueDate) < new Date() &&
                      order.paymentStatus !== "PAID" &&
                      order.status !== "CANCELLED";

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#FE9F43]">
                          {order.orderNo}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-semibold text-gray-900 block">{order.customerName}</span>
                            {order.customer?.taxId && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                TAX: {order.customer.taxId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-[11px] text-gray-800 block">
                              สั่ง: {new Date(order.orderDate).toLocaleDateString("th-TH")}
                            </span>
                            {order.dueDate && (
                              <span
                                className={`text-[10px] font-medium block ${
                                  isOverdue ? "text-rose-600 font-bold" : "text-gray-400"
                                }`}
                              >
                                ครบกำหนด: {new Date(order.dueDate).toLocaleDateString("th-TH")}{" "}
                                {isOverdue && "(เกินกำหนด!)"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              order.creditTermDays > 0
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {order.creditTermDays > 0 ? `เครดิต ${order.creditTermDays} วัน` : "เงินสด (Cash)"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold text-gray-800 block">
                              {order.items?.length || 0} รายการ
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {order.items?.[0]?.productName
                                ? `${order.items[0].productName.slice(0, 20)}...`
                                : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-sm text-gray-900">
                          ฿{order.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold block text-center ${
                                order.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : order.status === "SHIPPED"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : order.status === "CONFIRMED"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-semibold block text-center ${
                                order.paymentStatus === "PAID"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>

                        {/* Progression button */}
                        <td className="py-3 px-4 text-center">
                          {order.status === "CONFIRMED" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order, "SHIPPED")}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 mx-auto shadow-2xs cursor-pointer transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>จัดส่งสินค้า</span>
                            </button>
                          )}
                          {order.status === "SHIPPED" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order, "COMPLETED")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 mx-auto shadow-2xs cursor-pointer transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>ส่งมอบสำเร็จ</span>
                            </button>
                          )}
                          {order.status === "COMPLETED" && (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>เรียบร้อย</span>
                            </span>
                          )}
                        </td>

                        {/* GEMINI.md Action Order: View (Eye) -> Delete (Trash2) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              title="View Order Details"
                              onClick={() => setViewOrder(order)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete Order"
                              onClick={() => setDeletingOrder(order)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors cursor-pointer"
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

          {/* Pagination */}
          <div className="p-3 border-t border-[#F1F3F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex items-center space-x-2">
              <span>แสดงแถวต่อหน้า:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#FE9F43]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>จากทั้งหมด {filteredOrders.length} รายการ</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ADD SALES ORDER MODAL                                     */}
        {/* ========================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-2xl p-6 space-y-4 my-8 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">สร้างใบสั่งขาย B2B (Create Sales Order)</h3>
                    <p className="text-[11px] text-gray-500">ออกใบสั่งขายส่ง คำนวณเครดิตเทอม และตรวจสอบวงเงินสินเชื่อลูกหนี้</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เลขที่ใบสั่งขาย (SO No) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formOrderNo}
                      onChange={(e) => setFormOrderNo(e.target.value)}
                      required
                      placeholder="e.g. SO-2026-0002"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      พนักงานขาย (Salesperson)
                    </label>
                    <input
                      type="text"
                      value={formSalesPerson}
                      onChange={(e) => setFormSalesPerson(e.target.value)}
                      placeholder="Admin"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ลูกค้าค้าส่ง (Wholesale Customer) <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={customerOptions}
                      value={formCustomerId}
                      onChange={handleCustomerSelect}
                      placeholder="Select Customer..."
                      showSelectOption={true}
                      selectOptionLabel="Select B2B Customer..."
                      size="sm"
                    />
                  </div>

                  {/* Customer Credit Information Card */}
                  {selectedCustomer && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-800 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          สถานะวงเงินสินเชื่อลูกหนี้ ({selectedCustomer.name})
                        </span>
                        <span className="text-[11px] text-gray-500">
                          เครดิตเทอมปกติ: <strong>{selectedCustomer.creditTermDays || 0} วัน</strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                          <span className="text-gray-400 block text-[10px]">วงเงินที่อนุมัติ</span>
                          <span className="font-bold text-gray-900">
                            ฿{(selectedCustomer.creditLimit || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                          <span className="text-gray-400 block text-[10px]">หนี้ค้างชำระปัจจุบัน</span>
                          <span className="font-bold text-rose-600">
                            ฿{(selectedCustomer.currentCreditUsed || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                          <span className="text-gray-400 block text-[10px]">วงเงินคงเหลือ</span>
                          <span className="font-bold text-emerald-600">
                            ฿{customerRemainingCredit.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เงื่อนไขเครดิตเทอม (Credit Term Days)
                    </label>
                    <SearchableSelect
                      options={[
                        { value: "0", label: "เงินสด (Cash)" },
                        { value: "15", label: "เครดิต 15 วัน" },
                        { value: "30", label: "เครดิต 30 วัน" },
                        { value: "45", label: "เครดิต 45 วัน" },
                        { value: "60", label: "เครดิต 60 วัน" },
                        { value: "90", label: "เครดิต 90 วัน" },
                      ]}
                      value={String(formCreditTermDays)}
                      onChange={(val) => setFormCreditTermDays(Number(val))}
                      showSelectOption={false}
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      กำหนดส่งมอบสินค้า (Delivery Date)
                    </label>
                    <input
                      type="date"
                      value={formDeliveryDate}
                      onChange={(e) => setFormDeliveryDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#FE9F43]" />
                      รายการสินค้าที่สั่งซื้อ (Order Items)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="px-2 py-1 bg-white hover:bg-gray-100 text-[#FE9F43] border border-orange-200 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ เพิ่มสินค้า</span>
                    </button>
                  </div>

                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-2xs">
                      <div className="flex-1">
                        <SearchableSelect
                          options={productOptions}
                          value={item.productId}
                          onChange={(val) => handleItemProductSelect(idx, val)}
                          placeholder="Select Product..."
                          showSelectOption={true}
                          selectOptionLabel="Select Product..."
                          size="sm"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemFieldChange(idx, "quantity", Number(e.target.value))}
                          placeholder="จำนวน"
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#FE9F43]"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleItemFieldChange(idx, "unitPrice", Number(e.target.value))}
                          placeholder="ราคา/หน่วย"
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#FE9F43]"
                        />
                      </div>
                      <div className="w-24 text-right">
                        <span className="text-xs font-bold text-gray-900">
                          ฿{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={formItems.length === 1}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded disabled:opacity-30 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>ยอดรวมสินค้า (Subtotal):</span>
                    <span>฿{formSubtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                    <div className="flex items-center space-x-2">
                      <select
                        value={formTaxRate}
                        onChange={(e) => setFormTaxRate(Number(e.target.value))}
                        className="px-2 py-0.5 border border-gray-200 rounded text-[11px]"
                      >
                        <option value={0}>0% (ไม่รวมภาษี)</option>
                        <option value={7}>7% (รวมภาษี VAT)</option>
                      </select>
                      <span>฿{formTaxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5 text-sm">
                    <span>ยอดสุทธิทั้งสิ้น (Net Total):</span>
                    <span className="text-[#FE9F43]">
                      ฿{formTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Over Limit Warning Banner */}
                {isFormOverCreditLimit && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-800 text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">คำเตือน: คำสั่งซื้อนี้เกินวงเงินสินเชื่อของลูกค้า!</span>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        ยอดสั่งซื้อ ฿{formTotal.toLocaleString()} เกินวงเงินคงเหลือ (฿{customerRemainingCredit.toLocaleString()}) ไปจำนวน{" "}
                        <strong>฿{(formTotal - customerRemainingCredit).toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ที่อยู่จัดส่งสินค้า (Delivery Address)
                  </label>
                  <textarea
                    rows={2}
                    value={formDeliveryAddress}
                    onChange={(e) => setFormDeliveryAddress(e.target.value)}
                    placeholder="ที่อยู่จัดส่ง..."
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : "Create Sales Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW SALES ORDER DETAILS MODAL                            */}
        {/* ========================================================= */}
        {viewOrder && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{viewOrder.orderNo}</h3>
                    <p className="text-[11px] text-gray-400">ใบสั่งขาย (Sales Order Voucher)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    title="Print Voucher"
                    onClick={() => window.print()}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewOrder(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px]">ลูกค้า</span>
                    <span className="font-bold text-gray-800">{viewOrder.customerName}</span>
                    {viewOrder.customer?.taxId && (
                      <span className="text-[10px] text-gray-400 block">TAX: {viewOrder.customer.taxId}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">เงื่อนไขการชำระ</span>
                    <span className="font-bold text-purple-700">
                      {viewOrder.creditTermDays > 0 ? `เครดิต ${viewOrder.creditTermDays} วัน` : "เงินสด"}
                    </span>
                    {viewOrder.dueDate && (
                      <span className="text-[10px] text-gray-500 block">
                        ครบกำหนด: {new Date(viewOrder.dueDate).toLocaleDateString("th-TH")}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">สถานะคำสั่งขาย</span>
                    <span className="font-bold text-gray-800">{viewOrder.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">สถานะการชำระ</span>
                    <span className="font-bold text-amber-600">{viewOrder.paymentStatus}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-800">รายการสินค้า:</h4>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {viewOrder.items?.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50">
                        <div>
                          <span className="font-semibold text-gray-800 block">{it.productName}</span>
                          <span className="text-[10px] text-gray-400">
                            {it.quantity} {it.unit} @ ฿{it.unitPrice.toFixed(2)}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">
                          ฿{it.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl flex items-center justify-between font-bold text-sm">
                  <span>ยอดสุทธิทั้งสิ้น:</span>
                  <span className="text-[#FE9F43]">
                    ฿{viewOrder.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {viewOrder.deliveryAddress && (
                  <div className="text-[11px] text-gray-500">
                    <span className="font-bold block text-gray-700">สถานที่ส่งมอบ:</span>
                    {viewOrder.deliveryAddress}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewOrder(null)}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DELETE CONFIRMATION MODAL (GEMINI.md Step 1: Rose Trash2)  */}
        {/* ========================================================= */}
        {deletingOrder && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Sales Order?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  คุณแน่ใจหรือไม่ว่าต้องการลบใบสั่งขาย <strong>&quot;{deletingOrder.orderNo}&quot;</strong>? ระบบจะคืนวงเงินสินเชื่อเข้าบัญชีลูกค้าให้อัตโนมัติ
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingOrder(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ACTION FEEDBACK / ALERT MODAL (GEMINI.md Standard)        */}
        {/* ========================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-150">
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

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feedbackModal.message}</p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                {feedbackModal.type === "add_success" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        handleOpenAddModal();
                      }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      + Add Another
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="flex-1 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                    className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                      feedbackModal.type === "error"
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "bg-[#FE9F43] hover:bg-[#E88B32]"
                    }`}
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

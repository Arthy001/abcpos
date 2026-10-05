"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Order } from "@/types";
import { fetchOrders, voidOrderApi } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  Search,
  RotateCcw,
  Eye,
  Printer,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ShoppingCart,
  Banknote,
  QrCode,
  CreditCard,
  Receipt,
  DollarSign,
  Package,
} from "lucide-react";
import Link from "next/link";

interface PosOrdersManagerProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const PosOrdersManager: React.FC<PosOrdersManagerProps> = ({
  pageTitle = "POS Orders & Receipts",
  pageSubtitle = "Complete sales history and receipt re-printing from POS terminals",
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Order for Receipt Modal
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Voiding Order State
  const [voidingOrder, setVoidingOrder] = useState<Order | null>(null);
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "delete_success",
    title: "",
    message: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Orders",
        message: err.message || "An unexpected error occurred while fetching orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(search.toLowerCase())) ||
        (o.cashierName && o.cashierName.toLowerCase().includes(search.toLowerCase()));

      const matchesMethod =
        paymentMethodFilter === "all" || o.paymentMethod.toUpperCase() === paymentMethodFilter.toUpperCase();

      const matchesStatus =
        statusFilter === "all" || o.paymentStatus.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [orders, search, paymentMethodFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalCount = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
    const cancelledOrders = orders.filter((o) => o.paymentStatus === "CANCELLED");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalCount,
      paidCount: paidOrders.length,
      cancelledCount: cancelledOrders.length,
      totalRevenue,
    };
  }, [orders]);

  // Handle Voiding Order
  const handleConfirmVoid = async () => {
    if (!voidingOrder) return;
    try {
      setIsVoiding(true);
      await voidOrderApi(voidingOrder.id);
      setVoidingOrder(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Order Voided!",
        message: `Order #${voidingOrder.orderNumber} was successfully cancelled and all items have been restored to inventory.`,
      });
      loadData();
    } catch (err: any) {
      setVoidingOrder(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Void Failed",
        message: err.message || "Failed to void the selected order.",
      });
    } finally {
      setIsVoiding(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ["Order Number", "Date", "Customer", "Cashier", "Payment Method", "Items Count", "Subtotal", "Tax", "Discount", "Total", "Status"];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.customer?.name || "Walk-in Customer"}"`,
      `"${o.cashierName || "Admin"}"`,
      `"${o.paymentMethod}"`,
      o.items?.length || 0,
      o.subtotal,
      o.tax,
      o.discount,
      o.total,
      `"${o.paymentStatus}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pos_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
            <p className="text-xs text-gray-500 mt-1">{pageSubtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : "text-gray-500"}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/pos"
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open POS</span>
            </Link>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total POS Orders</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{summaryMetrics.totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">POS Revenue (Paid)</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                ฿{summaryMetrics.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Completed / Paid</p>
              <h3 className="text-xl font-bold text-emerald-600 mt-1">{summaryMetrics.paidCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Voided / Cancelled</p>
              <h3 className="text-xl font-bold text-rose-600 mt-1">{summaryMetrics.cancelledCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by order #, customer, or cashier..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white text-gray-700"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Payment Method Filter */}
            <div className="w-full md:w-52">
              <SearchableSelect
                placeholder="All Payment Methods"
                options={[
                  { label: "All Payment Methods", value: "all" },
                  { label: "Cash", value: "CASH" },
                  { label: "PromptPay QR", value: "PROMPTPAY" },
                  { label: "Credit Card", value: "CREDIT_CARD" },
                ]}
                value={paymentMethodFilter}
                onChange={(val) => {
                  setPaymentMethodFilter(val);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <SearchableSelect
                placeholder="All Statuses"
                options={[
                  { label: "All Statuses", value: "all" },
                  { label: "PAID", value: "PAID" },
                  { label: "CANCELLED", value: "CANCELLED" },
                ]}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Cashier</th>
                  <th className="px-4 py-3.5">Items Purchased</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Order Number */}
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-md text-gray-800 text-[11px]">
                        {order.orderNumber}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}{" "}
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      {order.customer?.name || "Walk-in Customer"}
                    </td>

                    {/* Cashier */}
                    <td className="px-4 py-3.5 text-gray-500">{order.cashierName || "Admin"}</td>

                    {/* Items */}
                    <td className="px-4 py-3.5">
                      <div className="max-w-[200px] truncate" title={order.items?.map((i) => `${i.productName} (${i.quantity})`).join(", ")}>
                        <span className="font-semibold text-gray-700">{order.items?.length || 0} items: </span>
                        <span className="text-gray-400 text-[11px]">
                          {order.items?.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                        </span>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">
                        {order.paymentMethod === "CASH" && <Banknote className="w-3 h-3 mr-1 text-emerald-600" />}
                        {order.paymentMethod === "PROMPTPAY" && <QrCode className="w-3 h-3 mr-1 text-blue-600" />}
                        {order.paymentMethod === "CREDIT_CARD" && <CreditCard className="w-3 h-3 mr-1 text-purple-600" />}
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-4 py-3.5 font-extrabold text-gray-900 text-sm">
                      ฿{Number(order.total).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {order.paymentStatus === "PAID" ? (
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        ) : (
                          <RotateCcw className="w-3 h-3 mr-1 text-rose-500" />
                        )}
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Actions: View (Eye) -> Print (Printer) -> Void (RotateCcw) */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedReceiptOrder(order)}
                          title="View & Reprint Receipt"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedReceiptOrder(order)}
                          title="Print Receipt Slip"
                          className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {order.paymentStatus !== "CANCELLED" && (
                          <button
                            onClick={() => setVoidingOrder(order)}
                            title="Void Order & Restore Stock"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedOrders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">
                      No POS orders found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries per page (Total {filteredOrders.length})</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THERMAL RECEIPT SLIP MODAL (58mm / 80mm THERMAL PRINTER STYLING) */}
        {/* ========================================================================= */}
        {selectedReceiptOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2 text-gray-800">
                  <Receipt className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold">POS Receipt Slip</h3>
                </div>
                <button
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Receipt Paper */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 font-mono text-xs text-gray-800 space-y-3">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-extrabold tracking-tight text-gray-900">ABC POS RETAIL</h2>
                  <p className="text-[10px] text-gray-500">123 Business Avenue, Bangkok</p>
                  <p className="text-[10px] text-gray-500">Tel: +66 2 123 4567 | TAX ID: 0105558123456</p>
                  <div className="border-b border-dashed border-gray-300 my-2"></div>
                  <p className="font-bold text-gray-900 text-xs">TAX INVOICE / RECEIPT (ABB)</p>
                  <p className="text-[11px] text-gray-600">Order: {selectedReceiptOrder.orderNumber}</p>
                  <p className="text-[10px] text-gray-500">
                    Date: {new Date(selectedReceiptOrder.createdAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Cashier: {selectedReceiptOrder.cashierName || "Admin"} | Customer: {selectedReceiptOrder.customer?.name || "Walk-in"}
                  </p>
                </div>

                <div className="border-b border-dashed border-gray-300 my-2"></div>

                {/* Items */}
                <div className="divide-y divide-gray-200/50 space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedReceiptOrder.items?.map((item, idx) => (
                    <div key={idx} className="pt-1.5 flex justify-between text-[11px]">
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-gray-900 line-clamp-1">{item.productName}</p>
                        <p className="text-gray-500 text-[10px]">
                          {item.quantity} x ฿{item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-right">
                        ฿{item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-gray-300 my-2"></div>

                {/* Summary */}
                <div className="space-y-1 text-[11px] text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>฿{selectedReceiptOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedReceiptOrder.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span>-฿{selectedReceiptOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT (7% Included):</span>
                    <span>฿{selectedReceiptOrder.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-1 border-t border-dashed border-gray-300">
                    <span>Total Amount:</span>
                    <span className="text-orange-600">฿{selectedReceiptOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                    <span>Payment Method:</span>
                    <span className="font-bold uppercase text-gray-800">{selectedReceiptOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Status:</span>
                    <span className={`font-bold ${selectedReceiptOrder.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedReceiptOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="border-b border-dashed border-gray-300 my-2"></div>
                <div className="text-center text-[10px] text-gray-400">
                  <p>*** THANK YOU FOR SHOPPING WITH US ***</p>
                  <p className="mt-0.5">Please keep this receipt for warranty and returns</p>
                </div>
              </div>

              {/* Print Action Button */}
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VOID ORDER CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {voidingOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <Trash2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">Void POS Order?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to void order{" "}
                  <strong className="text-gray-800">#{voidingOrder.orderNumber}</strong>?
                  <br />
                  All purchased items will be returned to inventory stock automatically.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setVoidingOrder(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isVoiding}
                  onClick={handleConfirmVoid}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  {isVoiding ? "Voiding..." : "Confirm Void"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEEDBACK MODAL (RULE 3 COMPLIANT) */}
        {/* ========================================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
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
                <button
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

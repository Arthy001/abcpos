"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PurchaseOrderItem, Supplier, Product, Warehouse } from "@/types";
import {
  fetchPurchaseOrders,
  fetchSuppliers,
  fetchProducts,
  fetchWarehouses,
  createPurchaseApi,
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
  Package,
  Boxes,
} from "lucide-react";

export default function PurchaseOrderPage() {
  const { user, isAdmin, canManageWarehouse } = useAuthStore();
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
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

  // Add PO Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("Lavish Warehouse");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [orderQty, setOrderQty] = useState<number>(20);
  const [orderUnitCost, setOrderUnitCost] = useState<number>(50);
  const [orderStatus, setOrderStatus] = useState<string>("RECEIVED");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal State
  const [viewOrder, setViewOrder] = useState<PurchaseOrderItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderData, supData, prodData, whData] = await Promise.all([
        fetchPurchaseOrders({ search }),
        fetchSuppliers(),
        fetchProducts(),
        fetchWarehouses(),
      ]);
      setOrders(orderData || []);
      setSuppliers(supData || []);
      setProducts(prodData || []);
      setWarehouses(whData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Purchase Orders",
        message: err.message || "An error occurred while loading purchase order items.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.product.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(search.toLowerCase());

      const matchesSupplier =
        supplierFilter === "all" || item.supplier === supplierFilter;
      const matchesProduct =
        productFilter === "all" || item.product === productFilter;
      const matchesStatus =
        statusFilter === "all" || item.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesSupplier && matchesProduct && matchesStatus;
    });
  }, [orders, search, supplierFilter, productFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
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
    setSelectedSupplier(suppliers.length > 0 ? suppliers[0].name : "");
    setSelectedWarehouse(user?.warehouseName || (warehouses.length > 0 ? warehouses[0].name : "Lavish Warehouse"));
    if (products.length > 0) {
      setSelectedProduct(products[0].name);
      setOrderUnitCost(products[0].costPrice || 50);
    } else {
      setSelectedProduct("");
      setOrderUnitCost(50);
    }
    setOrderQty(20);
    setOrderStatus("RECEIVED");
    setShowAddModal(true);
  };

  // Quick Create Purchase Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedProduct) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please select both a Supplier and a Product.",
      });
      return;
    }

    if (!canManageWarehouse(selectedWarehouse) && !isAdmin()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Permission Denied (สิทธิ์การจัดการคลัง)",
        message: `คุณสังกัดคลัง "${user?.warehouseName}" ไม่ได้รับอนุญาตให้สั่งซื้อ/รับสินค้าเข้าคลัง "${selectedWarehouse}"`,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const prod = products.find((p) => p.name === selectedProduct);
      const subtotal = orderQty * orderUnitCost;
      const taxAmount = (subtotal * 7) / 100;
      const total = subtotal + taxAmount;
      const refNo = `PO-${Math.floor(100000 + Math.random() * 900000)}`;

      await createPurchaseApi({
        reference: refNo,
        supplierName: selectedSupplier,
        warehouseName: selectedWarehouse,
        status: orderStatus,
        paymentStatus: "PAID",
        subtotal,
        tax: 7,
        total,
        paid: total,
        due: 0,
        items: [
          {
            productId: prod ? prod.id : null,
            productName: selectedProduct,
            productImage: prod?.image || "/assets/images/product-01.jpg",
            sku: prod?.sku || "SKU-PO",
            quantity: Number(orderQty),
            receivedQty: Number(orderQty),
            unitCost: Number(orderUnitCost),
            subtotal,
            total,
          },
        ],
      });

      setShowAddModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Purchase Order Created!",
        message: `Order for ${orderQty} units of "${selectedProduct}" has been placed with ${selectedSupplier} (${orderStatus === "RECEIVED" ? "Stock added to inventory" : "Pending delivery"}).`,
        itemName: selectedProduct,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to create purchase order.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["Product", "SKU", "Supplier", "Purchased Amount", "Purchased Qty", "In-stock Qty", "Status"];
    const rows = filteredOrders.map((o) => [
      `"${o.product}"`,
      `"${o.sku}"`,
      `"${o.supplier}"`,
      `"${o.purchasedAmount}"`,
      o.purchasedQty,
      o.instockQty,
      o.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchase_orders_${new Date().toISOString().split("T")[0]}.csv`);
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Purchase Order</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage and review purchased item quantities and order status</p>
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

            {/* + Add Purchase Order Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Purchase Order</span>
            </button>

            {/* Import Button */}
            <button
              onClick={() => alert("CSV/Excel Import feature ready. Please upload a structured PO spreadsheet.")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import PO</span>
            </button>
          </div>
        </div>

        {/* Orders Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & 3 Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder="Search product, SKU..."
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
                    ...Array.from(new Set(orders.map((o) => o.product))).map((p) => ({
                      value: p,
                      label: p,
                    })),
                  ]}
                />
              </div>

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
                    { value: "PENDING", label: "Pending" },
                    { value: "ORDERED", label: "Ordered" },
                    { value: "RECEIVED", label: "Received" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[300px] -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827] min-w-[180px]">Product Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">SKU</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Supplier</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Purchased Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Purchased QTY</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Instock QTY</th>
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
                        <span>Loading purchase orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Boxes className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        <p className="text-sm font-medium text-gray-500">No purchase order items found</p>
                        <p className="text-xs text-gray-400">Click "+ Add Purchase Order" to create a new order</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((item) => {
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
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.product}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span className="truncate max-w-[180px]">{item.product}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">{item.sku}</td>

                        <td className="py-3.5 px-4 text-[#64748B]">{item.supplier}</td>

                        <td className="py-3.5 px-4 font-bold text-[#1E293B]">{item.purchasedAmount}</td>

                        <td className="py-3.5 px-4 text-[#1E293B] font-bold">
                          {item.purchasedQty} <span className="text-[10px] font-normal text-gray-400">units</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              item.instockQty > 10
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.instockQty > 0
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {item.instockQty} units
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "RECEIVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {item.status || "RECEIVED"}
                          </span>
                        </td>

                        {/* Action Buttons: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* View Button */}
                            <button
                              onClick={() => setViewOrder(item)}
                              title="View Order Item Breakdown"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                alert(`Editing purchase order item "${item.product}". Redirecting to Purchase Management...`);
                              }}
                              title="Edit Order"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Remove order item "${item.product}"?`)) {
                                  setOrders(orders.filter((o) => o.id !== item.id));
                                  setFeedbackModal({
                                    isOpen: true,
                                    type: "delete_success",
                                    title: "Item Removed!",
                                    message: `Item "${item.product}" has been removed from order list.`,
                                    itemName: item.product,
                                  });
                                }
                              }}
                              title="Delete Item"
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
              <span>Entries • Total {filteredOrders.length} order lines</span>
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
        {/* ADD PURCHASE ORDER MODAL */}
        {/* ========================================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Create Purchase Order (PO)</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    Product Item <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    placeholder="Select Product..."
                    value={selectedProduct}
                    onChange={(val) => {
                      setSelectedProduct(val);
                      const prod = products.find((p) => p.name === val);
                      if (prod && prod.costPrice) setOrderUnitCost(prod.costPrice);
                    }}
                    options={products.map((p) => ({ value: p.name, label: `${p.name} (${p.sku})` }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Supplier..."
                      value={selectedSupplier}
                      onChange={(val) => setSelectedSupplier(val)}
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
                      value={selectedWarehouse}
                      onChange={(val) => {
                        if (!canManageWarehouse(val) && !isAdmin()) {
                          setFeedbackModal({
                            isOpen: true,
                            type: "error",
                            title: "Permission Denied (สิทธิ์การจัดการคลัง)",
                            message: `คุณสังกัดคลัง "${user?.warehouseName}" สามารถสั่งซื้อ/รับสินค้าเข้าได้เฉพาะคลังของตนเองเท่านั้น`,
                          });
                          return;
                        }
                        setSelectedWarehouse(val);
                      }}
                      options={
                        !isAdmin() && user?.warehouseName
                          ? [{ value: user.warehouseName, label: `${user.warehouseName} (คลังที่คุณรับผิดชอบ)` }]
                          : warehouses.map((w) => ({ value: w.name, label: w.name }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Order Quantity</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={orderQty}
                      onChange={(e) => setOrderQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Unit Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      value={orderUnitCost}
                      onChange={(e) => setOrderUnitCost(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Status</label>
                  <SearchableSelect
                    placeholder="Select Status..."
                    value={orderStatus}
                    onChange={(val) => setOrderStatus(val)}
                    options={[
                      { value: "PENDING", label: "Pending (Draft / Await Delivery)" },
                      { value: "ORDERED", label: "Ordered (PO Placed)" },
                      { value: "RECEIVED", label: "Received (Ingest Stock Immediately)" },
                    ]}
                  />
                </div>

                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">Estimated Total (incl. 7% VAT):</span>
                  <span className="text-base font-bold text-[#FE9F43]">
                    ${(orderQty * orderUnitCost * 1.07).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? "Creating..." : "Create Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW ITEM BREAKDOWN MODAL */}
        {/* ========================================================================= */}
        {viewOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{viewOrder.product}</h3>
                    <p className="text-xs text-gray-400 font-mono">SKU: {viewOrder.sku}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewOrder(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Supplier</span>
                    <p className="font-bold text-gray-800">{viewOrder.supplier}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Order Status</span>
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {viewOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Purchased Quantity</span>
                    <p className="font-bold text-gray-900 text-sm">{viewOrder.purchasedQty} Units</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 font-medium">Total Amount</span>
                    <p className="font-bold text-[#FE9F43] text-sm">{viewOrder.purchasedAmount}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="text-xs text-blue-900 font-semibold">Current In-Stock Quantity:</span>
                  <span className="text-sm font-bold text-blue-800">{viewOrder.instockQty} units</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 border border-gray-200 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewOrder(null)}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
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

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Purchase,
  WorkOrder,
  GoodsReceiptNote,
  Warehouse,
} from "@/types";
import {
  fetchPurchases,
  getWorkOrdersApi,
  fetchGoodsReceiptNotesApi,
  receivePurchaseGoodsApi,
  receiveWorkOrderGoodsApi,
  fetchWarehouses,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PackageCheck,
  Download,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Eye,
  Trash2,
  X,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Factory,
  Boxes,
  Truck,
  Building2,
  Calendar,
  User,
  Inbox,
  Clock,
  Check,
} from "lucide-react";

export default function GoodsReceiptsPage() {
  const { user } = useAuthStore();

  // Active Tab: "po" | "wo" | "history"
  const [activeTab, setActiveTab] = useState<"po" | "wo" | "history">("po");

  // Data states
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [grnList, setGrnList] = useState<GoodsReceiptNote[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // ==========================================
  // 1. PO RECEIVE MODAL STATE
  // ==========================================
  const [receivingPurchase, setReceivingPurchase] = useState<Purchase | null>(null);
  const [poReceiveItems, setPoReceiveItems] = useState<
    Array<{
      purchaseItemId: string;
      productName: string;
      sku: string;
      orderedQty: number;
      previouslyReceived: number;
      remainingQty: number;
      receivedQty: number;
      rejectedQty: number;
      rejectReason: string;
    }>
  >([]);
  const [poTargetWarehouse, setPoTargetWarehouse] = useState<string>("Lavish Warehouse");
  const [poReceiverName, setPoReceiverName] = useState<string>(user?.name || "Store Admin");
  const [poNotes, setPoNotes] = useState<string>("");
  const [isSubmittingPO, setIsSubmittingPO] = useState<boolean>(false);

  // ==========================================
  // 2. WORK ORDER RECEIVE MODAL STATE
  // ==========================================
  const [receivingWorkOrder, setReceivingWorkOrder] = useState<WorkOrder | null>(null);
  const [woReceivedQty, setWoReceivedQty] = useState<number>(0);
  const [woRejectedQty, setWoRejectedQty] = useState<number>(0);
  const [woRejectReason, setWoRejectReason] = useState<string>("");
  const [woTargetWarehouse, setWoTargetWarehouse] = useState<string>("Lavish Warehouse");
  const [woReceiverName, setWoReceiverName] = useState<string>(user?.name || "Store Admin");
  const [woNotes, setWoNotes] = useState<string>("");
  const [isSubmittingWO, setIsSubmittingWO] = useState<boolean>(false);

  // ==========================================
  // 3. VIEW GRN SLIP MODAL STATE
  // ==========================================
  const [viewingGrn, setViewingGrn] = useState<GoodsReceiptNote | null>(null);

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      const [purchasesData, woData, grnsData, whData] = await Promise.all([
        fetchPurchases({ search }),
        getWorkOrdersApi().catch(() => []),
        fetchGoodsReceiptNotesApi({ search }).catch(() => []),
        fetchWarehouses().catch(() => []),
      ]);

      setPurchases(purchasesData || []);
      setWorkOrders(woData || []);
      setGrnList(grnsData || []);
      setWarehouses(whData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Data",
        message: err.message || "An error occurred while loading receiving data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearch("");
    setWarehouseFilter("all");
    setStatusFilter("all");
  }, [activeTab]);

  // ==========================================
  // FILTERING LOGIC PER TAB
  // ==========================================

  // Tab 1: POs to receive (Ordered & Partial Received)
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      // Must not be CANCELLED
      if (p.status === "CANCELLED") return false;

      // By default show pending receipts, or respect status filter
      if (statusFilter === "all") {
        // show non-fully received by default, or all
      } else if (statusFilter === "PENDING_RECEIPT") {
        if (p.status === "RECEIVED") return false;
      } else if (p.status !== statusFilter) {
        return false;
      }

      if (warehouseFilter !== "all" && p.warehouseName !== warehouseFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchRef = p.reference.toLowerCase().includes(q);
        const matchSup = p.supplierName.toLowerCase().includes(q);
        const matchWh = (p.warehouseName || "").toLowerCase().includes(q);
        return matchRef || matchSup || matchWh;
      }

      return true;
    });
  }, [purchases, statusFilter, warehouseFilter, search]);

  // Tab 2: Work Orders to receive (Confirmed & In Progress)
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      if (wo.status === "CANCELLED") return false;

      if (statusFilter !== "all") {
        if (wo.status !== statusFilter) return false;
      }

      if (warehouseFilter !== "all" && wo.warehouse?.name !== warehouseFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNo = wo.orderNo.toLowerCase().includes(q);
        const matchProd = (wo.finishedProduct?.name || "").toLowerCase().includes(q);
        const matchSku = (wo.finishedProduct?.sku || "").toLowerCase().includes(q);
        return matchNo || matchProd || matchSku;
      }

      return true;
    });
  }, [workOrders, statusFilter, warehouseFilter, search]);

  // Tab 3: GRN History
  const filteredGrns = useMemo(() => {
    return grnList.filter((grn) => {
      if (warehouseFilter !== "all" && grn.warehouseName !== warehouseFilter) {
        return false;
      }

      if (statusFilter !== "all") {
        if (statusFilter === "PO" && grn.type !== "PO") return false;
        if (statusFilter === "WORK_ORDER" && grn.type !== "WORK_ORDER") return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNo = grn.grnNumber.toLowerCase().includes(q);
        const matchRef = (grn.purchaseRef || "").toLowerCase().includes(q);
        const matchSup = (grn.supplierName || "").toLowerCase().includes(q);
        const matchWh = grn.warehouseName.toLowerCase().includes(q);
        return matchNo || matchRef || matchSup || matchWh;
      }

      return true;
    });
  }, [grnList, warehouseFilter, statusFilter, search]);

  // Pagination for current active tab
  const activeListLength =
    activeTab === "po"
      ? filteredPurchases.length
      : activeTab === "wo"
      ? filteredWorkOrders.length
      : filteredGrns.length;

  const totalPages = Math.ceil(activeListLength / pageSize) || 1;

  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPurchases.slice(start, start + pageSize);
  }, [filteredPurchases, currentPage, pageSize]);

  const paginatedWorkOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWorkOrders.slice(start, start + pageSize);
  }, [filteredWorkOrders, currentPage, pageSize]);

  const paginatedGrns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGrns.slice(start, start + pageSize);
  }, [filteredGrns, currentPage, pageSize]);

  // ==========================================
  // HANDLERS: PO RECEIVING
  // ==========================================
  const handleOpenPoReceiveModal = (p: Purchase) => {
    setReceivingPurchase(p);
    setPoTargetWarehouse(p.warehouseName || "Lavish Warehouse");
    setPoReceiverName(user?.name || "Store Admin");
    setPoNotes("");

    // Calculate remaining for each item
    const items = (p.items || []).map((it) => {
      const previouslyRec = Number(it.receivedQty || 0);
      const remaining = Math.max(0, it.quantity - previouslyRec);
      return {
        purchaseItemId: it.id || "",
        productName: it.productName,
        sku: it.sku || "N/A",
        orderedQty: it.quantity,
        previouslyReceived: previouslyRec,
        remainingQty: remaining,
        receivedQty: remaining, // default to receiving the rest
        rejectedQty: 0,
        rejectReason: "",
      };
    });
    setPoReceiveItems(items);
  };

  const handleSubmitPoReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPurchase) return;

    try {
      setIsSubmittingPO(true);

      const payload = {
        items: poReceiveItems.map((it) => ({
          purchaseItemId: it.purchaseItemId,
          receivedQty: Number(it.receivedQty) || 0,
          rejectedQty: Number(it.rejectedQty) || 0,
          rejectReason: it.rejectReason || undefined,
        })),
        warehouseName: poTargetWarehouse,
        receivedBy: poReceiverName,
        notes: poNotes,
      };

      const res = await receivePurchaseGoodsApi(receivingPurchase.id, payload);

      setReceivingPurchase(null);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Goods Receipt Created!",
        message: `Successfully received goods for ${receivingPurchase.reference}. Stock has been updated in ${poTargetWarehouse}.`,
        itemName: res.data?.grnNumber || "GRN",
      });

      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Receipt Failed",
        message: err.message || "Failed to record goods receipt.",
      });
    } finally {
      setIsSubmittingPO(false);
    }
  };

  // ==========================================
  // HANDLERS: WORK ORDER RECEIVING
  // ==========================================
  const handleOpenWoReceiveModal = (wo: WorkOrder) => {
    setReceivingWorkOrder(wo);
    const remaining = Math.max(0, wo.targetQty - (wo.producedQty || 0) - (wo.scrapQty || 0));
    setWoReceivedQty(remaining);
    setWoRejectedQty(0);
    setWoRejectReason("");
    setWoTargetWarehouse(wo.warehouse?.name || "Lavish Warehouse");
    setWoReceiverName(user?.name || "Store Admin");
    setWoNotes("");
  };

  const handleSubmitWoReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingWorkOrder) return;

    try {
      setIsSubmittingWO(true);

      const payload = {
        receivedQty: Number(woReceivedQty) || 0,
        rejectedQty: Number(woRejectedQty) || 0,
        rejectReason: woRejectReason,
        warehouseName: woTargetWarehouse,
        receivedBy: woReceiverName,
        notes: woNotes,
      };

      const res = await receiveWorkOrderGoodsApi(receivingWorkOrder.id, payload);

      setReceivingWorkOrder(null);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Finished Goods Received!",
        message: `Received ${woReceivedQty} units of "${receivingWorkOrder.finishedProduct?.name}" into ${woTargetWarehouse}.`,
        itemName: res.data?.grnNumber || "FGRN",
      });

      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Receipt Failed",
        message: err.message || "Failed to receive work order goods.",
      });
    } finally {
      setIsSubmittingWO(false);
    }
  };

  // ==========================================
  // EXPORT CSV
  // ==========================================
  const exportCSV = () => {
    if (activeTab === "po") {
      const headers = ["PO Reference", "Supplier", "Warehouse", "Date", "Items Count", "Status"];
      const rows = filteredPurchases.map((p) => [
        `"${p.reference}"`,
        `"${p.supplierName}"`,
        `"${p.warehouseName || "N/A"}"`,
        new Date(p.date).toLocaleDateString(),
        p.items?.length || 0,
        p.status,
      ]);
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csv));
      link.setAttribute("download", `po_receipts_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === "wo") {
      const headers = ["Work Order No", "Finished Product", "Target Qty", "Produced Qty", "Scrap Qty", "Status"];
      const rows = filteredWorkOrders.map((wo) => [
        `"${wo.orderNo}"`,
        `"${wo.finishedProduct?.name || "N/A"}"`,
        wo.targetQty,
        wo.producedQty,
        wo.scrapQty,
        wo.status,
      ]);
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csv));
      link.setAttribute("download", `wo_receipts_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ["GRN Number", "Type", "Reference", "Supplier / Source", "Warehouse", "Received Date", "Receiver", "Total Received", "Total Rejected"];
      const rows = filteredGrns.map((g) => [
        `"${g.grnNumber}"`,
        g.type,
        `"${g.purchaseRef || "N/A"}"`,
        `"${g.supplierName || "Internal"}"`,
        `"${g.warehouseName}"`,
        new Date(g.receivedDate).toLocaleDateString(),
        `"${g.receivedBy}"`,
        g.totalReceived,
        g.totalRejected,
      ]);
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csv));
      link.setAttribute("download", `grn_history_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-orange-100 text-[#FE9F43]">
                <PackageCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-[#111827] tracking-tight">
                Goods Receipts (ตรวจรับสินค้าเข้า)
              </h1>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 ml-8">
              ฝ่ายสโตร์ตรวจนับสินค้าจริงจากการสั่งซื้อ (PO) และการผลิต (Work Order) เพื่อนำเข้าสต็อก
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export */}
            <button
              title="Print Table"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel / CSV Export */}
            <button
              title="Export CSV"
              onClick={exportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh Data"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-gray-500 flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E5E7EB] space-x-6">
          <button
            onClick={() => setActiveTab("po")}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-2 cursor-pointer ${
              activeTab === "po"
                ? "text-[#FE9F43] border-b-2 border-[#FE9F43]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>📥 From Purchase Orders (รับจากใบสั่งซื้อ)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "po"
                  ? "bg-orange-100 text-[#FE9F43]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {purchases.filter((p) => p.status !== "RECEIVED" && p.status !== "CANCELLED").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("wo")}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-2 cursor-pointer ${
              activeTab === "wo"
                ? "text-[#FE9F43] border-b-2 border-[#FE9F43]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>🏭 From Work Orders (รับจากการผลิต)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "wo"
                  ? "bg-orange-100 text-[#FE9F43]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {workOrders.filter((w) => w.status !== "COMPLETED" && w.status !== "CANCELLED").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-2 cursor-pointer ${
              activeTab === "history"
                ? "text-[#FE9F43] border-b-2 border-[#FE9F43]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>📄 Receipt History (ประวัติใบตรวจรับ GRN)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "history"
                  ? "bg-orange-100 text-[#FE9F43]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {grnList.length}
            </span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeTab === "po"
                    ? "ค้นหาเลข PO, ซัพพลายเออร์..."
                    : activeTab === "wo"
                    ? "ค้นหาเลข WO, สินค้าสำเร็จรูป..."
                    : "ค้นหาเลข GRN, เอกสารอ้างอิง..."
                }
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50/50 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#FE9F43] focus:bg-white transition-all text-[#111827]"
              />
            </div>

            {/* Warehouse Filter */}
            <div className="w-[180px]">
              <SearchableSelect
                options={[
                  { value: "all", label: "Warehouse: All" },
                  ...warehouses.map((w) => ({ value: w.name, label: w.name })),
                ]}
                value={warehouseFilter}
                onChange={(val) => setWarehouseFilter(val)}
                placeholder="Warehouse: All"
              />
            </div>

            {/* Status Filter */}
            <div className="w-[180px]">
              {activeTab === "po" ? (
                <SearchableSelect
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "PENDING_RECEIPT", label: "รอตรวจรับ (Pending/Ordered)" },
                    { value: "ORDERED", label: "ORDERED" },
                    { value: "PARTIAL_RECEIVED", label: "PARTIAL_RECEIVED" },
                    { value: "RECEIVED", label: "RECEIVED (ครบแล้ว)" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="Status: All"
                />
              ) : activeTab === "wo" ? (
                <SearchableSelect
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "IN_PROGRESS", label: "IN_PROGRESS (กำลังผลิต)" },
                    { value: "CONFIRMED", label: "CONFIRMED (พร้อมรับ)" },
                    { value: "COMPLETED", label: "COMPLETED (ผลิตเสร็จ)" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="Status: All"
                />
              ) : (
                <SearchableSelect
                  options={[
                    { value: "all", label: "Source: All" },
                    { value: "PO", label: "จากสั่งซื้อ (PO)" },
                    { value: "WORK_ORDER", label: "จากสั่งผลิต (Work Order)" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="Source: All"
                />
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            รวมทั้งหมด <span className="font-bold text-[#1E293B]">{activeListLength}</span> รายการ
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: FROM PURCHASE ORDERS TABLE                         */}
        {/* ========================================================= */}
        {activeTab === "po" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                    <th className="py-3 px-4">PO Reference</th>
                    <th className="py-3 px-4">ซัพพลายเออร์ (Supplier)</th>
                    <th className="py-3 px-4">คลังปลายทาง (Warehouse)</th>
                    <th className="py-3 px-4">วันที่สั่ง</th>
                    <th className="py-3 px-4">รายการสินค้า & จำนวน</th>
                    <th className="py-3 px-4">สถานะการรับ</th>
                    <th className="py-3 px-4 text-right">ดำเนินการตรวจรับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        <div className="flex items-center justify-center space-x-2">
                          <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                          <span>กำลังโหลดข้อมูลใบสั่งซื้อ...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium text-gray-500">ไม่พบใบสั่งซื้อที่รอตรวจรับ</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedPurchases.map((p) => {
                      const totalOrdered = (p.items || []).reduce((acc, it) => acc + it.quantity, 0);
                      const totalReceived = (p.items || []).reduce((acc, it) => acc + (it.receivedQty || 0), 0);
                      const isFullyReceived = p.status === "RECEIVED";

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#1E293B]">{p.reference}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1E293B]">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FE9F43] flex items-center justify-center font-bold text-[10px]">
                                {p.supplierName.charAt(0).toUpperCase()}
                              </div>
                              <span>{p.supplierName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{p.warehouseName || "Lavish Warehouse"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(p.date).toLocaleDateString("th-TH", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-700">
                              <span className="font-bold text-[#1E293B]">{p.items?.length || 0}</span> รายการ
                              <span className="text-[11px] text-gray-500 ml-1.5">
                                (รับแล้ว {totalReceived} / สั่ง {totalOrdered})
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === "RECEIVED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : p.status === "PARTIAL_RECEIVED"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {p.status === "RECEIVED"
                                ? "✓ ครบแล้ว (RECEIVED)"
                                : p.status === "PARTIAL_RECEIVED"
                                ? "รับบางส่วน (PARTIAL)"
                                : "รอตรวจรับ (ORDERED)"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isFullyReceived ? (
                              <span className="text-xs text-emerald-600 font-medium">ตรวจรับครบแล้ว</span>
                            ) : (
                              <button
                                onClick={() => handleOpenPoReceiveModal(p)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FE9F43] hover:bg-[#e88d35] text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
                              >
                                <Inbox className="w-3.5 h-3.5" />
                                <span>ตรวจรับสินค้า</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FROM WORK ORDERS TABLE                             */}
        {/* ========================================================= */}
        {activeTab === "wo" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                    <th className="py-3 px-4">Work Order No</th>
                    <th className="py-3 px-4">สินค้าสำเร็จรูป (Finished Product)</th>
                    <th className="py-3 px-4">คลังจัดเก็บ</th>
                    <th className="py-3 px-4">เป้าหมาย (Target)</th>
                    <th className="py-3 px-4">รับแล้ว (Produced)</th>
                    <th className="py-3 px-4">ของเสีย (Scrap)</th>
                    <th className="py-3 px-4">สถานะสั่งผลิต</th>
                    <th className="py-3 px-4 text-right">ดำเนินการตรวจรับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        <div className="flex items-center justify-center space-x-2">
                          <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                          <span>กำลังโหลดข้อมูลสั่งผลิต...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedWorkOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-400">
                        <Factory className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium text-gray-500">ไม่พบคำสั่งผลิตที่รอรับเข้าคลัง</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedWorkOrders.map((wo) => {
                      const isCompleted = wo.status === "COMPLETED";

                      return (
                        <tr key={wo.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#1E293B]">{wo.orderNo}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                <Boxes className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-[#1E293B]">
                                  {wo.finishedProduct?.name || "สินค้าสำเร็จรูป"}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  {wo.finishedProduct?.sku || "SKU-N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {wo.warehouse?.name || "Lavish Warehouse"}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1E293B]">
                            {wo.targetQty} <span className="text-[10px] font-normal text-gray-400">{wo.unit}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600">
                            {wo.producedQty} <span className="text-[10px] font-normal text-gray-400">{wo.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-rose-500 font-bold">
                            {wo.scrapQty} <span className="text-[10px] font-normal text-gray-400">{wo.unit}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                wo.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : wo.status === "IN_PROGRESS"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {wo.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isCompleted ? (
                              <span className="text-xs text-emerald-600 font-medium">ผลิตครบแล้ว</span>
                            ) : (
                              <button
                                onClick={() => handleOpenWoReceiveModal(wo)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
                              >
                                <Factory className="w-3.5 h-3.5" />
                                <span>ตรวจรับเข้าคลัง</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RECEIPT HISTORY TABLE                              */}
        {/* ========================================================= */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                    <th className="py-3 px-4">GRN Number</th>
                    <th className="py-3 px-4">ประเภทที่มา</th>
                    <th className="py-3 px-4">เอกสารอ้างอิง (Ref)</th>
                    <th className="py-3 px-4">ผู้ส่งมอบ / ซัพพลายเออร์</th>
                    <th className="py-3 px-4">คลังจัดเก็บ</th>
                    <th className="py-3 px-4">วันที่ตรวจรับ</th>
                    <th className="py-3 px-4">ผู้ตรวจรับ</th>
                    <th className="py-3 px-4">รับเข้า (ชิ้น)</th>
                    <th className="py-3 px-4">ชำรุด (ชิ้น)</th>
                    <th className="py-3 px-4 text-right">ดูใบตรวจรับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-gray-400">
                        <div className="flex items-center justify-center space-x-2">
                          <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                          <span>กำลังโหลดประวัติใบตรวจรับ...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedGrns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-gray-400">
                        <PackageCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium text-gray-500">ยังไม่มีประวัติการตรวจรับสินค้า</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedGrns.map((grn) => {
                      return (
                        <tr key={grn.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#1E293B]">{grn.grnNumber}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                grn.type === "WORK_ORDER"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {grn.type === "WORK_ORDER" ? "🏭 สั่งผลิต (WO)" : "📥 สั่งซื้อ (PO)"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-600">
                            {grn.purchaseRef || "N/A"}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#1E293B]">
                            {grn.supplierName || "Internal Production"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {grn.warehouseName}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(grn.receivedDate).toLocaleDateString("th-TH", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-medium">
                            {grn.receivedBy}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600">
                            +{grn.totalReceived}
                          </td>
                          <td className="py-3 px-4 font-bold text-rose-500">
                            {grn.totalRejected > 0 ? grn.totalRejected : "-"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setViewingGrn(grn)}
                              title="ดูใบตรวจรับสินค้า (GRN Slip)"
                              className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] inline-flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        {activeListLength > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] pt-2">
            <div className="flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#FE9F43] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded border border-[#E2E8F0] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded border border-[#E2E8F0] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: PO RECEIVING MODAL                               */}
        {/* ========================================================= */}
        {receivingPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-4 px-6 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-orange-100 text-[#FE9F43]">
                    <Inbox className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[#111827]">
                      ตรวจรับสินค้าเข้าคลัง — {receivingPurchase.reference}
                    </h2>
                    <p className="text-xs text-gray-500">
                      ซัพพลายเออร์: <span className="font-semibold text-gray-800">{receivingPurchase.supplierName}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReceivingPurchase(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitPoReceive} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-orange-50/40 p-3.5 rounded-xl border border-orange-100 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      คลังสินค้าปลายทาง (Destination Warehouse) *
                    </label>
                    <SearchableSelect
                      options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
                      value={poTargetWarehouse}
                      onChange={(v) => setPoTargetWarehouse(v)}
                      placeholder="Select Warehouse..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      เจ้าหน้าที่สโตร์ผู้ตรวจรับ (Receiver Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={poReceiverName}
                      onChange={(e) => setPoReceiverName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#FE9F43] bg-white"
                    />
                  </div>
                </div>

                {/* Items to receive table */}
                <div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    รายการสินค้าที่ต้องตรวจนับ (Count & Inspection)
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">สินค้า (Product)</th>
                          <th className="py-2.5 px-3 text-center">ยอดสั่ง</th>
                          <th className="py-2.5 px-3 text-center">รับแล้ว</th>
                          <th className="py-2.5 px-3 text-center">ค้างส่ง</th>
                          <th className="py-2.5 px-3 text-center w-28 bg-emerald-50/50 text-emerald-800">
                            รับรอบนี้ *
                          </th>
                          <th className="py-2.5 px-3 text-center w-24 bg-rose-50/50 text-rose-800">
                            ชำรุด/ปฏิเสธ
                          </th>
                          <th className="py-2.5 px-3">เหตุผลชำรุด</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {poReceiveItems.map((item, index) => (
                          <tr key={item.purchaseItemId} className="hover:bg-gray-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-gray-900">{item.productName}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{item.sku}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-gray-700">
                              {item.orderedQty}
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-500">
                              {item.previouslyReceived}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-amber-600">
                              {item.remainingQty}
                            </td>
                            <td className="py-2.5 px-3 text-center bg-emerald-50/30">
                              <input
                                type="number"
                                min={0}
                                max={item.remainingQty}
                                value={item.receivedQty}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value) || 0);
                                  setPoReceiveItems((prev) =>
                                    prev.map((it, idx) =>
                                      idx === index ? { ...it, receivedQty: val } : it
                                    )
                                  );
                                }}
                                className="w-full text-center py-1 border border-emerald-300 rounded font-bold text-emerald-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center bg-rose-50/30">
                              <input
                                type="number"
                                min={0}
                                value={item.rejectedQty}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value) || 0);
                                  setPoReceiveItems((prev) =>
                                    prev.map((it, idx) =>
                                      idx === index ? { ...it, rejectedQty: val } : it
                                    )
                                  );
                                }}
                                className="w-full text-center py-1 border border-rose-300 rounded font-bold text-rose-700 bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                placeholder={item.rejectedQty > 0 ? "ระบุสาเหตุชำรุด..." : "-"}
                                value={item.rejectReason}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPoReceiveItems((prev) =>
                                    prev.map((it, idx) =>
                                      idx === index ? { ...it, rejectReason: val } : it
                                    )
                                  );
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    หมายเหตุการตรวจรับ (Notes)
                  </label>
                  <textarea
                    rows={2}
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="เช่น รถขนส่งมาส่งเรียบร้อย สินค้าสมบูรณ์ กล่องมีรอยบุบ 1 กล่อง..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReceivingPurchase(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-100 font-medium transition-colors cursor-pointer"
                  >
                    ยกเลิก (Cancel)
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingPO}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#e88d35] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSubmittingPO ? "กำลังบันทึก..." : "ยืนยันการตรวจรับ (Confirm Receipt)"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: WORK ORDER RECEIVING MODAL                       */}
        {/* ========================================================= */}
        {receivingWorkOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-4 px-6 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-emerald-100 text-[#10B981]">
                    <Factory className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[#111827]">
                      ตรวจรับสินค้าสำเร็จรูปจากการผลิต — {receivingWorkOrder.orderNo}
                    </h2>
                    <p className="text-xs text-gray-500">
                      สินค้า: <span className="font-semibold text-gray-800">{receivingWorkOrder.finishedProduct?.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReceivingWorkOrder(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitWoReceive} className="p-6 space-y-4 text-xs">
                {/* Summary Box */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-gray-500">เป้าหมาย (Target)</div>
                    <div className="text-sm font-bold text-gray-900">{receivingWorkOrder.targetQty} {receivingWorkOrder.unit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">รับแล้ว (Produced)</div>
                    <div className="text-sm font-bold text-emerald-600">{receivingWorkOrder.producedQty} {receivingWorkOrder.unit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">คงเหลือค้างผลิต</div>
                    <div className="text-sm font-bold text-amber-600">
                      {Math.max(0, receivingWorkOrder.targetQty - (receivingWorkOrder.producedQty || 0) - (receivingWorkOrder.scrapQty || 0))} {receivingWorkOrder.unit}
                    </div>
                  </div>
                </div>

                {/* Warehouse */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    คลังสินค้าปลายทางจัดเก็บ *
                  </label>
                  <SearchableSelect
                    options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
                    value={woTargetWarehouse}
                    onChange={(v) => setWoTargetWarehouse(v)}
                    placeholder="Select Warehouse..."
                  />
                </div>

                {/* Received & Rejected Qty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-emerald-700 block mb-1">
                      จำนวนที่ตรวจรับเข้าคลัง (ชิ้น) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={woReceivedQty}
                      onChange={(e) => setWoReceivedQty(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-rose-700 block mb-1">
                      ของเสีย / ชำรุด (Scrap)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={woRejectedQty}
                      onChange={(e) => setWoRejectedQty(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-rose-300 rounded-lg text-xs font-bold text-rose-800 bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>
                </div>

                {woRejectedQty > 0 && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      สาเหตุของเสีย / ชำรุด (Scrap Reason)
                    </label>
                    <input
                      type="text"
                      value={woRejectReason}
                      onChange={(e) => setWoRejectReason(e.target.value)}
                      placeholder="เช่น ขอบฉีกขาด, ขนาดไม่ได้มาตรฐาน, ชิ้นงานเป็นตามด..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>
                )}

                {/* Receiver Name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    เจ้าหน้าที่สโตร์ผู้ตรวจรับ (Receiver Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={woReceiverName}
                    onChange={(e) => setWoReceiverName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#FE9F43] bg-white"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    หมายเหตุการรับมอบสินค้าสำเร็จรูป
                  </label>
                  <textarea
                    rows={2}
                    value={woNotes}
                    onChange={(e) => setWoNotes(e.target.value)}
                    placeholder="ระบุข้อความเพิ่มเติม..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReceivingWorkOrder(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-100 font-medium transition-colors cursor-pointer"
                  >
                    ยกเลิก (Cancel)
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingWO}
                    className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSubmittingWO ? "กำลังบันทึก..." : "ยืนยันรับเข้าคลัง (Confirm Ingest)"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: VIEW OFFICIAL GRN SLIP                           */}
        {/* ========================================================= */}
        {viewingGrn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-4 px-6 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-orange-100 text-[#FE9F43]">
                    <PackageCheck className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm font-bold text-[#111827]">
                    ใบตรวจรับสินค้า (Goods Receipt Note Slip)
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-500" />
                    <span>พิมพ์ (Print)</span>
                  </button>
                  <button
                    onClick={() => setViewingGrn(null)}
                    className="w-7 h-7 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-800 font-sans">
                {/* Slip Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#111827] uppercase tracking-wide">
                      GOODS RECEIPT NOTE (ใบรับสินค้า)
                    </h3>
                    <div className="text-gray-500 text-[11px] mt-0.5">ABC POS & Warehouse Management</div>
                    <div className="text-gray-500 text-[11px]">คลังปลายทาง: {viewingGrn.warehouseName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-[#FE9F43]">{viewingGrn.grnNumber}</div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      วันที่:{" "}
                      {new Date(viewingGrn.receivedDate).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-[11px] font-semibold text-gray-600">
                      อ้างอิง: {viewingGrn.purchaseRef || "N/A"} ({viewingGrn.type === "WORK_ORDER" ? "สั่งผลิต" : "สั่งซื้อ"})
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-gray-500">ผู้ส่งมอบ / ซัพพลายเออร์:</span>
                    <div className="font-bold text-gray-900 mt-0.5">
                      {viewingGrn.supplierName || "ฝ่ายผลิตภายใน"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">เจ้าหน้าที่สโตร์ผู้ตรวจรับ:</span>
                    <div className="font-bold text-gray-900 mt-0.5">{viewingGrn.receivedBy}</div>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-600 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2 px-3">ลำดับ</th>
                        <th className="py-2 px-3">รายการสินค้า (Description)</th>
                        <th className="py-2 px-3 text-center">ยอดตามเอกสาร</th>
                        <th className="py-2 px-3 text-center text-emerald-700">รับจริง</th>
                        <th className="py-2 px-3 text-center text-rose-700">ชำรุด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(viewingGrn.items || []).map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="py-2 px-3 text-center text-gray-500">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-gray-900">{it.productName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{it.sku || "-"}</div>
                            {it.rejectReason && (
                              <div className="text-[10px] text-rose-500">เหตุผลชำรุด: {it.rejectReason}</div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-gray-700">{it.orderedQty}</td>
                          <td className="py-2 px-3 text-center font-bold text-emerald-600">+{it.receivedQty}</td>
                          <td className="py-2 px-3 text-center font-bold text-rose-500">{it.rejectedQty || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right">
                          รวมยอดตรวจรับสุทธิ:
                        </td>
                        <td className="py-2 px-3 text-center text-emerald-600 text-sm">
                          +{viewingGrn.totalReceived}
                        </td>
                        <td className="py-2 px-3 text-center text-rose-500 text-sm">
                          {viewingGrn.totalRejected > 0 ? viewingGrn.totalRejected : "-"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Notes */}
                {viewingGrn.notes && (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                    <span className="font-bold text-gray-700">หมายเหตุ: </span>
                    {viewingGrn.notes}
                  </div>
                )}

                {/* Signature Blocks */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200 mt-6">
                  <div className="text-center">
                    <div className="border-b border-gray-300 w-44 mx-auto pb-8 mb-2"></div>
                    <div className="font-bold text-gray-800">ผู้ส่งมอบสินค้า (Delivered By)</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">พนักงานขับรถ / เจ้าหน้าที่ฝ่ายผลิต</div>
                  </div>

                  <div className="text-center">
                    <div className="border-b border-gray-300 w-44 mx-auto pb-8 mb-2"></div>
                    <div className="font-bold text-gray-800">{viewingGrn.receivedBy}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">เจ้าหน้าที่สโตร์ผู้ตรวจรับ (Storekeeper)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FEEDBACK MODAL (Rule #3 Standards)                        */}
        {/* ========================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-emerald-50 text-emerald-600">
                {feedbackModal.type === "add_success" ? (
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                ) : feedbackModal.type === "error" ? (
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                )}
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1">{feedbackModal.title}</h3>
              <p className="text-xs text-gray-600 mb-6">{feedbackModal.message}</p>

              {feedbackModal.type === "add_success" ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setFeedbackModal({ ...feedbackModal, isOpen: false });
                    }}
                    className="flex-1 py-2 px-3 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Add Another
                  </button>
                  <button
                    onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                  className="w-full py-2 px-4 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

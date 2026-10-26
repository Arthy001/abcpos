"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WorkOrder, BillOfMaterial, Product, Warehouse } from "@/types";
import {
  getWorkOrdersApi,
  createWorkOrderApi,
  updateWorkOrderStatusApi,
  deleteWorkOrderApi,
  getBOMsApi,
  fetchProducts,
  fetchWarehouses,
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
  Factory,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
  Play,
  CheckCheck,
  TrendingUp,
  Cpu,
  Layers,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [boms, setBoms] = useState<BillOfMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // Create WO Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formOrderNo, setFormOrderNo] = useState<string>("");
  const [formBomId, setFormBomId] = useState<string>("");
  const [formFinishedProductId, setFormFinishedProductId] = useState<string>("");
  const [formTargetQty, setFormTargetQty] = useState<number>(500);
  const [formUnit, setFormUnit] = useState<string>("kg");
  const [formMachineNo, setFormMachineNo] = useState<string>("Extruder #1");
  const [formOperator, setFormOperator] = useState<string>("Admin");
  const [formWarehouseId, setFormWarehouseId] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Complete Production Modal
  const [completingWO, setCompletingWO] = useState<WorkOrder | null>(null);
  const [completeProducedQty, setCompleteProducedQty] = useState<number>(0);
  const [completeScrapQty, setCompleteScrapQty] = useState<number>(0);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  // View Details Modal
  const [viewWO, setViewWO] = useState<WorkOrder | null>(null);

  // Delete Confirmation
  const [deletingWO, setDeletingWO] = useState<WorkOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [woData, bomData, prodData, whData] = await Promise.all([
        getWorkOrdersApi(),
        getBOMsApi(),
        fetchProducts(),
        fetchWarehouses(),
      ]);
      setWorkOrders(woData || []);
      setBoms(bomData || []);
      setProducts(prodData || []);
      setWarehouses(whData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Work Orders",
        message: err.message || "An error occurred while loading work orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Paginated Work Orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchSearch =
        wo.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        (wo.finishedProduct?.name && wo.finishedProduct.name.toLowerCase().includes(search.toLowerCase())) ||
        (wo.machineNo && wo.machineNo.toLowerCase().includes(search.toLowerCase())) ||
        (wo.operator && wo.operator.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || wo.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [workOrders, search, statusFilter]);

  const totalPages = Math.ceil(filteredWorkOrders.length / pageSize) || 1;
  const paginatedWorkOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWorkOrders.slice(start, start + pageSize);
  }, [filteredWorkOrders, currentPage, pageSize]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = workOrders.length;
    const inProgress = workOrders.filter((w) => w.status === "IN_PROGRESS").length;
    const completed = workOrders.filter((w) => w.status === "COMPLETED");
    const totalOutputKg = completed.reduce((sum, w) => sum + (w.producedQty || 0), 0);

    let avgYield = 0;
    if (completed.length > 0) {
      const totalYield = completed.reduce((sum, w) => {
        const target = w.targetQty || 1;
        const yieldVal = Math.min(100, Math.round(((w.producedQty || 0) / target) * 100));
        return sum + yieldVal;
      }, 0);
      avgYield = Math.round(totalYield / completed.length);
    }

    return { total, inProgress, totalOutputKg, avgYield };
  }, [workOrders]);

  // Options for SearchableSelect
  const bomOptions = useMemo(() => {
    return boms.map((b) => ({
      value: b.id,
      label: `${b.name} (${b.bomCode})`,
      subLabel: `ผลผลิต: ${b.outputQty} ${b.unit} | สินค้า: ${b.finishedProduct?.name || ""}`,
    }));
  }, [boms]);

  const productOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.sku})`,
      subLabel: `สต็อกปัจจุบัน: ${p.stock}`,
    }));
  }, [products]);

  const warehouseOptions = useMemo(() => {
    return warehouses.map((w) => ({
      value: w.id,
      label: w.name,
      subLabel: w.address || undefined,
    }));
  }, [warehouses]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    const codeNum = String(workOrders.length + 1).padStart(4, "0");
    setFormOrderNo(`WO-2026-${codeNum}`);
    setFormBomId("");
    setFormFinishedProductId("");
    setFormTargetQty(500);
    setFormUnit("kg");
    setFormMachineNo("Extruder #1");
    setFormOperator("Admin");
    setFormWarehouseId(warehouses[0]?.id || "");
    setFormNotes("");
    setShowAddModal(true);
  };

  const handleBomSelect = (bomId: string) => {
    setFormBomId(bomId);
    const selected = boms.find((b) => b.id === bomId);
    if (selected) {
      setFormFinishedProductId(selected.finishedProductId);
      setFormUnit(selected.unit || "kg");
    }
  };

  // Submit Create Work Order
  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrderNo.trim() || !formFinishedProductId || !formTargetQty) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "กรุณาระบุเลขที่คำสั่งผลิต (Order No), สินค้าสำเร็จรูป และจำนวนเป้าหมาย",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createWorkOrderApi({
        orderNo: formOrderNo.trim(),
        bomId: formBomId || undefined,
        finishedProductId: formFinishedProductId,
        targetQty: Number(formTargetQty),
        unit: formUnit,
        machineNo: formMachineNo,
        operator: formOperator,
        warehouseId: formWarehouseId || undefined,
        notes: formNotes,
      });

      setShowAddModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Work Order Created!",
        message: `สร้างคำสั่งผลิต "${formOrderNo}" จำนวน ${formTargetQty} ${formUnit} สำเร็จแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "ไม่สามารถสร้างคำสั่งผลิตได้",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Production (Deduct raw materials automatically)
  const handleStartProduction = async (wo: WorkOrder) => {
    try {
      await updateWorkOrderStatusApi(wo.id, { status: "IN_PROGRESS" });
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Production Started!",
        message: `เริ่มเดินเครื่องผลิตคำสั่งผลิต "${wo.orderNo}" ระบบได้ตัดเบิกสต็อกเม็ดพลาสติกและสารเติมแต่งเรียบร้อยแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Start",
        message: err.message || "เกิดข้อผิดพลาดในการเริ่มคำสั่งผลิต",
      });
    }
  };

  // Open Complete Modal
  const handleOpenCompleteModal = (wo: WorkOrder) => {
    setCompletingWO(wo);
    setCompleteProducedQty(wo.targetQty);
    setCompleteScrapQty(0);
  };

  // Submit Complete Production (Add finished goods to stock)
  const handleSubmitComplete = async () => {
    if (!completingWO) return;
    try {
      setIsCompleting(true);
      await updateWorkOrderStatusApi(completingWO.id, {
        status: "COMPLETED",
        producedQty: Number(completeProducedQty),
        scrapQty: Number(completeScrapQty),
      });

      const orderNo = completingWO.orderNo;
      setCompletingWO(null);
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Production Completed!",
        message: `บันทึกจบงานผลิต "${orderNo}" เรียบร้อยแล้ว ระบบได้เพิ่มสต็อกถุงพลาสติกสำเร็จรูปเข้าคลังจำนวน ${completeProducedQty} ${completingWO.unit} ทันที`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Complete",
        message: err.message || "ไม่สามารถบันทึกจบงานผลิตได้",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Delete Work Order
  const handleConfirmDelete = async () => {
    if (!deletingWO) return;
    try {
      setIsDeleting(true);
      await deleteWorkOrderApi(deletingWO.id);
      const delNo = deletingWO.orderNo;
      setDeletingWO(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Work Order Deleted!",
        message: `ลบคำสั่งผลิต "${delNo}" สำเร็จแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "ไม่สามารถลบคำสั่งผลิตได้",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Order No", "Product", "Target Qty", "Produced Qty", "Scrap Qty", "Unit", "Machine", "Operator", "Status"];
    const rows = filteredWorkOrders.map((w) => [
      `"${w.orderNo}"`,
      `"${w.finishedProduct?.name || ""}"`,
      w.targetQty,
      w.producedQty,
      w.scrapQty,
      `"${w.unit}"`,
      `"${w.machineNo || ""}"`,
      `"${w.operator || ""}"`,
      `"${w.status}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `work_orders_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Work Orders (คำสั่งผลิต)</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                Factory Execution
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              วางแผนและควบคุมคำสั่งผลิตถุงพลาสติก ตัดสต็อกเม็ดพลาสติกและสีอัตโนมัติ และติดตามเปอร์เซ็นต์ผลผลิต (Yield Rate)
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
              <span>+ Add Work Order</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">คำสั่งผลิตทั้งหมด</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#1E293B]">{kpis.total}</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">กำลังเดินเครื่องผลิต (Active)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-blue-600">{kpis.inProgress}</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">ผลิตเสร็จแล้ว (Total Output)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-emerald-600">{kpis.totalOutputKg.toLocaleString()} kg</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">เฉลี่ย Yield Rate (%)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#FE9F43]">{kpis.avgYield || 97}%</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
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
                placeholder="Search WO No, Product, Machine..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] focus:ring-1 focus:ring-[#FE9F43] transition-all"
              />
            </div>

            <div className="w-full sm:w-48">
              <SearchableSelect
                options={[
                  { value: "all", label: "Status: All" },
                  { value: "CONFIRMED", label: "Confirmed" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "DRAFT", label: "Draft" },
                  { value: "CANCELLED", label: "Cancelled" },
                ]}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                placeholder="Filter Status..."
                showSelectOption={false}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F1F3F5] bg-[#F8F9FA] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Order No</th>
                  <th className="py-3 px-4">Product to Produce</th>
                  <th className="py-3 px-4">Machine / Operator</th>
                  <th className="py-3 px-4">Target vs Output</th>
                  <th className="py-3 px-4">Yield Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Process Action</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>กำลังโหลดคำสั่งผลิต...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedWorkOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      ไม่พบข้อมูลคำสั่งผลิต (Work Orders)
                    </td>
                  </tr>
                ) : (
                  paginatedWorkOrders.map((wo) => {
                    const yieldRate =
                      wo.targetQty > 0 && wo.producedQty > 0
                        ? Math.min(100, Math.round((wo.producedQty / wo.targetQty) * 100))
                        : 0;

                    return (
                      <tr key={wo.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#FE9F43]">
                          {wo.orderNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                              <span className="font-semibold block">{wo.finishedProduct?.name || "-"}</span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                SKU: {wo.finishedProduct?.sku || "-"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-semibold text-gray-800 block">{wo.machineNo || "-"}</span>
                            <span className="text-[10px] text-gray-400">ช่าง: {wo.operator || "Admin"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-gray-900">{wo.producedQty || 0}</span>
                              <span className="text-gray-400">/ {wo.targetQty} {wo.unit}</span>
                            </div>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  wo.status === "COMPLETED" ? "bg-emerald-500" : "bg-[#FE9F43]"
                                }`}
                                style={{
                                  width: `${Math.min(100, ((wo.producedQty || 0) / (wo.targetQty || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {yieldRate > 0 ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                yieldRate >= 95
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : yieldRate >= 85
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {yieldRate}% Yield
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              wo.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : wo.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : wo.status === "CONFIRMED"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {wo.status}
                          </span>
                        </td>

                        {/* Production Workflow Action */}
                        <td className="py-3 px-4 text-center">
                          {wo.status === "CONFIRMED" && (
                            <button
                              type="button"
                              onClick={() => handleStartProduction(wo)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 mx-auto shadow-2xs cursor-pointer transition-colors"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>เริ่มเดินเครื่อง</span>
                            </button>
                          )}
                          {wo.status === "IN_PROGRESS" && (
                            <button
                              type="button"
                              onClick={() => handleOpenCompleteModal(wo)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 mx-auto shadow-2xs cursor-pointer transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>จบงานผลิต</span>
                            </button>
                          )}
                          {wo.status === "COMPLETED" && (
                            <span className="text-[11px] font-medium text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ผลิตเสร็จสมบูรณ์</span>
                            </span>
                          )}
                        </td>

                        {/* GEMINI.md Action Order: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              title="View Details"
                              onClick={() => setViewWO(wo)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete Work Order"
                              onClick={() => setDeletingWO(wo)}
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
              <span>จากทั้งหมด {filteredWorkOrders.length} รายการ</span>
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
        {/* ADD WORK ORDER MODAL                                      */}
        {/* ========================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-100 shadow-2xl p-6 space-y-4 my-8 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">สร้างคำสั่งผลิตใหม่ (Create Work Order)</h3>
                    <p className="text-[11px] text-gray-500">เลือกสูตรการผลิตและกำหนดเครื่องจักรที่ใช้เดินงาน</p>
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

              <form onSubmit={handleCreateWorkOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เลขที่คำสั่งผลิต (Order No) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formOrderNo}
                      onChange={(e) => setFormOrderNo(e.target.value)}
                      required
                      placeholder="e.g. WO-2026-0002"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เลือกสูตรการผลิต (BOM)
                    </label>
                    <SearchableSelect
                      options={bomOptions}
                      value={formBomId}
                      onChange={handleBomSelect}
                      placeholder="Select Recipe BOM..."
                      showSelectOption={true}
                      selectOptionLabel="Select BOM Recipe..."
                      size="sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      สินค้าที่จะผลิต (Finished Product) <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={productOptions}
                      value={formFinishedProductId}
                      onChange={(val) => setFormFinishedProductId(val)}
                      placeholder="Select finished goods..."
                      showSelectOption={true}
                      selectOptionLabel="Select Finished Goods..."
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      จำนวนเป้าหมายการผลิต (Target Qty) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="any"
                        value={formTargetQty}
                        onChange={(e) => setFormTargetQty(Number(e.target.value))}
                        required
                        className="w-2/3 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                      />
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="kg"
                        className="w-1/3 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      คลังเบิกวัตถุดิบ / รับสินค้า
                    </label>
                    <SearchableSelect
                      options={warehouseOptions}
                      value={formWarehouseId}
                      onChange={(val) => setFormWarehouseId(val)}
                      placeholder="Select Warehouse..."
                      showSelectOption={true}
                      selectOptionLabel="Select Warehouse..."
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เครื่องจักร / สายการผลิต (Machine)
                    </label>
                    <input
                      type="text"
                      value={formMachineNo}
                      onChange={(e) => setFormMachineNo(e.target.value)}
                      placeholder="e.g. Extruder #2"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ผู้คุมเครื่อง (Operator)
                    </label>
                    <input
                      type="text"
                      value={formOperator}
                      onChange={(e) => setFormOperator(e.target.value)}
                      placeholder="e.g. สมชาย มีฝีมือ"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">หมายเหตุงานผลิต (Notes)</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="เช่น ลูกค้าขอถุงหนาพิเศษ 0.05 mm มัดละ 1 kg"
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
                    {isSubmitting ? "Creating..." : "Confirm Work Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* COMPLETE PRODUCTION MODAL (WEIGH FINISHED & SCRAP)        */}
        {/* ========================================================= */}
        {completingWO && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">บันทึกจบงานผลิต ({completingWO.orderNo})</h3>
                    <p className="text-[11px] text-gray-500">ชั่งน้ำหนักสินค้าสำเร็จรูป และชั่งน้ำหนักเศษกาก/ขี้กระบอก</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompletingWO(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">สินค้า:</span>
                    <span className="font-bold text-gray-800">{completingWO.finishedProduct?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">เป้าหมายผลิต:</span>
                    <span className="font-bold text-gray-800">{completingWO.targetQty} {completingWO.unit}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    จำนวนที่ผลิตได้จริง (Good Output - {completingWO.unit}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={completeProducedQty}
                    onChange={(e) => setCompleteProducedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg font-bold text-emerald-600 focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    น้ำหนักเศษกาก/ขี้กระบอก/ม้วนเสีย (Scrap - {completingWO.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={completeScrapQty}
                    onChange={(e) => setCompleteScrapQty(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg font-bold text-amber-600 focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                {/* Live Yield Rate Banner */}
                {completingWO.targetQty > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900">Yield Rate คำนวณได้:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {Math.min(100, Math.round(((completeProducedQty || 0) / completingWO.targetQty) * 100))}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCompletingWO(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isCompleting || completeProducedQty <= 0}
                  onClick={handleSubmitComplete}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isCompleting ? "Saving..." : "Confirm & Add Stock"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW WORK ORDER DETAILS MODAL                             */}
        {/* ========================================================= */}
        {viewWO && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{viewWO.orderNo}</h3>
                    <p className="text-[11px] text-gray-400">รายละเอียดคำสั่งผลิตและรายการวัตถุดิบที่ใช้</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewWO(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px]">สินค้าที่ผลิต</span>
                    <span className="font-bold text-gray-800">{viewWO.finishedProduct?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">สถานะคำสั่งผลิต</span>
                    <span className="font-bold text-gray-800">{viewWO.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">เป้าหมาย / ผลิตได้จริง</span>
                    <span className="font-bold text-emerald-600">{viewWO.producedQty || 0} / {viewWO.targetQty} {viewWO.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">เครื่องจักร / ช่างคุม</span>
                    <span className="font-bold text-gray-800">{viewWO.machineNo} ({viewWO.operator})</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-800">รายการวัตถุดิบที่ตัดเบิกเข้าสายการผลิต:</h4>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {viewWO.materials?.map((m, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50">
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {m.rawMaterial?.name || m.rawMaterialId}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            เบิกจริง: {m.actualQty || m.plannedQty} {m.unit}
                          </span>
                        </div>
                        <span className="font-bold text-slate-700">
                          {m.isDeducted ? (
                            <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded-full">
                              ตัดสต็อกแล้ว
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-semibold px-2 py-0.5 bg-amber-50 rounded-full">
                              รอเบิก
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {viewWO.notes && (
                  <div className="p-2.5 bg-yellow-50/60 border border-yellow-200 rounded-lg text-gray-700 text-[11px]">
                    <span className="font-bold block mb-0.5">หมายเหตุ:</span>
                    {viewWO.notes}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewWO(null)}
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
        {deletingWO && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Work Order?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งผลิต <strong>&quot;{deletingWO.orderNo}&quot;</strong>? การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingWO(null)}
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

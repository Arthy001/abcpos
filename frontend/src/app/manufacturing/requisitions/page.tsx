"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { MaterialRequisition, WorkOrder, Product, Warehouse } from "@/types";
import {
  getMaterialRequisitionsApi,
  createMaterialRequisitionApi,
  cancelMaterialRequisitionApi,
  getWorkOrdersApi,
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
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ClipboardList,
  Clock,
  Layers,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function MaterialRequisitionsPage() {
  const [requisitions, setRequisitions] = useState<MaterialRequisition[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // View Modal State
  const [viewReq, setViewReq] = useState<MaterialRequisition | null>(null);

  // Add Additional Requisition Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formWoId, setFormWoId] = useState<string>("");
  const [formWarehouseId, setFormWarehouseId] = useState<string>("");
  const [formReason, setFormReason] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formItems, setFormItems] = useState<
    { rawMaterialId: string; requestedQty: number; unit: string; notes?: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cancel Confirmation Modal State (Step 1 & 2)
  const [cancellingReq, setCancellingReq] = useState<MaterialRequisition | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqData, woData, prodData, whData] = await Promise.all([
        getMaterialRequisitionsApi(),
        getWorkOrdersApi(),
        fetchProducts(),
        fetchWarehouses(),
      ]);
      setRequisitions(reqData || []);
      setWorkOrders(woData || []);
      setProducts(prodData || []);
      setWarehouses(whData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Load Failed",
        message: err.message || "Failed to load requisitions data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.requisitionNo.toLowerCase().includes(q) ||
        (r.workOrder?.orderNo && r.workOrder.orderNo.toLowerCase().includes(q)) ||
        (r.requestedBy && r.requestedBy.toLowerCase().includes(q)) ||
        (r.issuedBy && r.issuedBy.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesType = typeFilter === "ALL" || r.type === typeFilter;
      const matchesWarehouse = warehouseFilter === "ALL" || r.warehouseId === warehouseFilter;

      return matchesSearch && matchesStatus && matchesType && matchesWarehouse;
    });
  }, [requisitions, search, statusFilter, typeFilter, warehouseFilter]);

  // Pagination calculation
  const totalItems = filteredRequisitions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequisitions.slice(start, start + pageSize);
  }, [filteredRequisitions, currentPage, pageSize]);

  // Metrics
  const metrics = useMemo(() => {
    const total = requisitions.length;
    const pending = requisitions.filter((r) => r.status === "PENDING").length;
    const partial = requisitions.filter((r) => r.status === "PARTIAL").length;
    const issued = requisitions.filter((r) => r.status === "ISSUED").length;
    return { total, pending, partial, issued };
  }, [requisitions]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Requisition No", "Type", "Status", "Work Order", "Requested By", "Issued By", "Created Date"];
    const rows = filteredRequisitions.map((r) => [
      `"${r.requisitionNo}"`,
      `"${r.type}"`,
      `"${r.status}"`,
      `"${r.workOrder?.orderNo || ""}"`,
      `"${r.requestedBy || ""}"`,
      `"${r.issuedBy || ""}"`,
      `"${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `material_requisitions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Cancel Requisition
  const handleConfirmCancel = async () => {
    if (!cancellingReq) return;
    try {
      setIsCancelling(true);
      await cancelMaterialRequisitionApi(cancellingReq.id);
      setCancellingReq(null);
      await loadData();
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Requisition Cancelled",
        message: `ใบเบิก ${cancellingReq.requisitionNo} ถูกยกเลิกเรียบร้อยแล้ว`,
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Cancellation Failed",
        message: err.message || "Failed to cancel requisition",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Add Item in Additional Modal
  const handleAddItem = () => {
    setFormItems((prev) => [
      ...prev,
      { rawMaterialId: "", requestedQty: 10, unit: "kg", notes: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormItems((prev) => {
      const next = [...prev];
      (next[index] as any)[field] = value;
      return next;
    });
  };

  // Submit Additional Requisition
  const handleSubmitAdditional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWoId) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "กรุณาเลือก Work Order ที่ต้องการขอเบิกวัตถุดิบเพิ่ม",
      });
      return;
    }

    if (formItems.length === 0 || formItems.some((i) => !i.rawMaterialId || Number(i.requestedQty) <= 0)) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Invalid Items",
        message: "กรุณาระบุวัตถุดิบและจำนวนที่ถูกต้องอย่างน้อย 1 รายการ",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createMaterialRequisitionApi({
        workOrderId: formWoId,
        type: "ADDITIONAL",
        warehouseId: formWarehouseId || undefined,
        requestedBy: "Admin",
        reason: formReason || "เบิกเพิ่มเติมหน้างาน",
        notes: formNotes || undefined,
        items: formItems.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          requestedQty: Number(item.requestedQty),
          unit: item.unit || "kg",
          notes: item.notes,
        })),
      });

      setShowAddModal(false);
      setFormWoId("");
      setFormWarehouseId("");
      setFormReason("");
      setFormNotes("");
      setFormItems([]);
      await loadData();

      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Requisition Created!",
        message: `สร้างใบขอเบิกเพิ่มเติม ${created.requisitionNo} เรียบร้อยแล้ว`,
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to create additional requisition",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawMaterials = useMemo(() => {
    return products.filter((p) => p.status === "ACTIVE");
  }, [products]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-[#FE9F43]" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Material Requisitions (ใบเบิกวัตถุดิบ)
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              จัดการและตรวจสอบใบเบิกวัตถุดิบตาม BOM และใบขอเบิกเพิ่มเติมสำหรับกระบวนการผลิต
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAddModal(true);
                setFormItems([{ rawMaterialId: "", requestedQty: 10, unit: "kg" }]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#FE9F43] hover:bg-[#e88d35] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ขอเบิกวัตถุดิบเพิ่ม (Additional)</span>
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <p className="text-xs font-medium text-gray-500">ใบเบิกทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <p className="text-xs font-medium text-amber-600">รอดำเนินการ (Pending)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <p className="text-xs font-medium text-blue-600">เบิกบางส่วน (Partial)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.partial}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <p className="text-xs font-medium text-emerald-600">เบิกจ่ายครบแล้ว (Issued)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.issued}</p>
          </div>
        </div>

        {/* Filter Bar & Export */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่ใบเบิก, เลขที่ WO, ผู้ขอเบิก..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43]"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-36">
                <SearchableSelect
                  options={[
                    { label: "Status: All", value: "ALL" },
                    { label: "Pending", value: "PENDING" },
                    { label: "Partial", value: "PARTIAL" },
                    { label: "Issued", value: "ISSUED" },
                    { label: "Cancelled", value: "CANCELLED" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="Status: All"
                  showSelectOption={false}
                />
              </div>

              <div className="w-36">
                <SearchableSelect
                  options={[
                    { label: "Type: All", value: "ALL" },
                    { label: "Initial (BOM)", value: "INITIAL" },
                    { label: "Additional", value: "ADDITIONAL" },
                  ]}
                  value={typeFilter}
                  onChange={(val) => setTypeFilter(val)}
                  placeholder="Type: All"
                  showSelectOption={false}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  options={[
                    { label: "Warehouse: All", value: "ALL" },
                    ...warehouses.map((w) => ({ label: w.name, value: w.id })),
                  ]}
                  value={warehouseFilter}
                  onChange={(val) => setWarehouseFilter(val)}
                  placeholder="Warehouse: All"
                  showSelectOption={false}
                />
              </div>

              <button
                type="button"
                title="Refresh"
                onClick={loadData}
                className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                title="Print"
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
            </div>
          </div>
        </div>

        {/* Master Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">เลขที่ใบเบิก</th>
                  <th className="py-3 px-4 font-semibold">ประเภท</th>
                  <th className="py-3 px-4 font-semibold">Work Order อ้างอิง</th>
                  <th className="py-3 px-4 font-semibold">คลังจ่าย</th>
                  <th className="py-3 px-4 font-semibold">รายการวัตถุดิบ</th>
                  <th className="py-3 px-4 font-semibold">สถานะ</th>
                  <th className="py-3 px-4 font-semibold">ผู้ขอเบิก / เบิกจ่าย</th>
                  <th className="py-3 px-4 font-semibold text-center">จัดการ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      กำลังโหลดข้อมูลใบเบิกวัตถุดิบ...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      ไม่พบข้อมูลใบเบิกวัตถุดิบ
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((req) => {
                    const totalReqQty = req.items?.reduce((acc, i) => acc + i.requestedQty, 0) || 0;
                    const totalIssuedQty = req.items?.reduce((acc, i) => acc + i.issuedQty, 0) || 0;
                    const percent = totalReqQty > 0 ? Math.min(100, Math.round((totalIssuedQty / totalReqQty) * 100)) : 0;

                    return (
                      <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <ClipboardList className="w-4 h-4 text-gray-400" />
                            <span>{req.requisitionNo}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 block mt-0.5">
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              req.type === "INITIAL"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {req.type === "INITIAL" ? "Initial (BOM)" : "Additional"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {req.workOrder ? (
                            <Link
                              href="/manufacturing/work-orders"
                              className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                            >
                              <span>{req.workOrder.orderNo}</span>
                              <ArrowRight className="w-3 h-3 text-blue-400" />
                            </Link>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                          {req.workOrder?.finishedProduct && (
                            <span className="text-xs text-gray-500 block truncate max-w-[140px]">
                              {req.workOrder.finishedProduct.name}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-gray-700">
                          {req.warehouse?.name || "คลังหลัก"}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 w-28">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 font-medium">{req.items?.length || 0} รายการ</span>
                              <span className="font-bold text-gray-700">{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  percent === 100
                                    ? "bg-emerald-500"
                                    : percent > 0
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              req.status === "ISSUED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : req.status === "PARTIAL"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : req.status === "CANCELLED"
                                ? "bg-gray-100 text-gray-600 border border-gray-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {req.status === "ISSUED"
                              ? "Issued"
                              : req.status === "PARTIAL"
                              ? "Partial"
                              : req.status === "CANCELLED"
                              ? "Cancelled"
                              : "Pending"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs">
                          <div className="text-gray-900 font-medium">ขอ: {req.requestedBy || "Admin"}</div>
                          {req.issuedBy && (
                            <div className="text-emerald-600 font-medium mt-0.5">จ่าย: {req.issuedBy}</div>
                          )}
                        </td>

                        {/* Action buttons: View -> Issue/Edit -> Delete/Cancel (GEMINI.md standard) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* 1. View (Eye) */}
                            <button
                              type="button"
                              title="ดูรายละเอียดใบเบิก"
                              onClick={() => setViewReq(req)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* 2. Issue (PackageCheck / POS-Style screen) */}
                            {req.status !== "CANCELLED" && (
                              <Link
                                href={`/manufacturing/requisitions/${req.id}/issue`}
                                title="เบิกจ่ายวัตถุดิบ (POS-Style Screen)"
                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <PackageCheck className="w-4 h-4 text-emerald-600" />
                              </Link>
                            )}

                            {/* 3. Delete / Cancel (Trash2) */}
                            {req.status === "PENDING" && (
                              <button
                                type="button"
                                title="ยกเลิกใบเบิก"
                                onClick={() => setCancellingReq(req)}
                                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                              </button>
                            )}
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
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>แสดง</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#FE9F43]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>รายการ จากทั้งหมด {totalItems} รายการ</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* VIEW DETAILS MODAL */}
        {/* ========================================== */}
        {viewReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#FE9F43]" />
                  <h3 className="font-bold text-gray-900 text-lg">
                    ใบเบิกวัตถุดิบ: {viewReq.requisitionNo}
                  </h3>
                </div>
                <button
                  onClick={() => setViewReq(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <span className="text-gray-400 block">Work Order:</span>
                    <span className="font-bold text-gray-900 text-sm">{viewReq.workOrder?.orderNo || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ประเภท:</span>
                    <span className="font-semibold text-gray-900">{viewReq.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">สถานะ:</span>
                    <span className="font-bold text-emerald-600">{viewReq.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ผู้ขอเบิก:</span>
                    <span className="font-medium text-gray-900">{viewReq.requestedBy || "Admin"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">เจ้าหน้าที่คลังที่เบิกจ่าย:</span>
                    <span className="font-medium text-gray-900">{viewReq.issuedBy || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">วันที่จ่ายสำเร็จ:</span>
                    <span className="font-medium text-gray-900">
                      {viewReq.issuedAt ? new Date(viewReq.issuedAt).toLocaleString() : "-"}
                    </span>
                  </div>
                </div>

                {viewReq.reason && (
                  <div className="text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800">
                    <span className="font-bold">เหตุผลการขอเบิก:</span> {viewReq.reason}
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    รายการวัตถุดิบ ({viewReq.items?.length || 0} รายการ)
                  </h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">วัตถุดิบ (Raw Material)</th>
                          <th className="py-2.5 px-3 font-semibold text-right">จำนวนที่ขอ</th>
                          <th className="py-2.5 px-3 font-semibold text-right">จ่ายแล้ว</th>
                          <th className="py-2.5 px-3 font-semibold text-center">หน่วย</th>
                          <th className="py-2.5 px-3 font-semibold text-center">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewReq.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2.5 px-3 font-medium text-gray-900">
                              {item.rawMaterial?.name || "Raw Material"}
                              <span className="block text-[10px] text-gray-400">
                                SKU: {item.rawMaterial?.sku || "-"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                              {Number(Number(item.requestedQty).toFixed(4))}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                              {Number(Number(item.issuedQty).toFixed(4))}
                            </td>
                            <td className="py-2.5 px-3 text-center">{item.unit}</td>
                            <td className="py-2.5 px-3 text-center">
                              {item.isIssued || item.issuedQty >= item.requestedQty ? (
                                <span className="text-emerald-600 font-bold">ครบแล้ว</span>
                              ) : item.issuedQty > 0 ? (
                                <span className="text-blue-600 font-bold">บางส่วน</span>
                              ) : (
                                <span className="text-gray-400">ยังไม่จ่าย</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                {viewReq.status !== "CANCELLED" && (
                  <Link
                    href={`/manufacturing/requisitions/${viewReq.id}/issue`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>ไปหน้าเบิกจ่ายสินค้า (Issue Screen)</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setViewReq(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold ml-auto transition-colors cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ADD ADDITIONAL REQUISITION MODAL */}
        {/* ========================================== */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[92vh] max-h-[900px] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FE9F43] flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      สร้างใบขอเบิกวัตถุดิบเพิ่มเติม (Additional Requisition)
                    </h3>
                    <p className="text-xs text-gray-500">
                      ระบุคำสั่งผลิตและเลือกรายการวัตถุดิบที่ต้องการเบิกเพิ่มเข้าสู่กระบวนการผลิต
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmitAdditional} className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-36">
                  {/* Row 1: Work Order & Warehouse */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Work Order อ้างอิง *
                      </label>
                      <SearchableSelect
                        options={workOrders
                          .filter((w) => w.status !== "COMPLETED" && w.status !== "CANCELLED")
                          .map((w) => ({
                            label: `${w.orderNo} (${w.finishedProduct?.name || "WO"})`,
                            value: w.id,
                          }))}
                        value={formWoId}
                        onChange={(val) => setFormWoId(val)}
                        placeholder="Select Work Order..."
                        showSelectOption={true}
                        selectOptionLabel="Select Work Order..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        คลังเบิกจ่าย
                      </label>
                      <SearchableSelect
                        options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
                        value={formWarehouseId}
                        onChange={(val) => setFormWarehouseId(val)}
                        placeholder="Select Warehouse..."
                        showSelectOption={true}
                        selectOptionLabel="Select Warehouse..."
                      />
                    </div>
                  </div>

                  {/* Row 2: Reason */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เหตุผลการขอเบิกวัตถุดิบเพิ่ม *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น วัตถุดิบเกิดฟองอากาศ/เสียรูปช่วงตั้งต้นเครื่องจักร, สั่งผลิตเพิ่ม"
                      value={formReason}
                      onChange={(e) => setFormReason(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43]"
                    />
                  </div>

                  {/* Row 3: Items Section with spacious layout */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                          รายการวัตถุดิบที่ต้องการเบิก ({formItems.length} รายการ)
                        </label>
                        <p className="text-[11px] text-gray-400">
                          เลือกวัตถุดิบและระบุจำนวนที่ต้องการขอเบิกจากคลัง
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FE9F43] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ เพิ่มวัตถุดิบ</span>
                      </button>
                    </div>

                    <div className="space-y-3 min-h-[220px]">
                      {formItems.map((item, idx) => {
                        const selectedProduct = rawMaterials.find((p) => p.id === item.rawMaterialId);

                        return (
                          <div
                            key={idx}
                            className="p-3.5 bg-gray-50/90 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5 transition-all hover:border-gray-300"
                          >
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                              {/* Raw Material Selector */}
                              <div className="flex-1">
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                  เลือกวัตถุดิบ (#{idx + 1}) *
                                </label>
                                <SearchableSelect
                                  options={rawMaterials.map((p) => ({
                                    label: `${p.name} (สต็อกคงเหลือ: ${p.stock})`,
                                    value: p.id,
                                  }))}
                                  value={item.rawMaterialId}
                                  onChange={(val) => handleItemChange(idx, "rawMaterialId", val)}
                                  placeholder="Select Material..."
                                  showSelectOption={true}
                                  selectOptionLabel="Select Material..."
                                />
                              </div>

                              {/* Quantity */}
                              <div className="w-full sm:w-32">
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                  จำนวนที่ขอ *
                                </label>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="any"
                                  placeholder="จำนวน"
                                  value={item.requestedQty}
                                  onChange={(e) => handleItemChange(idx, "requestedQty", e.target.value)}
                                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-right font-bold text-gray-900 focus:outline-none focus:border-[#FE9F43]"
                                />
                              </div>

                              {/* Unit */}
                              <div className="w-full sm:w-20">
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                  หน่วย
                                </label>
                                <input
                                  type="text"
                                  placeholder="kg"
                                  value={item.unit}
                                  onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                                  className="w-full px-2 py-2 text-sm bg-white border border-gray-200 rounded-xl text-center font-medium focus:outline-none focus:border-[#FE9F43]"
                                />
                              </div>

                              {/* Remove Button */}
                              <div className="sm:self-end pb-0.5">
                                <button
                                  type="button"
                                  title="ลบรายการนี้"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Additional info badge if material selected */}
                            {selectedProduct && (
                              <div className="flex items-center gap-3 text-[11px] text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                                <span>SKU: <strong className="text-gray-700">{selectedProduct.sku}</strong></span>
                                <span>•</span>
                                <span>
                                  สต็อกพร้อมจ่าย:{" "}
                                  <strong className={selectedProduct.stock > 0 ? "text-emerald-600" : "text-rose-600"}>
                                    {selectedProduct.stock} {item.unit}
                                  </strong>
                                </span>
                                {item.requestedQty > selectedProduct.stock && (
                                  <>
                                    <span>•</span>
                                    <span className="text-rose-600 font-bold">
                                      ⚠️ จำนวนขอเบิกเกินสต็อกในคลัง
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Fixed Modal Footer */}
                <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    รวมทั้งสิ้น <strong className="text-gray-900">{formItems.length}</strong> รายการ
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[#FE9F43] hover:bg-[#e88d35] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      {isSubmitting ? "กำลังบันทึก..." : "ยืนยันสร้างใบขอเบิก"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* DELETE / CANCEL CONFIRMATION MODAL (Step 1) */}
        {/* ========================================== */}
        {cancellingReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">ยืนยันยกเลิกใบเบิกวัตถุดิบ?</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการยกเลิกใบเบิก{" "}
                <span className="font-bold text-gray-800">{cancellingReq.requisitionNo}</span> ?
                การกระทำนี้จะเปลี่ยนสถานะเป็นยกเลิก (CANCELLED)
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancellingReq(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  ยกเลิก (Cancel)
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {isCancelling ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* FEEDBACK MODAL (GEMINI.md standard) */}
        {/* ========================================== */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              {feedbackModal.type === "add_success" && (
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "edit_success" && (
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "delete_success" && (
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "error" && (
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900 mb-2">{feedbackModal.title}</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">{feedbackModal.message}</p>

              {feedbackModal.type === "add_success" ? (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackModal({ ...feedbackModal, isOpen: false });
                      setShowAddModal(true);
                      setFormItems([{ rawMaterialId: "", requestedQty: 10, unit: "kg" }]);
                    }}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Add Another
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
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

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductionScrap, Product, WorkOrder } from "@/types";
import {
  getProductionScrapsApi,
  createProductionScrapApi,
  recycleProductionScrapApi,
  deleteProductionScrapApi,
  fetchProducts,
  getWorkOrdersApi,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
  Recycle,
  Scale,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const SCRAP_TYPES: { [key: string]: { label: string; color: string } } = {
  EDGE_TRIM: { label: "เศษตัดปากถุง / ริมฟิล์ม", color: "bg-blue-50 text-blue-700 border-blue-200" },
  PURGE: { label: "ขี้กระบอกล้างหัวเป่า", color: "bg-amber-50 text-amber-700 border-amber-200" },
  REJECT_ROLL: { label: "ม้วนฟิล์มเสีย / รั่ว", color: "bg-rose-50 text-rose-700 border-rose-200" },
  STARTUP: { label: "เศษตั้งเครื่องเป่า", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function ScrapRecyclingPage() {
  const [scraps, setScraps] = useState<ProductionScrap[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
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

  // Add Scrap Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formScrapNo, setFormScrapNo] = useState<string>("");
  const [formWorkOrderId, setFormWorkOrderId] = useState<string>("");
  const [formScrapType, setFormScrapType] = useState<string>("EDGE_TRIM");
  const [formMaterialName, setFormMaterialName] = useState<string>("");
  const [formWeightKg, setFormWeightKg] = useState<number>(10);
  const [formTargetRawMaterialId, setFormTargetRawMaterialId] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Recycling in progress
  const [recyclingId, setRecyclingId] = useState<string | null>(null);

  // Delete Confirmation
  const [deletingScrap, setDeletingScrap] = useState<ProductionScrap | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scrapData, prodData, woData] = await Promise.all([
        getProductionScrapsApi(),
        fetchProducts(),
        getWorkOrdersApi(),
      ]);
      setScraps(scrapData || []);
      setProducts(prodData || []);
      setWorkOrders(woData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Scraps",
        message: err.message || "An error occurred while loading production scrap records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Paginated Scraps
  const filteredScraps = useMemo(() => {
    return scraps.filter((s) => {
      const matchSearch =
        s.scrapNo.toLowerCase().includes(search.toLowerCase()) ||
        s.materialName.toLowerCase().includes(search.toLowerCase()) ||
        (s.workOrder?.orderNo && s.workOrder.orderNo.toLowerCase().includes(search.toLowerCase()));
      const matchType = typeFilter === "all" || s.scrapType === typeFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "recycled" && s.isRecycled) ||
        (statusFilter === "pending" && !s.isRecycled);
      return matchSearch && matchType && matchStatus;
    });
  }, [scraps, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredScraps.length / pageSize) || 1;
  const paginatedScraps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredScraps.slice(start, start + pageSize);
  }, [filteredScraps, currentPage, pageSize]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalWeight = scraps.reduce((sum, s) => sum + (s.weightKg || 0), 0);
    const pendingScrap = scraps.filter((s) => !s.isRecycled).reduce((sum, s) => sum + (s.weightKg || 0), 0);
    const recycledWeight = scraps.filter((s) => s.isRecycled).reduce((sum, s) => sum + (s.weightKg || 0), 0);
    const estimatedSavedValue = Math.round(recycledWeight * 43.5); // Average virgin HDPE cost 43.5 ฿/kg

    return { totalWeight, pendingScrap, recycledWeight, estimatedSavedValue };
  }, [scraps]);

  // Options for SearchableSelect
  const recycledProductOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.sku})`,
      subLabel: `สต็อกปัจจุบัน: ${p.stock} kg`,
    }));
  }, [products]);

  const workOrderOptions = useMemo(() => {
    return workOrders.map((w) => ({
      value: w.id,
      label: `${w.orderNo} - ${w.finishedProduct?.name || ""}`,
      subLabel: `สถานะ: ${w.status} | เครื่อง: ${w.machineNo || ""}`,
    }));
  }, [workOrders]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    const codeNum = String(scraps.length + 1).padStart(4, "0");
    setFormScrapNo(`SCRAP-2026-${codeNum}`);
    setFormWorkOrderId("");
    setFormScrapType("EDGE_TRIM");
    setFormMaterialName("เศษตัดปากถุงและขอบฟิล์ม HDPE ขาวนม");
    setFormWeightKg(15);

    // Auto-select recycled material if exists
    const defRecy = products.find((p) => p.sku === "RM-HDPE-RECY") || products[0];
    setFormTargetRawMaterialId(defRecy?.id || "");
    setFormNotes("");
    setShowAddModal(true);
  };

  // Submit Create Scrap
  const handleCreateScrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formScrapNo.trim() || !formMaterialName.trim() || !formWeightKg) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "กรุณาระบุเลขที่บันทึกเศษ (Scrap No), ชื่อรายการเศษ และน้ำหนักที่ชั่งได้",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createProductionScrapApi({
        scrapNo: formScrapNo.trim(),
        workOrderId: formWorkOrderId || undefined,
        scrapType: formScrapType,
        materialName: formMaterialName.trim(),
        weightKg: Number(formWeightKg),
        targetRawMaterialId: formTargetRawMaterialId || undefined,
        notes: formNotes,
      });

      setShowAddModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Scrap Recorded!",
        message: `บันทึกรายการเศษกาก "${formMaterialName}" น้ำหนัก ${formWeightKg} kg เรียบร้อยแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "ไม่สามารถบันทึกรายการเศษได้",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Recycle Scrap (Add weight back to resin stock)
  const handleRecycle = async (scrap: ProductionScrap) => {
    try {
      setRecyclingId(scrap.id);
      await recycleProductionScrapApi(scrap.id);
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Scrap Recycled Successfully!",
        message: `บดและวนเศษ "${scrap.materialName}" น้ำหนัก ${scrap.weightKg} kg กลับเข้าสต็อกวัตถุดิบเรียบร้อยแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Recycling Failed",
        message: err.message || "เกิดข้อผิดพลาดในการนำเศษกลับเข้าสต็อก",
      });
    } finally {
      setRecyclingId(null);
    }
  };

  // Delete Scrap
  const handleConfirmDelete = async () => {
    if (!deletingScrap) return;
    try {
      setIsDeleting(true);
      await deleteProductionScrapApi(deletingScrap.id);
      const delNo = deletingScrap.scrapNo;
      setDeletingScrap(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Scrap Deleted!",
        message: `ลบรายการเศษ "${delNo}" สำเร็จแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "ไม่สามารถลบรายการเศษได้",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Scrap No", "Scrap Type", "Material Name", "Weight (kg)", "Work Order", "Recycled Status"];
    const rows = filteredScraps.map((s) => [
      `"${s.scrapNo}"`,
      `"${s.scrapType}"`,
      `"${s.materialName}"`,
      s.weightKg,
      `"${s.workOrder?.orderNo || "General"}"`,
      s.isRecycled ? `"Recycled"` : `"Pending"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `production_scrap_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Scrap & Recycling Loop</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Zero Waste Circular ERP
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              ระบบชั่งน้ำหนักขี้กระบอกและเศษตัดปากถุง วนกลับเข้าสต็อกเป็นเม็ดบดรีไซเคิล ช่วยลดต้นทุนวัตถุดิบและควบคุมเศษเสีย
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
              <span>+ Record Scrap</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">เศษกากที่บันทึกทั้งหมด</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#1E293B]">{kpis.totalWeight.toLocaleString()} kg</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">รอเข้าเครื่องบด (Pending)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-amber-600">{kpis.pendingScrap.toLocaleString()} kg</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">หลอมวนกลับเข้าคลังแล้ว</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-emerald-600">{kpis.recycledWeight.toLocaleString()} kg</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Recycle className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">ประหยัดต้นทุนเม็ดใหม่ (Est.)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#FE9F43]">฿{kpis.estimatedSavedValue.toLocaleString()}</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
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
                placeholder="Search scrap no, material name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] focus:ring-1 focus:ring-[#FE9F43] transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <SearchableSelect
                  options={[
                    { value: "all", label: "Scrap Type: All" },
                    { value: "EDGE_TRIM", label: "เศษตัดปากถุง/ริม" },
                    { value: "PURGE", label: "ขี้กระบอกล้างหัว" },
                    { value: "REJECT_ROLL", label: "ม้วนฟิล์มเสีย" },
                    { value: "STARTUP", label: "เศษตั้งเครื่อง" },
                  ]}
                  value={typeFilter}
                  onChange={(val) => setTypeFilter(val)}
                  placeholder="Filter Type..."
                  showSelectOption={false}
                  size="sm"
                />
              </div>

              <div className="w-full sm:w-40">
                <SearchableSelect
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "pending", label: "Pending (รอนำกลับ)" },
                    { value: "recycled", label: "Recycled (เข้าคลังแล้ว)" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="Status..."
                  showSelectOption={false}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrap Table */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F1F3F5] bg-[#F8F9FA] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Scrap No</th>
                  <th className="py-3 px-4">Scrap Category</th>
                  <th className="py-3 px-4">Material Details</th>
                  <th className="py-3 px-4">Work Order Source</th>
                  <th className="py-3 px-4">Weight (kg)</th>
                  <th className="py-3 px-4">Recycled Target</th>
                  <th className="py-3 px-4 text-center">Recycle Action</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>กำลังโหลดรายการเศษกาก...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedScraps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      ไม่พบข้อมูลบันทึกเศษกาก
                    </td>
                  </tr>
                ) : (
                  paginatedScraps.map((scrap) => {
                    const scrapTypeInfo = SCRAP_TYPES[scrap.scrapType] || {
                      label: scrap.scrapType,
                      color: "bg-gray-100 text-gray-700 border-gray-200",
                    };
                    const isBusy = recyclingId === scrap.id;

                    return (
                      <tr key={scrap.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#FE9F43]">
                          {scrap.scrapNo}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${scrapTypeInfo.color}`}>
                            {scrapTypeInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-800 block">{scrap.materialName}</span>
                          {scrap.notes && (
                            <span className="text-[10px] text-gray-400 block">{scrap.notes}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                          {scrap.workOrder?.orderNo || "สายการผลิตทั่วไป"}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900 text-sm">
                          {scrap.weightKg.toFixed(1)} <span className="text-xs font-normal text-gray-500">kg</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700 font-medium">
                              {scrap.targetRawMaterial?.name || "เม็ดบดรีไซเคิล"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {scrap.isRecycled ? (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>วนเข้าสต็อกแล้ว</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRecycle(scrap)}
                              disabled={isBusy}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 mx-auto shadow-2xs cursor-pointer transition-colors"
                            >
                              <Recycle className={`w-3.5 h-3.5 ${isBusy ? "animate-spin" : ""}`} />
                              <span>+ หลอมวนเข้าคลัง</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            title="Delete Scrap Record"
                            onClick={() => setDeletingScrap(scrap)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
              <span>จากทั้งหมด {filteredScraps.length} รายการ</span>
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
        {/* ADD SCRAP RECORD MODAL                                    */}
        {/* ========================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 space-y-4 my-8 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">บันทึกเศษกาก/ขี้กระบอก (Record Scrap)</h3>
                    <p className="text-[11px] text-gray-500">ชั่งน้ำหนักเศษพลาสติกและเลือกวัตถุดิบปลายทางที่จะวนกลับเข้าคลัง</p>
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

              <form onSubmit={handleCreateScrap} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Scrap No (เลขที่บันทึก) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formScrapNo}
                      onChange={(e) => setFormScrapNo(e.target.value)}
                      required
                      placeholder="e.g. SCRAP-2026-0002"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ประเภทเศษพลาสติก
                    </label>
                    <SearchableSelect
                      options={[
                        { value: "EDGE_TRIM", label: "เศษตัดปากถุง / ริมฟิล์ม" },
                        { value: "PURGE", label: "ขี้กระบอกล้างหัวเป่า" },
                        { value: "REJECT_ROLL", label: "ม้วนฟิล์มเสีย / รั่ว" },
                        { value: "STARTUP", label: "เศษตั้งเครื่องเป่า" },
                      ]}
                      value={formScrapType}
                      onChange={(val) => setFormScrapType(val)}
                      showSelectOption={false}
                      size="sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ชื่อรายละเอียดเศษ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formMaterialName}
                      onChange={(e) => setFormMaterialName(e.target.value)}
                      required
                      placeholder="e.g. เศษตัดปากถุงและขอบฟิล์ม HDPE ขาวนม"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      น้ำหนักที่ชั่งได้ (Weight kg) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formWeightKg}
                      onChange={(e) => setFormWeightKg(Number(e.target.value))}
                      required
                      placeholder="15.0"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      อ้างอิงคำสั่งผลิต (ถ้ามี)
                    </label>
                    <SearchableSelect
                      options={workOrderOptions}
                      value={formWorkOrderId}
                      onChange={(val) => setFormWorkOrderId(val)}
                      placeholder="Select Work Order..."
                      showSelectOption={true}
                      selectOptionLabel="General / No Work Order"
                      size="sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      วัตถุดิบปลายทางที่จะเพิ่มสต็อก (Target Recycled Resin)
                    </label>
                    <SearchableSelect
                      options={recycledProductOptions}
                      value={formTargetRawMaterialId}
                      onChange={(val) => setFormTargetRawMaterialId(val)}
                      placeholder="Select recycled raw material..."
                      showSelectOption={true}
                      selectOptionLabel="Select Recycled Resin..."
                      size="sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">หมายเหตุ (Notes)</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="เช่น รอเข้าเครื่องบดเม็ดรีไซเคิลรอบวันศุกร์"
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
                    {isSubmitting ? "Recording..." : "Record Scrap"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DELETE CONFIRMATION MODAL (GEMINI.md Step 1: Rose Trash2)  */}
        {/* ========================================================= */}
        {deletingScrap && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Scrap Record?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  คุณแน่ใจหรือไม่ว่าต้องการลบรายการเศษ <strong>&quot;{deletingScrap.scrapNo}&quot;</strong> ({deletingScrap.materialName})? การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingScrap(null)}
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

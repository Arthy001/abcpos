"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { MRPRequirementItem } from "@/types";
import {
  getMRPRequirementsApi,
  autoGeneratePurchaseOrderFromMRPApi,
} from "@/lib/api";
import {
  Package,
  Layers,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Printer,
  FileSpreadsheet,
  ShoppingCart,
  ArrowRight,
  TrendingDown,
  Info,
  Building,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  X,
  Factory,
} from "lucide-react";

export default function MrpPlanningPage() {
  const [requirements, setRequirements] = useState<MRPRequirementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("reorder_only");

  // Selection for PO Generation
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [isGeneratingPO, setIsGeneratingPO] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Feedback Modal (GEMINI.md standard)
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
    extraAction?: { label: string; href: string };
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const data = await getMRPRequirementsApi();
      setRequirements(data || []);

      // Auto-select items that need reordering
      const initialSelected = new Set<string>();
      const initialQtys: Record<string, number> = {};

      (data || []).forEach((item) => {
        initialQtys[item.productId] = item.suggestedOrderQty > 0 ? item.suggestedOrderQty : 100;
        if (item.needsReorder) {
          initialSelected.add(item.productId);
        }
      });

      setSelectedProductIds(initialSelected);
      setOrderQuantities(initialQtys);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Calculate MRP",
        message: err.message || "An error occurred while running MRP calculations.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  // Summary Metrics
  const summary = useMemo(() => {
    let shortageCount = 0;
    let totalPlannedDemand = 0;
    let totalEstProcurementCost = 0;

    requirements.forEach((it) => {
      if (it.needsReorder) {
        shortageCount++;
        totalEstProcurementCost += it.estimatedTotalCost;
      }
      totalPlannedDemand += it.plannedDemand;
    });

    return {
      shortageCount,
      totalPlannedDemand,
      totalEstProcurementCost,
      totalItems: requirements.length,
    };
  }, [requirements]);

  // Filtering
  const filteredData = useMemo(() => {
    return requirements.filter((item) => {
      const matchSearch =
        search.trim() === "" ||
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());

      let matchFilter = true;
      if (filterType === "reorder_only") {
        matchFilter = item.needsReorder;
      } else if (filterType === "sufficient_only") {
        matchFilter = !item.needsReorder;
      }

      return matchSearch && matchFilter;
    });
  }, [requirements, search, filterType]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Selection toggle
  const toggleSelect = (productId: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredData.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredData.map((d) => d.productId)));
    }
  };

  const handleQuantityChange = (productId: string, val: number) => {
    setOrderQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, val),
    }));
  };

  // Generate Purchase Order
  const handleGeneratePO = async () => {
    const itemsToOrder = requirements
      .filter((r) => selectedProductIds.has(r.productId))
      .map((r) => ({
        productId: r.productId,
        productName: r.productName,
        sku: r.sku,
        quantity: orderQuantities[r.productId] || r.suggestedOrderQty || 100,
        unitCost: r.unitCost || 40,
      }));

    if (itemsToOrder.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "No Items Selected",
        message: "กรุณาเลือกรายการวัตถุดิบที่ต้องการสร้างใบสั่งซื้อ (PO) อย่างน้อย 1 รายการ",
      });
      return;
    }

    try {
      setIsGeneratingPO(true);
      const res = await autoGeneratePurchaseOrderFromMRPApi(itemsToOrder);

      // GEMINI.md standard Add Success Modal
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Purchase Order Created!",
        message: `สร้างใบสั่งซื้อ ${res.purchase?.reference || "PO"} จำนวน ${itemsToOrder.length} รายการ มูลค่า ฿${Number(
          res.purchase?.total || 0
        ).toLocaleString()} ให้กับผู้ผลิต/ซัพพลายเออร์เรียบร้อยแล้ว`,
        extraAction: {
          label: "ไปหน้ารายการสั่งซื้อ (View PO)",
          href: "/purchases/orders",
        },
      });

      // Refresh requirements
      loadRequirements();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to generate Purchase Order from MRP engine.",
      });
    } finally {
      setIsGeneratingPO(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Factory className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  MRP Material Requirements Planning (การวางแผนความต้องการวัตถุดิบ)
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  คำนวณวัตถุดิบตามแผนคำสั่งผลิต (Work Orders) เทียบสต็อกคงเหลือ และสั่งซื้ออัตโนมัติ (Auto-PO)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="พิมพ์รายงาน"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              Print
            </button>
            <button
              onClick={loadRequirements}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="คำนวณใหม่"
            >
              <RotateCcw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
              Recalculate MRP
            </button>
            <button
              onClick={handleGeneratePO}
              disabled={isGeneratingPO || selectedProductIds.size === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {isGeneratingPO
                ? "กำลังสร้างใบสั่งซื้อ..."
                : `สร้างใบสั่งซื้อ Auto PO (${selectedProductIds.size} รายการ)`}
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Shortage Items */}
          <div className="bg-white p-5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">
                วัตถุดิบขาดแคลน (Shortage)
              </span>
              <p className="text-2xl font-bold text-rose-700 mt-1">
                {summary.shortageCount}{" "}
                <span className="text-sm font-normal text-rose-500">/ {summary.totalItems} รายการ</span>
              </p>
              <p className="text-xs text-rose-600 mt-1">ต้องเปิดใบสั่งซื้อด่วน</p>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Planned Raw Material Demand */}
          <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                ความต้องการตามแผนผลิต
              </span>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {summary.totalPlannedDemand.toLocaleString()}{" "}
                <span className="text-sm font-normal text-gray-500">กก. (kg)</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">คำนวณจาก Work Orders ที่ใช้งานอยู่</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Est. Procurement Cost */}
          <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
                งบประมาณจัดซื้อวัตถุดิบ
              </span>
              <p className="text-2xl font-bold text-amber-800 mt-1">
                {formatCurrency(summary.totalEstProcurementCost)}
              </p>
              <p className="text-xs text-amber-600 mt-1">ประมาณการตามปริมาณที่แนะนำ</p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>

          {/* Quick Link to Work Orders */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                แผนกผลิต (Production)
              </span>
              <Link
                href="/manufacturing/work-orders"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 mt-2"
              >
                ดูใบสั่งผลิต (Work Orders)
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-gray-500 mt-1">เชื่อมโยงตัดสต็อกสูตร BOM</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="ค้นหาชื่อวัตถุดิบ, รหัส SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-3.5 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="reorder_only">เฉพาะรายการที่ขาดแคลน / ต้องสั่งซื้อ</option>
              <option value="all">แสดงวัตถุดิบทั้งหมด</option>
              <option value="sufficient_only">เฉพาะรายการที่มีสต็อกเพียงพอ</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value={10}>10 รายการ/หน้า</option>
              <option value={20}>20 รายการ/หน้า</option>
              <option value={50}>50 รายการ/หน้า</option>
            </select>
          </div>
        </div>

        {/* Requirements Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-indigo-600 transition"
                      title="เลือกทั้งหมด"
                    >
                      {selectedProductIds.size === filteredData.length && filteredData.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">วัตถุดิบ (Raw Material)</th>
                  <th className="py-3 px-4 text-right">สต็อกปัจจุบัน</th>
                  <th className="py-3 px-4 text-right">ต้องการผลิต</th>
                  <th className="py-3 px-4 text-right">จุดเตือนสั่งซื้อ</th>
                  <th className="py-3 px-4 text-right text-rose-700">ขาดแคลน</th>
                  <th className="py-3 px-4 text-center w-36">ปริมาณที่สั่งซื้อ (กก.)</th>
                  <th className="py-3 px-4 text-right">ราคา/กก.</th>
                  <th className="py-3 px-4 text-right font-bold">มูลค่ารวม</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2" />
                      <p>กำลังประมวลผลคำนวณ MRP ความต้องการวัตถุดิบ...</p>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-500">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="text-base font-medium text-gray-700">วัตถุดิบมีสต็อกเพียงพอทุกรายการ</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ไม่มีรายการที่ต้องสั่งซื้อตามเงื่อนไขที่เลือก
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => {
                    const isSelected = selectedProductIds.has(item.productId);
                    const qty = orderQuantities[item.productId] ?? item.suggestedOrderQty ?? 100;
                    const lineCost = qty * item.unitCost;

                    return (
                      <tr
                        key={item.productId}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          isSelected ? "bg-indigo-50/20" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleSelect(item.productId)}
                            className="text-gray-400 hover:text-indigo-600 transition"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Material Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">{item.productName}</div>
                          <div className="text-xs font-mono text-gray-500">{item.sku}</div>
                        </td>

                        {/* Current Stock */}
                        <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                          {item.currentStock.toLocaleString()} {item.unit}
                        </td>

                        {/* Planned Demand */}
                        <td className="py-3.5 px-4 text-right font-medium text-blue-700">
                          {item.plannedDemand > 0 ? (
                            `${item.plannedDemand.toLocaleString()} ${item.unit}`
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        {/* Min Stock Alert */}
                        <td className="py-3.5 px-4 text-right text-gray-600">
                          {item.minStockAlert.toLocaleString()} {item.unit}
                        </td>

                        {/* Shortage Qty */}
                        <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                          {item.shortageQty > 0 ? (
                            <span className="bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              -{item.shortageQty.toLocaleString()} {item.unit}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-normal">พร้อมใช้</span>
                          )}
                        </td>

                        {/* Order Qty Input */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="number"
                            min={1}
                            step={50}
                            value={qty}
                            onChange={(e) =>
                              handleQuantityChange(item.productId, Number(e.target.value))
                            }
                            className="w-24 px-2 py-1 text-right text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </td>

                        {/* Unit Cost */}
                        <td className="py-3.5 px-4 text-right text-gray-700">
                          ฿{item.unitCost.toFixed(2)}
                        </td>

                        {/* Est. Total Cost */}
                        <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                          {formatCurrency(lineCost)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {item.needsReorder ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              ขาดแคลน
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              เพียงพอ
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-500 gap-2">
              <div>
                แสดง {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} ถึง{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} จากทั้งหมด{" "}
                {filteredData.length} รายการ
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-medium text-gray-700">
                  หน้า {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* GEMINI.md Standard Feedback Modal */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform animate-in zoom-in-95 duration-200">
              {/* Add Success (Sparkles in Emerald) */}
              {feedbackModal.type === "add_success" && (
                <>
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {feedbackModal.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {feedbackModal.message}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {feedbackModal.extraAction ? (
                      <>
                        <Link
                          href={feedbackModal.extraAction.href}
                          className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
                        >
                          {feedbackModal.extraAction.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                          className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
                        >
                          Done
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Error Modal */}
              {feedbackModal.type === "error" && (
                <>
                  <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {feedbackModal.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {feedbackModal.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                    className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
                  >
                    OK
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

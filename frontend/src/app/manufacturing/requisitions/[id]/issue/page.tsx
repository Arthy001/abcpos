"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { MaterialRequisition, MaterialRequisitionItem } from "@/types";
import {
  getMaterialRequisitionByIdApi,
  issueMaterialRequisitionApi,
} from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PackageCheck,
  Search,
  QrCode,
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Barcode,
  Layers,
  ChevronRight,
  Factory,
  Boxes,
  Check,
  AlertCircle,
} from "lucide-react";

interface IssueCartItem {
  id: string; // MaterialRequisitionItem id
  rawMaterialId: string;
  name: string;
  sku: string;
  barcode?: string | null;
  unit: string;
  requestedQty: number;
  alreadyIssuedQty: number;
  remainingQty: number;
  availableStock: number;
  qtyToIssue: number;
}

export default function MaterialIssuePage() {
  const params = useParams();
  const router = useRouter();
  const requisitionId = String(params.id);
  const { user } = useAuthStore();

  const [requisition, setRequisition] = useState<MaterialRequisition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scanner & Search state
  const [scanQuery, setScanQuery] = useState<string>("");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [showBarcodeModal, setShowBarcodeModal] = useState<boolean>(false);
  const [modalBarcode, setModalBarcode] = useState<string>("");

  // Cart state for items being issued in this batch
  const [issueCart, setIssueCart] = useState<Record<string, IssueCartItem>>({});
  const [issuedByName, setIssuedByName] = useState<string>(user?.name || "Warehouse Staff");
  const [issueNotes, setIssueNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Feedback Modal
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "issue_success" | "error";
    title: string;
    message: string;
    isCompleted?: boolean;
  }>({
    isOpen: false,
    type: "issue_success",
    title: "",
    message: "",
  });

  const scanInputRef = useRef<HTMLInputElement>(null);

  // Web Audio API Synthesis
  const playSound = (type: "beep" | "error" | "chime") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "beep") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "chime") {
        const notes = [587.33, 880, 1174.66]; // D5, A5, D6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.3);
        });
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch {
      // AudioContext policy fallback
    }
  };

  const loadRequisition = async () => {
    try {
      setLoading(true);
      const data = await getMaterialRequisitionByIdApi(requisitionId);
      setRequisition(data);

      // Pre-fill cart with 0 qty for convenient inspection
      const initialCart: Record<string, IssueCartItem> = {};
      data.items?.forEach((item) => {
        const remaining = Math.max(0, item.requestedQty - item.issuedQty);
        // Find stock specifically in this requisition's warehouse
        const matchingWhStock = (item.rawMaterial as any)?.stocks?.find(
          (s: any) => s.warehouseId === data.warehouseId
        );
        const whStockQty = matchingWhStock ? matchingWhStock.quantity : (data.warehouseId ? 0 : (item.rawMaterial?.stock || 0));

        initialCart[item.id] = {
          id: item.id,
          rawMaterialId: item.rawMaterialId,
          name: item.rawMaterial?.name || "Raw Material",
          sku: item.rawMaterial?.sku || "",
          barcode: item.rawMaterial?.barcode,
          unit: item.unit,
          requestedQty: item.requestedQty,
          alreadyIssuedQty: item.issuedQty,
          remainingQty: remaining,
          availableStock: whStockQty,
          qtyToIssue: 0,
        };
      });
      setIssueCart(initialCart);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Load Failed",
        message: err.message || "Failed to load requisition",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requisitionId) {
      loadRequisition();
    }
  }, [requisitionId]);

  // Handle Scanning logic
  const handleProcessScan = (queryRaw: string) => {
    const query = queryRaw.trim().toLowerCase();
    if (!query || !requisition?.items) return;

    // Search item by barcode, SKU, or exact name
    const targetItem = requisition.items.find((i) => {
      const b = i.rawMaterial?.barcode?.toLowerCase();
      const s = i.rawMaterial?.sku?.toLowerCase();
      const n = i.rawMaterial?.name?.toLowerCase();
      return b === query || s === query || n === query;
    });

    if (targetItem) {
      const current = issueCart[targetItem.id];
      const remaining = Math.max(0, targetItem.requestedQty - targetItem.issuedQty);

      if (remaining <= 0) {
        playSound("error");
        alert(`วัตถุดิบ "${targetItem.rawMaterial?.name}" ได้รับการเบิกจ่ายครบตามจำนวนแล้ว`);
        return;
      }

      // Increment qtyToIssue by 1 (or by standard batch)
      const nextQty = Math.min(remaining, (current?.qtyToIssue || 0) + 1);
      setIssueCart((prev) => ({
        ...prev,
        [targetItem.id]: {
          ...prev[targetItem.id],
          qtyToIssue: nextQty,
        },
      }));

      playSound("beep");
      setScanQuery("");
    } else {
      playSound("error");
      alert(`ไม่พบวัตถุดิบที่ตรงกับ Barcode/SKU: "${queryRaw}" ในใบเบิกนี้`);
    }
  };

  // Stepper increment / decrement
  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setIssueCart((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      const next = Math.max(0, Math.min(item.remainingQty, item.qtyToIssue + delta));
      return {
        ...prev,
        [itemId]: { ...item, qtyToIssue: next },
      };
    });
  };

  // Direct input change
  const handleSetCartQty = (itemId: string, val: number) => {
    setIssueCart((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      const sanitized = Math.max(0, isNaN(val) ? 0 : val);
      return {
        ...prev,
        [itemId]: { ...item, qtyToIssue: sanitized },
      };
    });
  };

  // Fill all remaining for a single item
  const handleFillItemRemaining = (itemId: string) => {
    setIssueCart((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      return {
        ...prev,
        [itemId]: { ...item, qtyToIssue: item.remainingQty },
      };
    });
    playSound("beep");
  };

  // Fill all remaining for all items in requisition
  const handleFillAllRemaining = () => {
    setIssueCart((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = {
          ...next[key],
          qtyToIssue: next[key].remainingQty,
        };
      });
      return next;
    });
    playSound("chime");
  };

  // Clear all current issue cart quantities
  const handleClearCart = () => {
    setIssueCart((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = { ...next[key], qtyToIssue: 0 };
      });
      return next;
    });
  };

  // Active items being issued in this submission
  const activeIssues = useMemo(() => {
    return Object.values(issueCart).filter((item) => item.qtyToIssue > 0);
  }, [issueCart]);

  const totalItemsToIssue = activeIssues.length;
  const totalUnitsToIssue = activeIssues.reduce((acc, i) => acc + i.qtyToIssue, 0);

  // Submit Issue
  const handleSubmitIssue = async () => {
    if (activeIssues.length === 0) {
      playSound("error");
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "No Items Selected",
        message: "กรุณาระบุจำนวนวัตถุดิบที่ต้องการเบิกจ่ายอย่างน้อย 1 รายการ",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await issueMaterialRequisitionApi(requisitionId, {
        issuedBy: issuedByName || "Warehouse Staff",
        notes: issueNotes || undefined,
        items: activeIssues.map((item) => ({
          id: item.id,
          issueQty: item.qtyToIssue,
        })),
      });

      playSound("chime");
      const isCompleted = res.requisition.status === "ISSUED";

      setFeedbackModal({
        isOpen: true,
        type: "issue_success",
        title: isCompleted ? "Requisition Fully Issued!" : "Partial Issue Recorded!",
        message: isCompleted
          ? `ใบเบิก ${res.requisition.requisitionNo} ได้รับการเบิกจ่ายวัตถุดิบครบถ้วนเรียบร้อยแล้ว สต็อกถูกตัดออกแล้ว`
          : `บันทึกการเบิกจ่ายบางส่วนเรียบร้อยแล้ว (${totalUnitsToIssue} หน่วย) และตัดสต็อกตามจริง`,
        isCompleted,
      });

      // Reload data
      await loadRequisition();
    } catch (err: any) {
      playSound("error");
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Issue Failed",
        message: err.message || "Failed to record material issue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter checklist
  const filteredChecklist = useMemo(() => {
    if (!requisition?.items) return [];
    return requisition.items.filter((item) => {
      const q = filterQuery.trim().toLowerCase();
      if (!q) return true;
      const n = item.rawMaterial?.name?.toLowerCase() || "";
      const s = item.rawMaterial?.sku?.toLowerCase() || "";
      const b = item.rawMaterial?.barcode?.toLowerCase() || "";
      return n.includes(q) || s.includes(q) || b.includes(q);
    });
  }, [requisition, filterQuery]);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Header & Work Order Reference */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/manufacturing/requisitions"
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                title="กลับไปหน้ารายการใบเบิก"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    เบิกจ่ายวัตถุดิบ: {requisition?.requisitionNo || "Loading..."}
                  </h1>
                  {requisition && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        requisition.status === "ISSUED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : requisition.status === "PARTIAL"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {requisition.status}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span>
                    WO:{" "}
                    <Link
                      href="/manufacturing/work-orders"
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {requisition?.workOrder?.orderNo}
                    </Link>
                  </span>
                  <span>•</span>
                  <span>สินค้า: {requisition?.workOrder?.finishedProduct?.name || "-"}</span>
                  <span>•</span>
                  <span>คลังจ่าย: {requisition?.warehouse?.name || "คลังหลัก"}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                title={soundEnabled ? "Mute Sound Feedback" : "Enable Sound Feedback"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowBarcodeModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">สแกนบาร์โค้ด</span>
              </button>

              <button
                type="button"
                onClick={handleFillAllRemaining}
                disabled={requisition?.status === "ISSUED"}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>เบิกครบทั้งหมด (Fill All)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* TWO-COLUMN WORKSPACE (CHECKLIST vs ISSUE CART) */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: CHECKLIST & SCAN CONSOLE (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Scan Input Console */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={scanInputRef}
                    type="text"
                    placeholder="ยิงสแกน Barcode หรือพิมพ์ SKU แล้วกด Enter..."
                    value={scanQuery}
                    onChange={(e) => setScanQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleProcessScan(scanQuery);
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/30 focus:border-[#FE9F43] font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleProcessScan(scanQuery)}
                  className="px-4 py-2.5 bg-[#FE9F43] hover:bg-[#e88d35] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ค้นหา/เพิ่ม
                </button>
              </div>

              {/* Checklist Filter */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-500 font-semibold">
                  รายการวัตถุดิบตามใบเบิก ({filteredChecklist.length} รายการ)
                </span>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="กรองชื่อวัตถุดิบ..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>
              </div>
            </div>

            {/* Checklist Material Cards */}
            <div className="space-y-3">
              {loading ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 text-sm">
                  กำลังโหลดรายการวัตถุดิบ...
                </div>
              ) : filteredChecklist.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 text-sm">
                  ไม่พบรายการวัตถุดิบ
                </div>
              ) : (
                filteredChecklist.map((item) => {
                  const cartItem = issueCart[item.id];
                  const remaining = Math.max(0, item.requestedQty - item.issuedQty);
                  const isDone = item.isIssued || remaining === 0;
                  const progressPct =
                    item.requestedQty > 0
                      ? Math.min(100, Math.round((item.issuedQty / item.requestedQty) * 100))
                      : 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone
                          ? "bg-emerald-50/40 border-emerald-200"
                          : cartItem?.qtyToIssue > 0
                          ? "bg-blue-50/40 border-blue-200 shadow-xs"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">
                              {item.rawMaterial?.name || "Raw Material"}
                            </span>
                            {isDone && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> ครบแล้ว
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>SKU: {item.rawMaterial?.sku || "-"}</span>
                            {item.rawMaterial?.barcode && (
                              <span>• Barcode: {item.rawMaterial.barcode}</span>
                            )}
                            <span>• ในคลังนี้: <strong className={cartItem?.availableStock > 0 ? "text-emerald-600" : "text-rose-600 font-bold"}>{cartItem?.availableStock ?? (item.rawMaterial?.stock || 0)}</strong> {item.unit}</span>
                            {cartItem?.availableStock === 0 && (
                              <span className="text-rose-600 font-semibold block text-[10px]">
                                ⚠️ คลังนี้ไม่มีของ (สต็อกรวมทั่วบริษัท: {item.rawMaterial?.stock || 0} {item.unit})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick fill button */}
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => handleFillItemRemaining(item.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            เบิกเต็ม {Number(remaining.toFixed(4))} {item.unit}
                          </button>
                        )}
                      </div>

                      {/* Progress Bar & Numerical stats */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-medium">
                            ขอเบิก: <strong className="text-gray-900">{Number(Number(item.requestedQty).toFixed(4))}</strong> {item.unit}
                          </span>
                          <span className="text-gray-500 font-medium">
                            จ่ายแล้ว: <strong className="text-emerald-600">{Number(Number(item.issuedQty).toFixed(4))}</strong> / เหลือ:{" "}
                            <strong className="text-amber-600">{Number(remaining.toFixed(4))}</strong> {item.unit}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDone
                                ? "bg-emerald-500"
                                : progressPct > 0
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ISSUE CART & CONFIRMATION (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-base">
                    รายการที่จะตัดเบิกรอบนี้ ({totalItemsToIssue})
                  </h3>
                </div>
                {totalItemsToIssue > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {activeIssues.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 space-y-2">
                    <Boxes className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="text-xs">ยังไม่มีรายการที่เลือกเบิกจ่ายในรอบนี้</p>
                    <p className="text-[11px] text-gray-400">
                      ยิงสแกนบาร์โค้ด หรือกด "เบิกเต็ม" จากเช็คลิสต์ด้านซ้าย
                    </p>
                  </div>
                ) : (
                  activeIssues.map((item) => {
                    const isExceedingStock = item.qtyToIssue > item.availableStock;
                    const isExceedingReq = item.qtyToIssue > item.remainingQty;

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                            <p className="text-[10px] text-gray-400">
                              เหลือต้องเบิก: {Number(item.remainingQty.toFixed(4))} {item.unit} | ในคลัง: {Number(item.availableStock.toFixed(4))}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSetCartQty(item.id, 0)}
                            className="text-gray-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Stepper Controls */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.qtyToIssue}
                              onChange={(e) => handleSetCartQty(item.id, parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-900 text-xs focus:outline-none focus:border-[#FE9F43]"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs text-gray-500 font-medium ml-1">{item.unit}</span>
                          </div>

                          <span className="text-xs font-bold text-emerald-600">
                            เบิก {Number(item.qtyToIssue.toFixed(4))} {item.unit}
                          </span>
                        </div>

                        {/* Validation Warnings */}
                        {isExceedingStock && (
                          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold">
                            <AlertCircle className="w-3 h-3" />
                            <span>คำเตือน: จำนวนเบิกมากกว่าสต็อกคงเหลือในคลัง ({item.availableStock})</span>
                          </div>
                        )}
                        {isExceedingReq && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                            <AlertCircle className="w-3 h-3" />
                            <span>คำเตือน: จำนวนเบิกเกินยอดที่ขอตามใบเบิก</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Operator details & Notes */}
              <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    ชื่อเจ้าหน้าที่คลังที่ทำการเบิกจ่าย *
                  </label>
                  <input
                    type="text"
                    required
                    value={issuedByName}
                    onChange={(e) => setIssuedByName(e.target.value)}
                    placeholder="เช่น สมชาย คลังสินค้า"
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">หมายเหตุเพิ่มเติม</label>
                  <textarea
                    rows={2}
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    placeholder="เช่น เบิกไปให้ Extruder #1 กะเช้า..."
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>จำนวนรายการที่จะเบิก:</span>
                  <strong className="text-gray-900">{totalItemsToIssue} รายการ</strong>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>ปริมาณรวมที่จะตัดสต็อก:</span>
                  <strong className="text-emerald-600 font-bold">{totalUnitsToIssue.toLocaleString()} หน่วย</strong>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting || totalItemsToIssue === 0}
                  onClick={handleSubmitIssue}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "กำลังบันทึกและตัดสต็อก..."
                      : "ยืนยันตัดเบิกจ่ายวัตถุดิบ (Confirm Issue)"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* BARCODE SCANNER MODAL */}
        {/* ========================================== */}
        {showBarcodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-sm">สแกน Barcode / SKU</h3>
                </div>
                <button
                  onClick={() => setShowBarcodeModal(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (modalBarcode.trim()) {
                    handleProcessScan(modalBarcode);
                    setModalBarcode("");
                    setShowBarcodeModal(false);
                  }
                }}
                className="p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    รหัสบาร์โค้ด หรือ SKU
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="วางเคอร์เซอร์แล้วยิงบาร์โค้ด..."
                    value={modalBarcode}
                    onChange={(e) => setModalBarcode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBarcodeModal(false)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                  >
                    ปิด
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                  >
                    ค้นหา
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* FEEDBACK MODAL (GEMINI.md standard) */}
        {/* ========================================== */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              {feedbackModal.type === "issue_success" && (
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "error" && (
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900 mb-2">{feedbackModal.title}</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">{feedbackModal.message}</p>

              {feedbackModal.type === "issue_success" ? (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackModal({ ...feedbackModal, isOpen: false });
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    อยู่หน้านี้ต่อ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackModal({ ...feedbackModal, isOpen: false });
                      router.push("/manufacturing/requisitions");
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    กลับรายการใบเบิก
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

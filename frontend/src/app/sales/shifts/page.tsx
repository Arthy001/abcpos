"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PosShift, PosShiftMovement } from "@/types";
import {
  fetchCurrentShift,
  openShiftApi,
  recordShiftMovementApi,
  closeShiftApi,
  fetchShiftsHistory,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  RotateCcw,
  Search,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  FileSpreadsheet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  X,
  Sparkles,
  Eye,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Banknote,
} from "lucide-react";
import Link from "next/link";

export default function PosShiftsPage() {
  const [currentShiftData, setCurrentShiftData] = useState<{
    hasActiveShift: boolean;
    shift: PosShift | null;
    liveMetrics?: any;
  }>({ hasActiveShift: false, shift: null });

  const [shiftsHistory, setShiftsHistory] = useState<PosShift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [showOpenModal, setShowOpenModal] = useState<boolean>(false);
  const [openCashier, setOpenCashier] = useState<string>("Admin");
  const [openFloat, setOpenFloat] = useState<number>(1000);
  const [openNotes, setOpenNotes] = useState<string>("");
  const [isOpening, setIsOpening] = useState<boolean>(false);

  const [showMovementModal, setShowMovementModal] = useState<boolean>(false);
  const [movementType, setMovementType] = useState<"PAY_IN" | "PAY_OUT">("PAY_IN");
  const [movementAmount, setMovementAmount] = useState<number>(100);
  const [movementReason, setMovementReason] = useState<string>("");
  const [isRecordingMovement, setIsRecordingMovement] = useState<boolean>(false);

  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [closingCashCounted, setClosingCashCounted] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>("");
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Printable Z-Report Modal
  const [selectedZReportShift, setSelectedZReportShift] = useState<PosShift | null>(null);

  // Feedback Modal
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
      const [currentRes, historyRes] = await Promise.all([
        fetchCurrentShift(),
        fetchShiftsHistory({
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search || undefined,
        }),
      ]);

      setCurrentShiftData(currentRes);
      setShiftsHistory(historyRes);

      if (currentRes.hasActiveShift && currentRes.liveMetrics) {
        setClosingCashCounted(currentRes.liveMetrics.expectedCash || 0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsOpening(true);
      const newShift = await openShiftApi({
        cashierName: openCashier,
        openingFloat: Number(openFloat),
        notes: openNotes,
      });

      setShowOpenModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Shift Opened!",
        message: `Shift #${newShift.shiftNumber} has been opened with opening float ฿${newShift.openingFloat.toLocaleString()}.`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Open Shift",
        message: err.message || "An error occurred while opening shift.",
      });
    } finally {
      setIsOpening(false);
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShiftData.shift) return;
    try {
      setIsRecordingMovement(true);
      await recordShiftMovementApi({
        shiftId: currentShiftData.shift.id,
        type: movementType,
        amount: Number(movementAmount),
        reason: movementReason,
      });

      setShowMovementModal(false);
      setMovementReason("");
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: movementType === "PAY_IN" ? "Cash In Recorded" : "Cash Out Recorded",
        message: `Successfully recorded ฿${Number(movementAmount).toLocaleString()} ${movementType === "PAY_IN" ? "into drawer" : "out of drawer"}.`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Cash Movement Failed",
        message: err.message || "Could not record cash movement.",
      });
    } finally {
      setIsRecordingMovement(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShiftData.shift) return;
    try {
      setIsClosing(true);
      const closed = await closeShiftApi({
        shiftId: currentShiftData.shift.id,
        closingCashCounted: Number(closingCashCounted),
        notes: closeNotes,
      });

      setShowCloseModal(false);
      setSelectedZReportShift(closed);
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Close Shift",
        message: err.message || "An error occurred while closing shift.",
      });
    } finally {
      setIsClosing(false);
    }
  };

  // Pagination
  const filteredShifts = shiftsHistory.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.shiftNumber.toLowerCase().includes(q) ||
      s.cashierName.toLowerCase().includes(q) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    );
  });

  const totalEntries = filteredShifts.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              POS Shifts & Cash Drawer Reconciliation
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Open/close cashier shifts, track drawer floats, register movements, and Z-Reports
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : "text-gray-500"}`} />
              <span>Refresh</span>
            </button>

            {!currentShiftData.hasActiveShift ? (
              <button
                onClick={() => setShowOpenModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>+ Open Shift</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Close Shift & Z-Report</span>
              </button>
            )}

            <Link
              href="/pos"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Go to POS
            </Link>
          </div>
        </div>

        {/* ACTIVE SHIFT BANNER CARD */}
        {currentShiftData.hasActiveShift && currentShiftData.shift && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-6 rounded-3xl border border-emerald-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white animate-pulse">
                    🟢 Shift Active
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                    {currentShiftData.shift.shiftNumber}
                  </span>
                </div>
                <h2 className="text-xl font-black text-gray-900">
                  Cashier: {currentShiftData.shift.cashierName}
                </h2>
                <p className="text-xs text-gray-600">
                  Opened at: {new Date(currentShiftData.shift.openedAt).toLocaleString()} | Opening Float:{" "}
                  <strong className="text-emerald-800">
                    ฿{currentShiftData.shift.openingFloat.toLocaleString()}
                  </strong>
                </p>
              </div>

              {/* Real-time Drawer Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-emerald-100 shadow-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Cash Sales</p>
                  <p className="text-base font-extrabold text-emerald-700">
                    ฿{(currentShiftData.liveMetrics?.totalCashSales || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Digital / Card</p>
                  <p className="text-base font-extrabold text-blue-700">
                    ฿{(
                      (currentShiftData.liveMetrics?.totalPromptPaySales || 0) +
                      (currentShiftData.liveMetrics?.totalCardSales || 0)
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Orders</p>
                  <p className="text-base font-extrabold text-gray-800">
                    {currentShiftData.liveMetrics?.orderCount || 0} bills
                  </p>
                </div>
                <div className="border-l border-emerald-100 pl-3">
                  <p className="text-[10px] uppercase font-bold text-emerald-800">In Drawer Now</p>
                  <p className="text-lg font-black text-orange-600">
                    ฿{(currentShiftData.liveMetrics?.expectedCash || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMovementModal(true)}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pay In / Out</span>
                </button>
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Close Shift</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentShiftData.hasActiveShift && !loading && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">No Register Shift is Currently Active</h3>
                <p className="text-xs text-amber-700">
                  Opening float has not been registered yet. Open a shift before processing cash transactions.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              + Open New Shift Now
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search shift number, cashier, or notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="w-full md:w-52">
            <SearchableSelect
              placeholder="All Statuses"
              options={[
                { label: "All Statuses", value: "all" },
                { label: "OPEN", value: "OPEN" },
                { label: "CLOSED", value: "CLOSED" },
              ]}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Shift History Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">
              Shifts & Z-Reports History ({totalEntries} shifts)
            </h2>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Shift #</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4">Opened / Closed</th>
                  <th className="py-3 px-4 text-right">Opening Float</th>
                  <th className="py-3 px-4 text-right">Total Sales</th>
                  <th className="py-3 px-4 text-right">Expected Drawer</th>
                  <th className="py-3 px-4 text-right">Counted Cash</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Z-Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedShifts.map((s) => {
                  const variance = s.cashVariance || 0;
                  const isBalanced = Math.abs(variance) < 0.01;
                  const isOver = variance > 0;

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {s.shiftNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {s.cashierName}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        <span className="block font-medium text-gray-700">
                          {new Date(s.openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {s.closedAt
                            ? `Closed: ${new Date(s.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : "Running..."}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-700 font-medium">
                        ฿{s.openingFloat.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        ฿{s.totalSales.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-600">
                        {s.expectedCash !== null ? `฿${(s.expectedCash || 0).toLocaleString()}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {s.closingCashCounted !== null ? `฿${(s.closingCashCounted || 0).toLocaleString()}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {s.status === "CLOSED" ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              isBalanced
                                ? "bg-emerald-50 text-emerald-700"
                                : isOver
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isBalanced ? "Exact (฿0)" : `${isOver ? "+฿" : "-฿"}${Math.abs(variance).toLocaleString()}`}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            s.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedZReportShift(s)}
                          title="View Z-Report Slip"
                          className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 font-bold text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>Z-Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedShifts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-gray-400">
                      No shift records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-gray-500 gap-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries per page (Total {totalEntries})</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span className="font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: OPEN SHIFT MODAL */}
        {/* ========================================================================= */}
        {showOpenModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2 text-gray-900">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Unlock className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">Open Register Shift</h3>
                </div>
                <button
                  onClick={() => setShowOpenModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleOpenShift} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Cashier Name</label>
                  <input
                    type="text"
                    value={openCashier}
                    onChange={(e) => setOpenCashier(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Opening Float (เงินทอนเริ่มต้นในลิ้นชัก ฿)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={openFloat}
                    onChange={(e) => setOpenFloat(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <div className="flex space-x-2 mt-2">
                    {[500, 1000, 2000, 3000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setOpenFloat(preset)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                      >
                        ฿{preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Notes (Optional)</label>
                  <textarea
                    value={openNotes}
                    onChange={(e) => setOpenNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Morning Shift Shift 1"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOpenModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isOpening}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    {isOpening ? "Opening..." : "Confirm Open Shift"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: CASH MOVEMENT (PAY IN / PAY OUT) */}
        {/* ========================================================================= */}
        {showMovementModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2 text-gray-900">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold">Cash Drawer Movement</h3>
                </div>
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecordMovement} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType("PAY_IN")}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      movementType === "PAY_IN"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    <span>Pay In (ใส่เงินเพิ่ม)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType("PAY_OUT")}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      movementType === "PAY_OUT"
                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    <span>Pay Out (หยิบเงินออก)</span>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Amount (฿)</label>
                  <input
                    type="number"
                    step="any"
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Reason / Description</label>
                  <input
                    type="text"
                    value={movementReason}
                    onChange={(e) => setMovementReason(e.target.value)}
                    required
                    placeholder="e.g. Added ฿20 change coins / Drop cash to safe"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMovementModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecordingMovement}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    {isRecordingMovement ? "Saving..." : "Record Movement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: CLOSE SHIFT MODAL & DRAWER RECONCILIATION */}
        {/* ========================================================================= */}
        {showCloseModal && currentShiftData.shift && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2 text-gray-900">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Close Shift & Drawer Reconciliation</h3>
                    <p className="text-[11px] text-gray-500 font-mono">{currentShiftData.shift.shiftNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shift Breakdown Box */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Opening Float:</span>
                  <span className="font-semibold text-gray-800">฿{currentShiftData.shift.openingFloat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cash Sales ({currentShiftData.liveMetrics?.orderCount || 0} orders):</span>
                  <span className="font-semibold text-emerald-700">+฿{(currentShiftData.liveMetrics?.totalCashSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cash In (Pay In):</span>
                  <span className="font-semibold text-gray-800">+฿{(currentShiftData.liveMetrics?.cashIn || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cash Out (Pay Out):</span>
                  <span className="font-semibold text-rose-600">-฿{(currentShiftData.liveMetrics?.cashOut || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                  <span>Expected Cash in Drawer:</span>
                  <span className="text-orange-600">฿{(currentShiftData.liveMetrics?.expectedCash || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                  <span>Digital Payments (PromptPay / Card):</span>
                  <span className="font-semibold">
                    ฿{(
                      (currentShiftData.liveMetrics?.totalPromptPaySales || 0) +
                      (currentShiftData.liveMetrics?.totalCardSales || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <form onSubmit={handleCloseShift} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Counted Cash in Drawer (เงินสดที่นับได้จริง ฿)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={closingCashCounted}
                    onChange={(e) => setClosingCashCounted(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-lg font-black text-gray-900 focus:ring-2 focus:ring-orange-500"
                  />

                  {/* Real-time Variance Preview */}
                  {(() => {
                    const expected = currentShiftData.liveMetrics?.expectedCash || 0;
                    const diff = closingCashCounted - expected;
                    const isDiffZero = Math.abs(diff) < 0.01;
                    return (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center justify-between font-bold ${
                          isDiffZero
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : diff > 0
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                      >
                        <span>Drawer Variance:</span>
                        <span>
                          {isDiffZero
                            ? "Exact Balanced (฿0)"
                            : diff > 0
                            ? `Cash Over +฿${diff.toLocaleString()}`
                            : `Cash Short -฿${Math.abs(diff).toLocaleString()}`}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Closing Notes</label>
                  <input
                    type="text"
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    placeholder="e.g. End of shift, drawer reconciled with safe drop"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-400 focus:bg-white"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCloseModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isClosing}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    {isClosing ? "Closing Shift..." : "Close Shift & Print Z-Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: PRINTABLE Z-REPORT THERMAL SLIP MODAL */}
        {/* ========================================================================= */}
        {selectedZReportShift && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2 text-gray-900">
                  <Receipt className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold">Shift Z-Report Slip</h3>
                </div>
                <button
                  onClick={() => setSelectedZReportShift(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Thermal Receipt */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 font-mono text-xs text-gray-800 space-y-3">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-extrabold tracking-tight text-gray-900">ABC POS RETAIL</h2>
                  <p className="text-[10px] text-gray-500">123 Business Avenue, Bangkok</p>
                  <div className="border-b border-dashed border-gray-300 my-2"></div>
                  <p className="font-black text-gray-900 text-xs">*** SHIFT Z-REPORT ***</p>
                  <p className="text-[11px] text-gray-700 font-bold">Shift: {selectedZReportShift.shiftNumber}</p>
                  <p className="text-[10px] text-gray-500">
                    Opened: {new Date(selectedZReportShift.openedAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Closed: {selectedZReportShift.closedAt ? new Date(selectedZReportShift.closedAt).toLocaleString() : "ACTIVE"}
                  </p>
                  <p className="text-[10px] text-gray-500">Cashier: {selectedZReportShift.cashierName}</p>
                </div>

                <div className="border-b border-dashed border-gray-300 my-2"></div>

                {/* Sales Breakdown */}
                <div className="space-y-1 text-[11px]">
                  <p className="font-bold text-gray-900 uppercase">Sales By Tender:</p>
                  <div className="flex justify-between">
                    <span>Cash Sales:</span>
                    <span>฿{selectedZReportShift.totalCashSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PromptPay QR:</span>
                    <span>฿{selectedZReportShift.totalPromptPaySales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credit Card:</span>
                    <span>฿{selectedZReportShift.totalCardSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-dashed border-gray-200">
                    <span>Total Sales ({selectedZReportShift.orderCount} bills):</span>
                    <span>฿{selectedZReportShift.totalSales.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-gray-300 my-2"></div>

                {/* Drawer Reconciliation */}
                <div className="space-y-1 text-[11px]">
                  <p className="font-bold text-gray-900 uppercase">Cash Reconciliation:</p>
                  <div className="flex justify-between">
                    <span>Opening Float:</span>
                    <span>฿{selectedZReportShift.openingFloat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Sales:</span>
                    <span>+฿{selectedZReportShift.totalCashSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pay In:</span>
                    <span>+฿{selectedZReportShift.cashIn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Pay Out:</span>
                    <span>-฿{selectedZReportShift.cashOut.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-dashed border-gray-200">
                    <span>Expected in Drawer:</span>
                    <span>฿{(selectedZReportShift.expectedCash || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Actual Counted:</span>
                    <span>฿{(selectedZReportShift.closingCashCounted || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-dashed border-gray-300">
                    <span>Variance:</span>
                    <span
                      className={
                        (selectedZReportShift.cashVariance || 0) === 0
                          ? "text-emerald-700"
                          : (selectedZReportShift.cashVariance || 0) > 0
                          ? "text-amber-700"
                          : "text-rose-700"
                      }
                    >
                      {(selectedZReportShift.cashVariance || 0) >= 0 ? "+฿" : "-฿"}
                      {Math.abs(selectedZReportShift.cashVariance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-b border-dashed border-gray-300 my-2"></div>
                <div className="text-center text-[10px] text-gray-400">
                  <p>*** END OF SHIFT REPORT ***</p>
                  <p>Manager Signature: __________________</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => setSelectedZReportShift(null)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Z-Report</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK MODAL */}
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
}

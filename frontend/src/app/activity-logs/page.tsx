"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuditLogItem } from "@/types";
import {
  fetchAuditLogsApi,
  restoreAuditLogApi,
  deleteAuditLogApi,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  Eye,
  X,
  History,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Tag,
  Scale,
  Warehouse as WarehouseIcon,
  Store as StoreIcon,
  ShieldCheck,
  Sliders,
  Package,
  Clock,
  User,
  Code,
} from "lucide-react";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
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

  // View Snapshot Modal
  const [viewLog, setViewLog] = useState<AuditLogItem | null>(null);

  // Restore Confirmation Modal
  const [restoringLog, setRestoringLog] = useState<AuditLogItem | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Permanent Delete Log Modal
  const [deletingLog, setDeletingLog] = useState<AuditLogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogsApi({
        action: actionFilter,
        entityType: entityFilter,
        search: search.trim() || undefined,
      });
      setLogs(data || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Activity Logs",
        message: err.message || "An error occurred while fetching audit logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actionFilter, entityFilter, search]);

  const handleConfirmRestore = async () => {
    if (!restoringLog) return;
    const itemTitle = `${restoringLog.entityType}: ${restoringLog.entityName}`;
    try {
      setIsRestoring(true);
      const res = await restoreAuditLogApi(restoringLog.id);
      setRestoringLog(null);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Item Restored!",
        message: res.message || `Successfully restored "${itemTitle}" back into the system.`,
        itemName: itemTitle,
      });
      loadData();
    } catch (err: any) {
      setRestoringLog(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Restore Failed",
        message: err.message || "Failed to restore item.",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleConfirmDeleteLog = async () => {
    if (!deletingLog) return;
    try {
      setIsDeleting(true);
      await deleteAuditLogApi(deletingLog.id);
      setDeletingLog(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Log Entry Deleted",
        message: "Activity log snapshot has been permanently removed.",
      });
      loadData();
    } catch (err: any) {
      setDeletingLog(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "Failed to delete log entry.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedLogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedLogs.map((l) => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "CATEGORY":
      case "SUBCATEGORY":
        return <Layers className="w-3.5 h-3.5" />;
      case "BRAND":
        return <Tag className="w-3.5 h-3.5" />;
      case "UNIT":
        return <Scale className="w-3.5 h-3.5" />;
      case "WAREHOUSE":
        return <WarehouseIcon className="w-3.5 h-3.5" />;
      case "STORE":
        return <StoreIcon className="w-3.5 h-3.5" />;
      case "WARRANTY":
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case "VARIANT":
        return <Sliders className="w-3.5 h-3.5" />;
      case "PRODUCT":
      default:
        return <Package className="w-3.5 h-3.5" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "DELETE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <Trash2 className="w-3 h-3 mr-1" />
            DELETED
          </span>
        );
      case "RESTORED":
      case "RESTORE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            RESTORED
          </span>
        );
      case "CREATE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <Sparkles className="w-3 h-3 mr-1" />
            CREATED
          </span>
        );
      case "UPDATE":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
            UPDATED
          </span>
        );
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Timestamp", "Action", "Entity Type", "Item Name", "User", "Data Snapshot"];
    const rows = logs.map((l) => [
      `"${formatDate(l.createdAt)}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityName.replace(/"/g, '""')}"`,
      `"${l.user || "Admin"}"`,
      `"${l.data.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `activity_logs_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF / Print
  const handleExportPDF = () => {
    window.print();
  };

  // Pagination calculations
  const totalPages = Math.ceil(logs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, currentPage, pageSize]);

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">Activity Logs & Recycle Bin</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Full audit trail of deleted records with one-click data recovery
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export */}
            <button
              title="Export PDF / Print"
              onClick={handleExportPDF}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export */}
            <button
              title="Export CSV"
              onClick={handleExportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table Card Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search item name, user, data..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white text-gray-900 placeholder-gray-400"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>

            <div className="flex items-center space-x-2">
              {/* Action Filter */}
              <div className="w-36">
                <SearchableSelect
                  size="sm"
                  searchable={false}
                  showAllOption
                  allOptionLabel="Action: All"
                  options={[
                    { value: "DELETE", label: "Deleted" },
                    { value: "RESTORE", label: "Restored" },
                    { value: "CREATE", label: "Created" },
                    { value: "UPDATE", label: "Updated" },
                  ]}
                  value={actionFilter}
                  onChange={(val) => {
                    setActionFilter(val);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Entity Type Filter */}
              <div className="w-40">
                <SearchableSelect
                  size="sm"
                  searchable={false}
                  showAllOption
                  allOptionLabel="Entity: All"
                  options={[
                    { value: "CATEGORY", label: "Category" },
                    { value: "SUBCATEGORY", label: "Sub Category" },
                    { value: "BRAND", label: "Brand" },
                    { value: "UNIT", label: "Unit" },
                    { value: "WAREHOUSE", label: "Warehouse" },
                    { value: "STORE", label: "Store" },
                    { value: "WARRANTY", label: "Warranty" },
                    { value: "VARIANT", label: "Variant" },
                    { value: "PRODUCT", label: "Product" },
                  ]}
                  value={entityFilter}
                  onChange={(val) => {
                    setEntityFilter(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Clean Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-gray-100 text-gray-900 bg-gray-50/70">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedLogs.length > 0 && selectedIds.length === paginatedLogs.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-gray-300"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-gray-900">Item / Target</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Entity Type</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Action</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Performed By</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Date & Time</th>
                  <th className="py-3 px-4 text-right font-bold text-gray-900">Action / Restore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedLogs.map((log) => {
                  const isSelected = selectedIds.includes(log.id);

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-gray-50/60 transition-colors ${isSelected ? "bg-orange-50/40" : ""}`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(log.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-gray-300"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getEntityIcon(log.entityType)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{log.entityName}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">ID: {log.entityId.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
                          {log.entityType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getActionBadge(log.action)}</td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        <span className="inline-flex items-center">
                          <User className="w-3 h-3 mr-1 text-gray-400" />
                          {log.user || "Admin"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                        <span className="inline-flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          {formatDate(log.createdAt)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* 1. View Snapshot */}
                          <button
                            onClick={() => setViewLog(log)}
                            title="View Data Snapshot"
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors bg-white shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Restore Button or Restored Badge */}
                          {log.action === "DELETE" ? (
                            <button
                              onClick={() => setRestoringLog(log)}
                              title="Restore this item"
                              className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center space-x-1 transition-all shadow-2xs active:scale-95"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          ) : log.action === "RESTORED" ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-200/60">
                              Restored
                            </span>
                          ) : null}

                          {/* 3. Delete Log Entry */}
                          <button
                            onClick={() => setDeletingLog(log)}
                            title="Delete Log Entry"
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-rose-50 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-colors bg-white shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-xs">
                      No activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-gray-500 gap-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span>Showing</span>
              <div className="w-20">
                <SearchableSelect
                  size="sm"
                  searchable={false}
                  showSelectOption={false}
                  options={[
                    { value: "10", label: "10" },
                    { value: "25", label: "25" },
                    { value: "50", label: "50" },
                  ]}
                  value={String(pageSize)}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }}
                />
              </div>
              <span>of {logs.length} entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 text-gray-600"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs transition-all ${
                    currentPage === pageNum
                      ? "bg-[#FE9F43] text-white shadow-xs"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 text-gray-600"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== VIEW SNAPSHOT MODAL ==================== */}
        {viewLog && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-50 text-[#FE9F43] rounded-xl">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Activity Snapshot Details</h3>
                    <p className="text-[11px] text-gray-500">
                      {viewLog.entityType}: {viewLog.entityName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewLog(null)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Action:</span>
                    <span className="font-bold">{viewLog.action}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entity:</span>
                    <span className="font-bold text-gray-900">{viewLog.entityType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Item Name:</span>
                    <span className="font-bold text-[#FE9F43]">{viewLog.entityName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Performed By:</span>
                    <span className="font-semibold text-gray-700">{viewLog.user || "Admin"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Timestamp:</span>
                    <span className="font-mono text-gray-700">{formatDate(viewLog.createdAt)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 flex items-center">
                    <Code className="w-3 h-3 mr-1 text-gray-400" />
                    Full Data Snapshot (JSON):
                  </label>
                  <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56">
                    {JSON.stringify(JSON.parse(viewLog.data || "{}"), null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {viewLog.action === "DELETE" ? (
                  <button
                    onClick={() => {
                      const l = viewLog;
                      setViewLog(null);
                      setRestoringLog(l);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Item</span>
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={() => setViewLog(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== RESTORE CONFIRMATION MODAL ==================== */}
        {restoringLog && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Restore Item?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to restore <strong>&quot;{restoringLog.entityName}&quot;</strong> back into{" "}
                  <strong>{restoringLog.entityType}</strong>?
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestoringLog(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={handleConfirmRestore}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {isRestoring ? "Restoring..." : "Restore"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DELETE LOG ENTRY CONFIRM MODAL ==================== */}
        {deletingLog && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Log Record?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to permanently delete this activity log record for{" "}
                  <strong>&quot;{deletingLog.entityName}&quot;</strong>?
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingLog(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteLog}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Action Feedback / Alert Modal (Add / Edit / Delete)       */}
        {/* ========================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
              {/* Top Icon Badge */}
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

              {/* Title & Message */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feedbackModal.message}</p>
              </div>

              {/* Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                  className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-colors ${
                    feedbackModal.type === "error"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-[#FE9F43] hover:bg-[#E88B32]"
                  }`}
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

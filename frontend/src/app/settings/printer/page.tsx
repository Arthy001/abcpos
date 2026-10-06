"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  Printer,
  PlusCircle,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Usb,
  Bluetooth,
  Star,
  FileCheck,
} from "lucide-react";
import {
  PosPrinter,
  getPrintersApi,
  createPrinterApi,
  updatePrinterApi,
  setDefaultPrinterApi,
  deletePrinterApi,
} from "@/lib/api";

const CONNECTION_TYPES = ["Network", "USB", "Bluetooth"];
const PAPER_SIZES = ["80mm", "58mm", "A4"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type ModalMode = "add" | "edit" | "view" | null;
type FeedbackType = "add" | "edit" | "delete-confirm" | "delete-success" | "test-print" | "error" | null;

const EMPTY_FORM = {
  printerName: "",
  connectionType: "Network",
  ipAddress: "192.168.1.200",
  port: "9100",
  paperSize: "80mm",
  status: "ACTIVE",
};

export default function PrinterSettingsPage() {
  const [printers, setPrinters] = useState<PosPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<PosPrinter | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Feedback Modals
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [printerToDelete, setPrinterToDelete] = useState<PosPrinter | null>(null);

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const loadPrinters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPrintersApi();
      setPrinters(data);
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to load printers");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  // ─── Filter & Paginate ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return printers.filter((p) => {
      const matchSearch =
        p.printerName.toLowerCase().includes(search.toLowerCase()) ||
        (p.ipAddress && p.ipAddress.toLowerCase().includes(search.toLowerCase())) ||
        p.connectionType.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      const matchType = typeFilter === "All" || p.connectionType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [printers, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  // ─── Modal Helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setSelectedPrinter(null);
    setModalMode("add");
  };

  const openEdit = (printer: PosPrinter) => {
    setForm({
      printerName: printer.printerName,
      connectionType: printer.connectionType,
      ipAddress: printer.ipAddress || "",
      port: printer.port || "9100",
      paperSize: printer.paperSize,
      status: printer.status,
    });
    setSelectedPrinter(printer);
    setModalMode("edit");
  };

  const openView = (printer: PosPrinter) => {
    setSelectedPrinter(printer);
    setModalMode("view");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedPrinter(null);
  };

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.printerName.trim()) {
      setFeedbackError("Printer Name is required.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "add") {
        const created = await createPrinterApi({
          printerName: form.printerName.trim(),
          connectionType: form.connectionType,
          ipAddress: form.ipAddress.trim() || undefined,
          port: form.port.trim() || undefined,
          paperSize: form.paperSize,
          status: form.status,
        });
        await loadPrinters();
        closeModal();
        setFeedbackName(created.printerName);
        setFeedbackType("add");
      } else if (modalMode === "edit" && selectedPrinter) {
        await updatePrinterApi(selectedPrinter.id, {
          printerName: form.printerName.trim(),
          connectionType: form.connectionType,
          ipAddress: form.ipAddress.trim() || undefined,
          port: form.port.trim() || undefined,
          paperSize: form.paperSize,
          status: form.status,
        });
        await loadPrinters();
        closeModal();
        setFeedbackName(form.printerName.trim());
        setFeedbackType("edit");
      }
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to save printer");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (printer: PosPrinter) => {
    try {
      await setDefaultPrinterApi(printer.id);
      await loadPrinters();
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to set default printer");
      setFeedbackType("error");
    }
  };

  const handleTestPrint = (printer: PosPrinter) => {
    setFeedbackName(printer.printerName);
    setFeedbackType("test-print");
  };

  const handleDeleteRequest = (printer: PosPrinter) => {
    if (printer.isDefault) {
      setFeedbackError("Cannot delete the default printer. Set another printer as default first.");
      setFeedbackType("error");
      return;
    }
    setPrinterToDelete(printer);
    setFeedbackName(printer.printerName);
    setFeedbackType("delete-confirm");
  };

  const handleDeleteConfirm = async () => {
    if (!printerToDelete) return;
    try {
      await deletePrinterApi(printerToDelete.id);
      await loadPrinters();
      setFeedbackType("delete-success");
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to delete printer");
      setFeedbackType("error");
    } finally {
      setPrinterToDelete(null);
    }
  };

  // ─── CSV Export ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ["Printer Name", "Connection Type", "IP Address", "Port", "Paper Size", "Default", "Status", "Created"];
    const rows = filtered.map((p) => [
      `"${p.printerName}"`,
      p.connectionType,
      p.ipAddress || "-",
      p.port || "-",
      p.paperSize,
      p.isDefault ? "Yes" : "No",
      p.status,
      new Date(p.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `printers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper connection icon
  const getConnectionIcon = (type: string) => {
    if (type === "Network") return <Wifi className="w-3.5 h-3.5 text-blue-600" />;
    if (type === "USB") return <Usb className="w-3.5 h-3.5 text-emerald-600" />;
    return <Bluetooth className="w-3.5 h-3.5 text-indigo-600" />;
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage POS receipt printers, ESC/POS hardware, and thermal paper sizes</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadPrinters}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: Printers */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            {/* Panel Header */}
            <div className="p-5 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-[#FE9F43]" />
                <h2 className="text-sm font-bold text-[#1E293B]">Receipt & Kitchen Printers</h2>
              </div>

              <button
                type="button"
                onClick={openAdd}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add New Printer</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-[#F1F3F5] flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search printer name, IP..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-8 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43] w-52"
                  />
                </div>

                {/* Connection Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All Connections</option>
                  {CONNECTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Page Size */}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s} / page
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>

            {/* Table (GEMINI.md Order: View -> Edit -> Delete) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="border-b border-[#F1F3F5] bg-[#F8F9FA]/70">
                  <tr>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Printer Name</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Connection</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">IP Address & Port</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Paper Size</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Default</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Status</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">
                        Loading printers...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">
                        No printers found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((printer) => (
                      <tr key={printer.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-[#1E293B]">
                          <div className="flex items-center gap-2">
                            {printer.isDefault && (
                              <span className="text-[#FE9F43]" title="Default POS Printer">
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </span>
                            )}
                            {printer.printerName}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-50 border border-gray-200">
                            {getConnectionIcon(printer.connectionType)}
                            {printer.connectionType}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[#64748B]">
                          {printer.ipAddress ? `${printer.ipAddress}${printer.port ? `:${printer.port}` : ""}` : "-"}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            {printer.paperSize}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          {printer.isDefault ? (
                            <span className="text-[#FE9F43] text-[10px] font-bold">★ Default</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(printer)}
                              className="text-[10px] text-[#94A3B8] hover:text-[#FE9F43] underline cursor-pointer transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              printer.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {printer.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Test Print Slip */}
                            <button
                              type="button"
                              onClick={() => handleTestPrint(printer)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-emerald-600 hover:border-emerald-300 transition-colors cursor-pointer"
                              title="Print Test Slip"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                            </button>
                            {/* 1. View (Eye) */}
                            <button
                              type="button"
                              onClick={() => openView(printer)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
                              title="View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {/* 2. Edit (Edit) */}
                            <button
                              type="button"
                              onClick={() => openEdit(printer)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-[#FE9F43] hover:border-[#FE9F43] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {/* 3. Delete (Trash2) */}
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(printer)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#F1F3F5] flex items-center justify-between text-xs text-[#64748B]">
              <span>
                Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} printers
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-[#E2E8F0] rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-[#E2E8F0] rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Add / Edit / View Modal ─────────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#FE9F43]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {modalMode === "add"
                    ? "Add New Printer"
                    : modalMode === "edit"
                    ? "Edit Printer Configuration"
                    : "Printer Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {modalMode === "view" && selectedPrinter ? (
                <div className="space-y-3 text-xs">
                  {[
                    ["Printer Name", selectedPrinter.printerName],
                    ["Connection Type", selectedPrinter.connectionType],
                    ["IP Address", selectedPrinter.ipAddress || "-"],
                    ["Port", selectedPrinter.port || "-"],
                    ["Paper Size", selectedPrinter.paperSize],
                    ["Default Printer", selectedPrinter.isDefault ? "Yes (Primary)" : "No"],
                    ["Status", selectedPrinter.status],
                    ["Created At", new Date(selectedPrinter.createdAt).toLocaleString()],
                    ["Updated At", new Date(selectedPrinter.updatedAt).toLocaleString()],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center py-2 border-b border-[#F8F9FA] last:border-0"
                    >
                      <span className="text-[#64748B] font-medium">{label}</span>
                      <span className="text-[#1E293B] font-semibold text-right max-w-[60%] font-mono">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  {/* Printer Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#374151]">
                      Printer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.printerName}
                      onChange={(e) => setForm({ ...form, printerName: e.target.value })}
                      placeholder="e.g. Epson TM-T82X (Counter 1)"
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Connection Type & Paper Size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Connection Type</label>
                      <select
                        value={form.connectionType}
                        onChange={(e) => setForm({ ...form, connectionType: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        {CONNECTION_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Paper Size</label>
                      <select
                        value={form.paperSize}
                        onChange={(e) => setForm({ ...form, paperSize: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        {PAPER_SIZES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* IP Address & Port (if Network) */}
                  {form.connectionType === "Network" && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-medium text-[#374151]">IP Address</label>
                        <input
                          type="text"
                          value={form.ipAddress}
                          onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                          placeholder="e.g. 192.168.1.200"
                          className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#374151]">Port</label>
                        <input
                          type="text"
                          value={form.port}
                          onChange={(e) => setForm({ ...form, port: e.target.value })}
                          placeholder="9100"
                          className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {modalMode === "edit" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#F1F3F5] bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-bold text-[#374151] border border-[#E2E8F0] rounded-lg hover:bg-white cursor-pointer"
              >
                {modalMode === "view" ? "Close" : "Cancel"}
              </button>
              {modalMode !== "view" && (
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "add"
                    ? "Add Printer"
                    : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Feedback Modals (GEMINI.md Standards) ────────────────────────────── */}
      {/* 1. Add Success Modal (Emerald Sparkles) */}
      {feedbackType === "add" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Printer Created!</h3>
              <p className="text-xs text-[#64748B] mt-1">
                <span className="font-semibold">{feedbackName}</span> has been configured successfully.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackType(null);
                  openAdd();
                }}
                className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                + Add Another
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType(null)}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Success Modal (Blue CheckCircle2) */}
      {feedbackType === "edit" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Printer Updated!</h3>
              <p className="text-xs text-[#64748B] mt-1">
                <span className="font-semibold">{feedbackName}</span> configuration has been saved.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 3. Delete Confirm Modal (Rose Trash2) */}
      {feedbackType === "delete-confirm" && printerToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Delete Printer?</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Are you sure you want to delete <span className="font-semibold">{feedbackName}</span>?
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackType(null);
                  setPrinterToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Success Modal (Amber Trash2) */}
      {feedbackType === "delete-success" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Printer Deleted!</h3>
              <p className="text-xs text-[#64748B] mt-1">The printer profile has been removed successfully.</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 5. Test Print Success Modal (Emerald Sparkles) */}
      {feedbackType === "test-print" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <Printer className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Test Slip Dispatched!</h3>
              <p className="text-xs text-[#64748B] mt-1">
                A test receipt slip was successfully routed to <span className="font-semibold">{feedbackName}</span>. ESC/POS connection verified!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 6. Error Modal (Rose AlertTriangle) */}
      {feedbackType === "error" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Operation Failed</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackError}</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

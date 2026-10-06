"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Star,
} from "lucide-react";
import {
  Currency,
  getCurrenciesApi,
  createCurrencyApi,
  updateCurrencyApi,
  setDefaultCurrencyApi,
  deleteCurrencyApi,
} from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalMode = "add" | "edit" | "view" | null;
type FeedbackType = "add" | "edit" | "delete-confirm" | "delete-success" | "error" | null;

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const EMPTY_FORM = {
  name: "",
  code: "",
  symbol: "",
  exchangeRate: "1.00",
  status: "ACTIVE",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CurrenciesSettingsPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedItem, setSelectedItem] = useState<Currency | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Feedback modal
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [itemToDelete, setItemToDelete] = useState<Currency | null>(null);

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurrenciesApi();
      setCurrencies(data);
    } catch (e: any) {
      setFeedbackError(e.message || "Failed to load currencies");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Filter & Paginate ─────────────────────────────────────────────────────
  const filtered = currencies.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ─── Modal Helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setSelectedItem(null);
    setModalMode("add");
  };
  const openEdit = (item: Currency) => {
    setForm({
      name: item.name,
      code: item.code,
      symbol: item.symbol,
      exchangeRate: item.exchangeRate.toString(),
      status: item.status,
    });
    setSelectedItem(item);
    setModalMode("edit");
  };
  const openView = (item: Currency) => { setSelectedItem(item); setModalMode("view"); };
  const closeModal = () => { setModalMode(null); setSelectedItem(null); };

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim() || !form.symbol.trim()) {
      setFeedbackError("Currency Name, Code, and Symbol are required.");
      setFeedbackType("error");
      return;
    }
    setSaving(true);
    try {
      if (modalMode === "add") {
        const created = await createCurrencyApi({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          symbol: form.symbol.trim(),
          exchangeRate: parseFloat(form.exchangeRate) || 1.0,
          status: form.status,
        });
        await fetchData();
        closeModal();
        setFeedbackName(created.name);
        setFeedbackType("add");
      } else if (modalMode === "edit" && selectedItem) {
        await updateCurrencyApi(selectedItem.id, {
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          symbol: form.symbol.trim(),
          exchangeRate: parseFloat(form.exchangeRate) || 1.0,
          status: form.status,
        });
        await fetchData();
        closeModal();
        setFeedbackName(form.name.trim());
        setFeedbackType("edit");
      }
    } catch (e: any) {
      setFeedbackError(e.message || "Operation failed");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (item: Currency) => {
    try {
      await setDefaultCurrencyApi(item.id);
      await fetchData();
    } catch (e: any) {
      setFeedbackError(e.message || "Failed to set default currency");
      setFeedbackType("error");
    }
  };

  const handleDeleteRequest = (item: Currency) => {
    if (item.isDefault) {
      setFeedbackError("Cannot delete the default currency. Set another currency as default first.");
      setFeedbackType("error");
      return;
    }
    setItemToDelete(item);
    setFeedbackName(item.name);
    setFeedbackType("delete-confirm");
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteCurrencyApi(itemToDelete.id);
      await fetchData();
      setFeedbackType("delete-success");
    } catch (e: any) {
      setFeedbackError(e.message || "Failed to delete currency");
      setFeedbackType("error");
    } finally {
      setItemToDelete(null);
    }
  };

  // ─── Export ────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ["Name", "Code", "Symbol", "Exchange Rate", "Default", "Status", "Created"];
    const rows = filtered.map((c) => [
      c.name, c.code, c.symbol, c.exchangeRate,
      c.isDefault ? "Yes" : "No", c.status,
      new Date(c.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "currencies.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your settings on portal</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchData}
              title="Refresh"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <SettingsSidebar />

          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            {/* Panel Header */}
            <div className="p-5 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-[#1E293B]">Currencies</h2>
              <button
                onClick={openAdd}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add New Currency</span>
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
                    placeholder="Search currencies..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-8 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43] w-52"
                  />
                </div>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {/* Page Size */}
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} / page</option>)}
                </select>
              </div>
              {/* Export */}
              <div className="flex gap-2">
                <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] hover:bg-gray-50 cursor-pointer transition-colors">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] hover:bg-gray-50 cursor-pointer transition-colors">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="border-b border-[#F1F3F5] bg-[#F8F9FA]/60">
                  <tr>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Currency Name</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Code</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Symbol</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Exchange Rate</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Status</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Default</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">Loading...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">No currencies found</td></tr>
                  ) : (
                    paginated.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-[#1E293B]">
                          <div className="flex items-center gap-2">
                            {item.isDefault && <span className="text-[#FE9F43]"><Star className="w-3.5 h-3.5 fill-current" /></span>}
                            {item.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-[#64748B] font-mono font-bold">{item.code}</td>
                        <td className="py-3.5 px-5 text-[#1E293B] font-bold text-sm">{item.symbol}</td>
                        <td className="py-3.5 px-5 text-[#64748B]">
                          {item.isDefault ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">Default</span>
                          ) : (
                            item.exchangeRate.toFixed(4)
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          {item.isDefault ? (
                            <span className="text-[#FE9F43] text-[10px] font-bold">★ Default</span>
                          ) : (
                            <button
                              onClick={() => handleSetDefault(item)}
                              className="text-[10px] text-[#94A3B8] hover:text-[#FE9F43] underline cursor-pointer transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button onClick={() => openView(item)} className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer" title="View">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-[#FE9F43] hover:border-[#FE9F43] transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteRequest(item)} className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer" title="Delete">
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
              <span>Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-[#E2E8F0] rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2">Page {page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-[#E2E8F0] rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer transition-colors">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <h3 className="text-sm font-bold text-[#1E293B]">
                {modalMode === "add" ? "Add New Currency" : modalMode === "edit" ? "Edit Currency" : "Currency Details"}
              </h3>
              <button onClick={closeModal} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {modalMode === "view" && selectedItem ? (
                <div className="space-y-3 text-xs">
                  {[
                    ["Currency Name", selectedItem.name],
                    ["Code", selectedItem.code],
                    ["Symbol", selectedItem.symbol],
                    ["Exchange Rate", selectedItem.isDefault ? "Default (Base)" : selectedItem.exchangeRate.toFixed(4)],
                    ["Status", selectedItem.status],
                    ["Default", selectedItem.isDefault ? "Yes" : "No"],
                    ["Created", new Date(selectedItem.createdAt).toLocaleString()],
                    ["Updated", new Date(selectedItem.updatedAt).toLocaleString()],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-[#F8F9FA] last:border-0">
                      <span className="text-[#64748B] font-medium">{label}</span>
                      <span className="text-[#1E293B] font-semibold text-right max-w-[60%]">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#374151]">Currency Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Thai Baht"
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                  {/* Code & Symbol */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Code <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={form.code}
                        onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g. THB"
                        maxLength={5}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Symbol <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={form.symbol}
                        onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
                        placeholder="e.g. ฿"
                        maxLength={5}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>
                  </div>
                  {/* Exchange Rate & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Exchange Rate</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={form.exchangeRate}
                        onChange={(e) => setForm((f) => ({ ...f, exchangeRate: e.target.value }))}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="">Select...</option>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#F1F3F5]">
              <button onClick={closeModal} className="px-4 py-2 text-xs font-bold text-[#374151] border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                {modalMode === "view" ? "Close" : "Cancel"}
              </button>
              {modalMode !== "view" && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? "Saving..." : modalMode === "add" ? "Add Currency" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Feedback Modals ──────────────────────────────────────────────────── */}
      {/* Add Success */}
      {feedbackType === "add" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <div><h3 className="text-sm font-bold text-[#1E293B]">Currency Created!</h3>
              <p className="text-xs text-[#64748B] mt-1"><span className="font-semibold">{feedbackName}</span> has been added successfully.</p></div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setFeedbackType(null); openAdd(); }} className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">+ Add Another</button>
              <button onClick={() => setFeedbackType(null)} className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Success */}
      {feedbackType === "edit" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>
            <div><h3 className="text-sm font-bold text-[#1E293B]">Currency Updated!</h3>
              <p className="text-xs text-[#64748B] mt-1"><span className="font-semibold">{feedbackName}</span> has been saved successfully.</p></div>
            <button onClick={() => setFeedbackType(null)} className="px-6 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">OK</button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {feedbackType === "delete-confirm" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <div><h3 className="text-sm font-bold text-[#1E293B]">Delete Currency?</h3>
              <p className="text-xs text-[#64748B] mt-1">Are you sure you want to delete <span className="font-semibold">{feedbackName}</span>? This cannot be undone.</p></div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setFeedbackType(null)} className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success */}
      {feedbackType === "delete-success" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-amber-600" />
            </div>
            <div><h3 className="text-sm font-bold text-[#1E293B]">Currency Deleted!</h3>
              <p className="text-xs text-[#64748B] mt-1"><span className="font-semibold">{feedbackName}</span> has been removed successfully.</p></div>
            <button onClick={() => setFeedbackType(null)} className="px-6 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer transition-colors">OK</button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {feedbackType === "error" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div><h3 className="text-sm font-bold text-[#1E293B]">Operation Failed</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackError}</p></div>
            <button onClick={() => setFeedbackType(null)} className="px-6 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-colors">OK</button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

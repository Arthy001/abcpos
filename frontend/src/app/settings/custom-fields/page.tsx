"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  Sliders,
  PlusCircle,
  Search,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Package,
  Users,
  Truck,
  Receipt,
} from "lucide-react";
import {
  CustomField,
  getCustomFieldsApi,
  createCustomFieldApi,
  updateCustomFieldApi,
  deleteCustomFieldApi,
} from "@/lib/api";

const MODULE_OPTIONS = ["Product", "Customer", "Supplier", "Biller"];
const FIELD_TYPES = ["Text", "Number", "Select", "Date", "Boolean"];
const REQUIRED_STATUSES = ["Optional", "Required", "Disable"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type ModalMode = "add" | "edit" | "view" | null;
type FeedbackType = "add" | "edit" | "delete-confirm" | "delete-success" | "error" | null;

const EMPTY_FORM = {
  module: "Product",
  label: "",
  fieldType: "Text",
  defaultValue: "",
  requiredStatus: "Optional",
  status: "ACTIVE",
};

export default function CustomFieldsSettingsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Feedback Modals
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [fieldToDelete, setFieldToDelete] = useState<CustomField | null>(null);

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const loadFields = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomFieldsApi();
      setFields(data);
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to load custom fields");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  // ─── Filter & Paginate ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return fields.filter((f) => {
      const matchSearch =
        f.label.toLowerCase().includes(search.toLowerCase()) ||
        f.module.toLowerCase().includes(search.toLowerCase()) ||
        f.fieldType.toLowerCase().includes(search.toLowerCase()) ||
        (f.defaultValue && f.defaultValue.toLowerCase().includes(search.toLowerCase()));
      const matchModule = moduleFilter === "All" || f.module === moduleFilter;
      const matchStatus = statusFilter === "All" || f.status === statusFilter;
      return matchSearch && matchModule && matchStatus;
    });
  }, [fields, search, moduleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  // ─── Modal Helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setSelectedField(null);
    setModalMode("add");
  };

  const openEdit = (field: CustomField) => {
    setForm({
      module: field.module,
      label: field.label,
      fieldType: field.fieldType,
      defaultValue: field.defaultValue || "",
      requiredStatus: field.requiredStatus,
      status: field.status,
    });
    setSelectedField(field);
    setModalMode("edit");
  };

  const openView = (field: CustomField) => {
    setSelectedField(field);
    setModalMode("view");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedField(null);
  };

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.label.trim()) {
      setFeedbackError("Field Label is required.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "add") {
        const created = await createCustomFieldApi({
          module: form.module,
          label: form.label.trim(),
          fieldType: form.fieldType,
          defaultValue: form.defaultValue?.trim() || undefined,
          requiredStatus: form.requiredStatus,
          status: form.status,
        });
        await loadFields();
        closeModal();
        setFeedbackName(`${created.label} (${created.module})`);
        setFeedbackType("add");
      } else if (modalMode === "edit" && selectedField) {
        await updateCustomFieldApi(selectedField.id, {
          module: form.module,
          label: form.label.trim(),
          fieldType: form.fieldType,
          defaultValue: form.defaultValue?.trim() || undefined,
          requiredStatus: form.requiredStatus,
          status: form.status,
        });
        await loadFields();
        closeModal();
        setFeedbackName(form.label.trim());
        setFeedbackType("edit");
      }
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to save custom field");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (field: CustomField) => {
    setFieldToDelete(field);
    setFeedbackName(`${field.label} (${field.module})`);
    setFeedbackType("delete-confirm");
  };

  const handleDeleteConfirm = async () => {
    if (!fieldToDelete) return;
    try {
      await deleteCustomFieldApi(fieldToDelete.id);
      await loadFields();
      setFeedbackType("delete-success");
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to delete custom field");
      setFeedbackType("error");
    } finally {
      setFieldToDelete(null);
    }
  };

  // ─── CSV Export ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ["Module", "Field Label", "Type", "Default Value", "Requirement", "Status", "Created"];
    const rows = filtered.map((f) => [
      `"${f.module}"`,
      `"${f.label}"`,
      f.fieldType,
      `"${f.defaultValue || "-"}"`,
      f.requiredStatus,
      f.status,
      new Date(f.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `custom_fields_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper module icon & badge
  const getModuleBadge = (mod: string) => {
    if (mod === "Product") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200">
          <Package className="w-3 h-3" />
          Product
        </span>
      );
    }
    if (mod === "Customer") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
          <Users className="w-3 h-3" />
          Customer
        </span>
      );
    }
    if (mod === "Supplier") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200">
          <Truck className="w-3 h-3" />
          Supplier
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
        <Receipt className="w-3 h-3" />
        Biller
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage custom attributes and dynamic entity fields across the system</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadFields}
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

          {/* Right Content Panel: Custom Fields */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            {/* Panel Header */}
            <div className="p-5 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#FE9F43]" />
                <h2 className="text-sm font-bold text-[#1E293B]">Custom Field Attributes</h2>
              </div>

              <button
                type="button"
                onClick={openAdd}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Custom Field</span>
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
                    placeholder="Search field label, module..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-8 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43] w-52"
                  />
                </div>

                {/* Module Filter */}
                <select
                  value={moduleFilter}
                  onChange={(e) => {
                    setModuleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All Modules</option>
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
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
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Module</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Field Label</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Data Type</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Default Value</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Requirement</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Status</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">
                        Loading custom fields...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">
                        No custom fields configured
                      </td>
                    </tr>
                  ) : (
                    paginated.map((field) => (
                      <tr key={field.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-5">{getModuleBadge(field.module)}</td>
                        <td className="py-3.5 px-5 font-semibold text-[#1E293B]">
                          {field.label}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-[11px] bg-gray-100 text-[#475569] px-2 py-0.5 rounded font-medium">
                            {field.fieldType}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#64748B]">
                          {field.defaultValue || "-"}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              field.requiredStatus === "Required"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : field.requiredStatus === "Optional"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {field.requiredStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              field.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {field.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View (Eye) */}
                            <button
                              type="button"
                              onClick={() => openView(field)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
                              title="View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {/* 2. Edit (Edit) */}
                            <button
                              type="button"
                              onClick={() => openEdit(field)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-[#FE9F43] hover:border-[#FE9F43] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {/* 3. Delete (Trash2) */}
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(field)}
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
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} fields
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
                <Sliders className="w-4 h-4 text-[#FE9F43]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {modalMode === "add"
                    ? "Add New Custom Field"
                    : modalMode === "edit"
                    ? "Edit Custom Field"
                    : "Custom Field Details"}
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
              {modalMode === "view" && selectedField ? (
                <div className="space-y-3 text-xs">
                  {[
                    ["Module Entity", selectedField.module],
                    ["Field Label", selectedField.label],
                    ["Field Type", selectedField.fieldType],
                    ["Default Value", selectedField.defaultValue || "-"],
                    ["Requirement Status", selectedField.requiredStatus],
                    ["Status", selectedField.status],
                    ["Created At", new Date(selectedField.createdAt).toLocaleString()],
                    ["Updated At", new Date(selectedField.updatedAt).toLocaleString()],
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
                  {/* Module & Field Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">
                        Module <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={form.module}
                        onChange={(e) => setForm({ ...form, module: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        {MODULE_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Data Type</label>
                      <select
                        value={form.fieldType}
                        onChange={(e) => setForm({ ...form, fieldType: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#374151]">
                      Field Label <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="e.g. VIP Member Tier, Weight"
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Default Value & Requirement */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Default Value</label>
                      <input
                        type="text"
                        value={form.defaultValue}
                        onChange={(e) => setForm({ ...form, defaultValue: e.target.value })}
                        placeholder="e.g. Regular"
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Requirement</label>
                      <select
                        value={form.requiredStatus}
                        onChange={(e) => setForm({ ...form, requiredStatus: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        {REQUIRED_STATUSES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                    ? "Create Field"
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
              <h3 className="text-sm font-bold text-[#1E293B]">Custom Field Created!</h3>
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
              <h3 className="text-sm font-bold text-[#1E293B]">Custom Field Updated!</h3>
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
      {feedbackType === "delete-confirm" && fieldToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Delete Custom Field?</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Are you sure you want to delete <span className="font-semibold">{feedbackName}</span>?
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackType(null);
                  setFieldToDelete(null);
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
              <h3 className="text-sm font-bold text-[#1E293B]">Custom Field Deleted!</h3>
              <p className="text-xs text-[#64748B] mt-1">The custom field attribute has been removed successfully.</p>
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

      {/* 5. Error Modal (Rose AlertTriangle) */}
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

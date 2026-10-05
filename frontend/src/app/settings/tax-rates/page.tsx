"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  TaxRate,
  fetchTaxRatesApi,
  createTaxRateApi,
  updateTaxRateApi,
  deleteTaxRateApi,
} from "@/lib/api";
import {
  RotateCcw,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Percent,
} from "lucide-react";

export default function TaxRatesSettingsPage() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form Modal (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<TaxRate | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formRate, setFormRate] = useState<string>("7");
  const [formStatus, setFormStatus] = useState<string>("ACTIVE");
  const [formIsDefault, setFormIsDefault] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // View Details Modal
  const [viewingItem, setViewingItem] = useState<TaxRate | null>(null);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<TaxRate | null>(null);

  // Standard Feedback Modal
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

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchTaxRatesApi();
      setTaxRates(data);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Load Failed",
        message: err.message || "Failed to load tax rates",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Searched Data
  const filteredData = useMemo(() => {
    return taxRates.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        String(item.rate).includes(search);
      const matchStatus =
        statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [taxRates, search, statusFilter]);

  // Pagination Calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormRate("7");
    setFormStatus("ACTIVE");
    setFormIsDefault(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: TaxRate) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormRate(String(item.rate));
    setFormStatus(item.status);
    setFormIsDefault(item.isDefault);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter a valid tax name.",
      });
      return;
    }

    const numericRate = parseFloat(formRate);
    if (isNaN(numericRate) || numericRate < 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Invalid Rate",
        message: "Please enter a valid non-negative tax percentage rate.",
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        await updateTaxRateApi(editingItem.id, {
          name: formName.trim(),
          rate: numericRate,
          status: formStatus,
          isDefault: formIsDefault,
        });
        setIsFormOpen(false);
        await loadData();
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Tax Rate Updated!",
          message: "Tax rate details have been successfully updated.",
          itemName: formName.trim(),
        });
      } else {
        await createTaxRateApi({
          name: formName.trim(),
          rate: numericRate,
          status: formStatus,
          isDefault: formIsDefault,
        });
        setIsFormOpen(false);
        await loadData();
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Tax Rate Created!",
          message: "New tax rate has been successfully added to system.",
          itemName: formName.trim(),
        });
      }
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save tax rate",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTaxRateApi(deleteTarget.id);
      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      await loadData();
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Tax Rate Deleted!",
        message: `Successfully removed tax rate from system.`,
        itemName: deletedName,
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "Could not delete tax rate",
      });
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (taxRates.length === 0) return;
    const headers = ["ID", "Tax Name", "Rate (%)", "Default", "Status", "Created At"];
    const rows = filteredData.map((t) => [
      t.id,
      `"${t.name}"`,
      `${t.rate}%`,
      t.isDefault ? "YES" : "NO",
      t.status,
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tax_rates_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your system settings on portal</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadData}
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

          {/* Right Content Panel: Tax Rates */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            {/* Header & Action Button */}
            <div className="p-6 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Tax Rates</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Configure system taxes applied on sales and purchase orders</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  title="Export CSV"
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print / PDF"
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add New Tax Rate</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-[#F1F3F5] bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tax name or rate..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#FE9F43]"
                />
              </div>

              <div className="w-full sm:w-48">
                <SearchableSelect
                  placeholder="Status: All"
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "ACTIVE", label: "Status: Active" },
                    { value: "INACTIVE", label: "Status: Inactive" },
                  ]}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#F8F9FA]/60 font-semibold">
                  <tr>
                    <th className="py-3.5 px-5">Tax Name</th>
                    <th className="py-3.5 px-5">Rate (%)</th>
                    <th className="py-3.5 px-5">Default</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Created On</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                        Loading tax rates...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <Percent className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-500">No tax rates found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-4 px-5 font-semibold text-[#1E293B]">
                          <div className="flex items-center space-x-2">
                            <span>{item.name}</span>
                            {item.isDefault && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Default
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[#1E293B] font-bold">
                          {item.rate}%
                        </td>
                        <td className="py-4 px-5">
                          {item.isDefault ? (
                            <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Yes</span>
                            </span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[#64748B]">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="py-4 px-5 text-right">
                          {/* Standard Action Order: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              title="View Tax Rate"
                              onClick={() => setViewingItem(item)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Edit Tax Rate"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-[#FE9F43] hover:border-[#FE9F43] transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Delete Tax Rate"
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
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

            {/* Pagination & Row Counter */}
            <div className="p-4 border-t border-[#F1F3F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <div className="flex items-center space-x-2">
                <span>Showing</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#1E293B] focus:outline-none focus:border-[#FE9F43]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>of {filteredData.length} records</span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 rounded border border-[#E2E8F0] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1 font-semibold text-[#1E293B]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 rounded border border-[#E2E8F0] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== ADD / EDIT MODAL ==================== */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#FE9F43] flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E293B]">
                    {editingItem ? "Edit Tax Rate" : "Add New Tax Rate"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    Tax Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VAT 7%, GST 5%"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    Tax Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      placeholder="e.g. 7"
                      value={formRate}
                      onChange={(e) => setFormRate(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#FE9F43]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    Status
                  </label>
                  <SearchableSelect
                    placeholder="Select status..."
                    value={formStatus}
                    onChange={(val) => setFormStatus(val)}
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "INACTIVE", label: "Inactive" },
                    ]}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FE9F43] focus:ring-[#FE9F43] border-gray-300"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#1E293B]">Set as Default Tax Rate</span>
                      <p className="text-[11px] text-[#64748B]">
                        Automatically applied when creating new sales or POS receipts.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saving..." : editingItem ? "Update Tax Rate" : "Create Tax Rate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== VIEW DETAILS MODAL ==================== */}
        {viewingItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E293B]">Tax Rate Details</h3>
                </div>
                <button
                  onClick={() => setViewingItem(null)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tax Name</span>
                  <span className="font-bold text-gray-900 text-sm">{viewingItem.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Percentage Rate</span>
                  <span className="font-bold text-amber-600 text-sm">{viewingItem.rate}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Default Rate</span>
                  <span>{viewingItem.isDefault ? "Yes (Primary)" : "No"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      viewingItem.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {viewingItem.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Created Date</span>
                  <span className="text-gray-700">
                    {viewingItem.createdAt
                      ? new Date(viewingItem.createdAt).toLocaleString("en-GB")
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-gray-100 text-center p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Delete Tax Rate?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-800 font-semibold">{deleteTarget.name}</strong>?
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STANDARD FEEDBACK MODALS ==================== */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-gray-100 text-center p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Add Success */}
              {feedbackModal.type === "add_success" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {feedbackModal.itemName && (
                        <span className="font-semibold text-gray-800">
                          &quot;{feedbackModal.itemName}&quot;{" "}
                        </span>
                      )}
                      {feedbackModal.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 pt-2">
                    <button
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        handleOpenAdd();
                      }}
                      className="flex-1 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      + Add Another
                    </button>
                    <button
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}

              {/* Edit Success */}
              {feedbackModal.type === "edit_success" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {feedbackModal.itemName && (
                        <span className="font-semibold text-gray-800">
                          &quot;{feedbackModal.itemName}&quot;{" "}
                        </span>
                      )}
                      {feedbackModal.message}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}

              {/* Delete Success */}
              {feedbackModal.type === "delete_success" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {feedbackModal.itemName && (
                        <span className="font-semibold text-gray-800">
                          &quot;{feedbackModal.itemName}&quot;{" "}
                        </span>
                      )}
                      {feedbackModal.message}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}

              {/* Error */}
              {feedbackModal.type === "error" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{feedbackModal.message}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

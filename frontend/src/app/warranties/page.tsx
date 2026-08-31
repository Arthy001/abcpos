"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Warranty } from "@/types";
import {
  fetchWarranties,
  createWarrantyApi,
  updateWarrantyApi,
  deleteWarrantyApi,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Edit,
  Trash2,
  Eye,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formDuration, setFormDuration] = useState<string>("1 Year");
  const [formStatus, setFormStatus] = useState<string>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal
  const [viewWarranty, setViewWarranty] = useState<Warranty | null>(null);

  // Delete Confirmation Modal
  const [deletingWarranty, setDeletingWarranty] = useState<Warranty | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchWarranties({ status: statusFilter, search });
      setWarranties(data || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Warranties",
        message: err.message || "An error occurred while fetching warranties.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setEditingWarranty(null);
    setFormName("");
    setFormDescription("");
    setFormDuration("1 Year");
    setFormStatus("ACTIVE");
    setShowModal(true);
  };

  const handleOpenEditModal = (w: Warranty) => {
    setEditingWarranty(w);
    setFormName(w.name);
    setFormDescription(w.description || "");
    setFormDuration(w.duration);
    setFormStatus(w.status || "ACTIVE");
    setShowModal(true);
  };

  const handleSaveWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDuration.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter both Warranty Name and Duration before saving.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingWarranty) {
        await updateWarrantyApi(editingWarranty.id, {
          name: formName,
          description: formDescription || undefined,
          duration: formDuration,
          status: formStatus as "ACTIVE" | "INACTIVE",
        });
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Warranty Updated!",
          message: `The changes for warranty "${formName}" have been saved successfully.`,
          itemName: formName,
        });
      } else {
        await createWarrantyApi({
          name: formName,
          description: formDescription || undefined,
          duration: formDuration,
          status: formStatus,
        });
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Warranty Created!",
          message: `Warranty "${formName}" (${formDuration}) has been successfully added to your inventory system.`,
          itemName: formName,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save warranty. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingWarranty) return;
    const wName = deletingWarranty.name;
    try {
      setIsDeleting(true);
      await deleteWarrantyApi(deletingWarranty.id);
      setDeletingWarranty(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Warranty Deleted",
        message: `Warranty policy "${wName}" has been removed from the system.`,
        itemName: wName,
      });
      loadData();
    } catch (err: any) {
      setDeletingWarranty(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "Failed to delete warranty.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedWarranties.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedWarranties.map((w) => w.id));
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
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Warranty Name", "Duration", "Description", "Status", "Created On"];
    const rows = warranties.map((w) => [
      `"${w.name.replace(/"/g, '""')}"`,
      `"${w.duration}"`,
      `"${(w.description || "").replace(/"/g, '""')}"`,
      `"${w.status || "ACTIVE"}"`,
      `"${formatDate(w.createdAt)}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warranties_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF / Print
  const handleExportPDF = () => {
    window.print();
  };

  // Pagination calculations
  const totalPages = Math.ceil(warranties.length / pageSize) || 1;
  const paginatedWarranties = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return warranties.slice(start, start + pageSize);
  }, [warranties, currentPage, pageSize]);

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">Warranties</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage warranty plans and coverage policies</p>
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

            {/* + Add Warranty Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Warranty</span>
            </button>
          </div>
        </div>

        {/* Warranty Table Card Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search warranty name or description..."
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
              <div className="w-36">
                <SearchableSelect
                  size="sm"
                  searchable={false}
                  showAllOption
                  allOptionLabel="Status: All"
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Clean Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 text-gray-900 bg-gray-50/70">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedWarranties.length > 0 && selectedIds.length === paginatedWarranties.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-gray-300"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-gray-900">Warranty Name</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Duration</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Description</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Created On</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedWarranties.map((w) => {
                  const isSelected = selectedIds.includes(w.id);

                  return (
                    <tr
                      key={w.id}
                      className={`hover:bg-gray-50/60 transition-colors ${isSelected ? "bg-orange-50/40" : ""}`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(w.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-gray-300"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{w.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <Clock className="w-3 h-3 mr-1 text-amber-500" />
                          {w.duration}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 max-w-[240px] truncate">{w.description || "-"}</td>
                      <td className="py-3.5 px-4 text-gray-500">{formatDate(w.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        {w.status === "ACTIVE" || !w.status ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* 1. View */}
                          <button
                            onClick={() => setViewWarranty(w)}
                            title="View Warranty"
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors bg-white shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* 2. Edit */}
                          <button
                            onClick={() => handleOpenEditModal(w)}
                            title="Edit Warranty"
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-orange-50 text-gray-500 hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white shadow-2xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {/* 3. Delete */}
                          <button
                            onClick={() => setDeletingWarranty(w)}
                            title="Delete Warranty"
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-rose-50 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors bg-white shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {warranties.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-xs">
                      No warranties found.
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
              <span>of {warranties.length} entries</span>
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

        {/* View Warranty Modal */}
        {viewWarranty && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-50 text-[#FE9F43] rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Warranty Details</h3>
                    <p className="text-[11px] text-gray-500">ID: {viewWarranty.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewWarranty(null)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Warranty Name:</span>
                    <span className="font-bold text-gray-900">{viewWarranty.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Duration:</span>
                    <span className="font-bold text-amber-600">{viewWarranty.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Status:</span>
                    <span className="font-bold text-emerald-600">{viewWarranty.status || "ACTIVE"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Created Date:</span>
                    <span className="text-gray-700">{formatDate(viewWarranty.createdAt)}</span>
                  </div>
                </div>

                {viewWarranty.description && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 font-medium mb-1">Description:</p>
                    <p className="text-gray-800">{viewWarranty.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewWarranty(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Warranty Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingWarranty ? "Edit Warranty" : "Add New Warranty"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveWarranty} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">
                    Warranty Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Replacement Warranty, 1 Year On-site"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <SearchableSelect
                    label="Duration"
                    required
                    searchable={false}
                    showSelectOption={false}
                    options={[
                      { value: "1 Month", label: "1 Month" },
                      { value: "3 Months", label: "3 Months" },
                      { value: "6 Months", label: "6 Months" },
                      { value: "1 Year", label: "1 Year" },
                      { value: "2 Years", label: "2 Years" },
                      { value: "3 Years", label: "3 Years" },
                      { value: "5 Years", label: "5 Years" },
                      { value: "Lifetime", label: "Lifetime" },
                    ]}
                    value={formDuration}
                    onChange={setFormDuration}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Coverage details and policy information..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <SearchableSelect
                    label="Status"
                    searchable={false}
                    showSelectOption={false}
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "INACTIVE", label: "Inactive" },
                    ]}
                    value={formStatus}
                    onChange={setFormStatus}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
                  >
                    {isSubmitting ? "Saving..." : editingWarranty ? "Update Warranty" : "Create Warranty"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingWarranty && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Warranty?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete <strong>&quot;{deletingWarranty.name}&quot;</strong>? This action will remove this warranty policy.
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingWarranty(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
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
              <div className="flex items-center space-x-2 pt-2">
                {feedbackModal.type === "add_success" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        handleOpenAddModal();
                      }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      + Add Another
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="flex-1 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      Done
                    </button>
                  </>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

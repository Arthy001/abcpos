"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubCategory, Category } from "@/types";
import {
  fetchSubCategories,
  fetchCategories,
  createSubCategoryApi,
  updateSubCategoryApi,
  deleteSubCategoryApi,
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
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FolderTree,
} from "lucide-react";

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formSlug, setFormSlug] = useState<string>("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");
  const [formCode, setFormCode] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal
  const [viewSubCategory, setViewSubCategory] = useState<SubCategory | null>(null);

  // Delete Confirmation Modal
  const [deletingSubCategory, setDeletingSubCategory] = useState<SubCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [subs, cats] = await Promise.all([
        fetchSubCategories({ categoryId: categoryFilter, status: statusFilter, search }),
        fetchCategories(),
      ]);
      setSubCategories(subs || []);
      setCategories(cats || []);
    } catch (err: any) {
      showToast(err.message || "Failed to load sub-categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, statusFilter, search]);

  const handleOpenAddModal = () => {
    setEditingSubCategory(null);
    setFormName("");
    setFormSlug("");
    setFormCategoryId(categories[0]?.id || "");
    setFormCode(`SC${String(subCategories.length + 1).padStart(3, "0")}`);
    setFormDescription("");
    setFormStatus("ACTIVE");
    setShowModal(true);
  };

  const handleOpenEditModal = (sub: SubCategory) => {
    setEditingSubCategory(sub);
    setFormName(sub.name);
    setFormSlug(sub.slug);
    setFormCategoryId(sub.categoryId);
    setFormCode(sub.code || "");
    setFormDescription(sub.description || "");
    setFormStatus(sub.status || "ACTIVE");
    setShowModal(true);
  };

  const handleFormNameChange = (val: string) => {
    setFormName(val);
    if (!editingSubCategory) {
      setFormSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  };

  const handleSaveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Please enter Sub Category Name", "error");
      return;
    }
    if (!formCategoryId) {
      showToast("Please select a Parent Category", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingSubCategory) {
        await updateSubCategoryApi(editingSubCategory.id, {
          name: formName,
          slug: formSlug,
          categoryId: formCategoryId,
          code: formCode,
          description: formDescription,
          status: formStatus as "ACTIVE" | "INACTIVE",
        });
        showToast(`Sub Category "${formName}" updated successfully!`);
      } else {
        await createSubCategoryApi({
          name: formName,
          slug: formSlug,
          categoryId: formCategoryId,
          code: formCode,
          description: formDescription,
          status: formStatus,
        });
        showToast(`Sub Category "${formName}" created successfully!`);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to save sub category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubCategory) return;
    try {
      setIsDeleting(true);
      await deleteSubCategoryApi(deletingSubCategory.id);
      showToast(`Sub Category "${deletingSubCategory.name}" removed successfully!`);
      setDeletingSubCategory(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete sub category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedSubCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedSubCategories.map((s) => s.id));
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
    const headers = ["Sub Category", "Category", "Code", "Description", "Status", "Created On"];
    const rows = subCategories.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.category?.name || "-"}"`,
      `"${s.code || "-"}"`,
      `"${(s.description || "").replace(/"/g, '""')}"`,
      `"${s.status || "ACTIVE"}"`,
      `"${formatDate(s.createdAt)}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sub_categories_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF / Print
  const handleExportPDF = () => {
    window.print();
  };

  // Pagination calculations
  const totalPages = Math.ceil(subCategories.length / pageSize) || 1;
  const paginatedSubCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return subCategories.slice(start, start + pageSize);
  }, [subCategories, currentPage, pageSize]);

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2 ${
              toastMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">Sub Category</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage and organize your sub categories</p>
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

            {/* + Add Sub Category Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Sub Category</span>
            </button>
          </div>
        </div>

        {/* Sub Category Table Card Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search sub category or code..."
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
              <div className="w-44">
                <SearchableSelect
                  size="sm"
                  showAllOption
                  allOptionLabel="All Categories"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="w-32">
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
                      checked={paginatedSubCategories.length > 0 && selectedIds.length === paginatedSubCategories.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-gray-300"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-gray-900">Sub Category</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Parent Category</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Code</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Created On</th>
                  <th className="py-3 px-4 font-bold text-gray-900">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedSubCategories.map((sub) => {
                  const isSelected = selectedIds.includes(sub.id);

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-gray-50/60 transition-colors ${isSelected ? "bg-orange-50/40" : ""}`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(sub.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-gray-300"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {sub.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900">{sub.name}</span>
                            {sub.description && (
                              <p className="text-[11px] text-gray-400 line-clamp-1">{sub.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
                          {sub.category?.name || "General"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">{sub.code || "-"}</td>
                      <td className="py-3.5 px-4 text-gray-500">{formatDate(sub.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        {sub.status === "ACTIVE" || !sub.status ? (
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
                            onClick={() => setViewSubCategory(sub)}
                            title="View Sub Category"
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors bg-white shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* 2. Edit */}
                          <button
                            onClick={() => handleOpenEditModal(sub)}
                            title="Edit Sub Category"
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-orange-50 text-gray-500 hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white shadow-2xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {/* 3. Delete */}
                          <button
                            onClick={() => setDeletingSubCategory(sub)}
                            title="Delete Sub Category"
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-rose-50 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors bg-white shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {subCategories.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-xs">
                      No sub categories found.
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
              <span>of {subCategories.length} entries</span>
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

        {/* View Sub Category Modal */}
        {viewSubCategory && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-50 text-[#FE9F43] rounded-xl">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Sub Category Details</h3>
                    <p className="text-[11px] text-gray-500">ID: {viewSubCategory.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewSubCategory(null)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Sub Category Name:</span>
                    <span className="font-bold text-gray-900">{viewSubCategory.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Parent Category:</span>
                    <span className="font-bold text-[#FE9F43]">{viewSubCategory.category?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Code:</span>
                    <span className="font-mono text-gray-800">{viewSubCategory.code || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Slug:</span>
                    <span className="font-mono text-gray-800">{viewSubCategory.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Status:</span>
                    <span className="font-bold text-emerald-600">{viewSubCategory.status || "ACTIVE"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Created Date:</span>
                    <span className="text-gray-700">{formatDate(viewSubCategory.createdAt)}</span>
                  </div>
                </div>

                {viewSubCategory.description && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 font-medium mb-1">Description:</p>
                    <p className="text-gray-800">{viewSubCategory.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewSubCategory(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Sub Category Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingSubCategory ? "Edit Sub Category" : "Add New Sub Category"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSubCategory} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <SearchableSelect
                    label="Parent Category"
                    required
                    placeholder="Select Category..."
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    value={formCategoryId}
                    onChange={setFormCategoryId}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">
                    Sub Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Laptops, T-Shirts, Sandals"
                    value={formName}
                    onChange={(e) => handleFormNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SC001"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. laptops"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of this sub category..."
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
                    {isSubmitting ? "Saving..." : editingSubCategory ? "Update Sub Category" : "Create Sub Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingSubCategory && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Sub Category?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete <strong>&quot;{deletingSubCategory.name}&quot;</strong>? This action will remove this sub-category.
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingSubCategory(null)}
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
      </div>
    </AppLayout>
  );
}

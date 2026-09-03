"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Expense, ExpenseCategory, Store } from "@/types";
import {
  fetchExpenses,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
  fetchExpenseCategories,
  fetchStores,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);
  const [deleteConfirmExpense, setDeleteConfirmExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formName, setFormName] = useState<string>("");
  const [formStore, setFormStore] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formDate, setFormDate] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("Approved");
  const [formDescription, setFormDescription] = useState<string>("");

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expData, catData, strData] = await Promise.all([
        fetchExpenses(),
        fetchExpenseCategories(),
        fetchStores(),
      ]);
      setExpenses(expData || []);
      setCategories(catData || []);
      setStores(strData || []);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormName("");
    setFormStore(stores.length > 0 ? stores[0].name : "Electro Mart");
    setFormCategory(categories.length > 0 ? categories[0].name : "Utilities");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStatus("Approved");
    setFormDescription("");
    setShowModal(true);
  };

  const handleOpenEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormName(exp.expenseName);
    setFormStore(exp.storeName || (stores.length > 0 ? stores[0].name : "Electro Mart"));
    setFormCategory(exp.categoryName || (categories.length > 0 ? categories[0].name : "Utilities"));
    setFormAmount(String(exp.amount));
    setFormDate(exp.date);
    setFormStatus(exp.status);
    setFormDescription(exp.description || "");
    setShowModal(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter Expense Name.",
      });
      return;
    }
    if (!formAmount || isNaN(Number(formAmount)) || Number(formAmount) <= 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Invalid Amount",
        message: "Please enter a valid expense amount greater than 0.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<Expense> = {
        expenseName: formName.trim(),
        storeName: formStore,
        categoryName: formCategory,
        amount: parseFloat(formAmount),
        date: formDate || new Date().toISOString().split("T")[0],
        status: formStatus,
        description: formDescription.trim(),
      };

      if (editingExpense) {
        await updateExpenseApi(editingExpense.id, payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Expense Updated!",
          message: `Expense "${formName}" has been updated successfully.`,
        });
      } else {
        await createExpenseApi(payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Expense Created!",
          message: `Expense "${formName}" has been recorded successfully.`,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save expense entry.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteConfirmExpense) return;
    try {
      setIsSubmitting(true);
      await deleteExpenseApi(deleteConfirmExpense.id);
      const deletedName = deleteConfirmExpense.expenseName;
      setDeleteConfirmExpense(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Expense Deleted",
        message: `Expense "${deletedName}" has been deleted from the database.`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "Could not delete this expense.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisplay = useMemo(() => {
    return expenses.filter((item) => {
      const term = search.toLowerCase();
      const matchesSearch =
        item.expenseName.toLowerCase().includes(term) ||
        item.reference.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.storeName && item.storeName.toLowerCase().includes(term));

      const matchesCat = categoryFilter === "all" || item.categoryName === categoryFilter;
      const matchesStore = storeFilter === "all" || item.storeName === storeFilter;
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCat && matchesStore && matchesStatus;
    });
  }, [expenses, search, categoryFilter, storeFilter, statusFilter]);

  const totalEntries = filteredDisplay.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDisplay.slice(start, start + pageSize);
  }, [filteredDisplay, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedList.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Reference,Expense Name,Category,Store,Amount,Date,Status,Description"];
    const rows = filteredDisplay.map(
      (e) =>
        `"${e.reference}","${e.expenseName}","${e.categoryName}","${e.storeName || ""}","${e.amount}","${e.date}","${e.status}","${e.description || ""}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Expenses</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage and track company store expenses</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              title="Print PDF"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-colors border border-gray-200 shadow-2xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-500" />
            </button>
            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-colors border border-gray-200 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={loadData}
              title="Refresh Data"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-colors border border-gray-200 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reference, name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white transition-all"
              />
            </div>

            {/* Category Filter */}
            <div>
              <SearchableSelect
                options={[
                  { value: "all", label: "Category: All" },
                  ...categories.map((c) => ({ value: c.name, label: c.name })),
                ]}
                value={categoryFilter}
                onChange={(val) => {
                  setCategoryFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="Category: All"
              />
            </div>

            {/* Store Filter */}
            <div>
              <SearchableSelect
                options={[
                  { value: "all", label: "Store: All" },
                  ...stores.map((s) => ({ value: s.name, label: s.name })),
                ]}
                value={storeFilter}
                onChange={(val) => {
                  setStoreFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="Store: All"
              />
            </div>

            {/* Status Filter */}
            <div>
              <SearchableSelect
                options={[
                  { value: "all", label: "Status: All" },
                  { value: "approved", label: "Approved" },
                  { value: "pending", label: "Pending" },
                ]}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="Status: All"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] w-3.5 h-3.5"
                    />
                  </th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Expense Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      Loading expenses...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      No expense records found.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] w-3.5 h-3.5"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{item.reference}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{item.expenseName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                          {item.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.storeName || "-"}</td>
                      <td className="py-3 px-4 text-gray-500">{item.date}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.status.toLowerCase() === "approved"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setViewExpense(item)}
                            title="View"
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit"
                            className="p-1 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmExpense(item)}
                            title="Delete"
                            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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
          <div className="py-3 px-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries (Total: {totalEntries})</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold transition-colors ${
                    currentPage === p
                      ? "bg-[#FE9F43] border-[#FE9F43] text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Form Modal (Add / Edit) */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="p-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Expense Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electricity Payment"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={categories.map((c) => ({ value: c.name, label: c.name }))}
                      value={formCategory}
                      onChange={(val) => setFormCategory(val)}
                      placeholder="Select Category"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Store <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={stores.map((s) => ({ value: s.name, label: s.name }))}
                      value={formStore}
                      onChange={(val) => setFormStore(val)}
                      placeholder="Select Store"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Amount ($) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <SearchableSelect
                    options={[
                      { value: "Approved", label: "Approved" },
                      { value: "Pending", label: "Pending" },
                    ]}
                    value={formStatus}
                    onChange={(val) => setFormStatus(val)}
                    placeholder="Select Status"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Description / Note</label>
                  <textarea
                    rows={2}
                    placeholder="Enter expense details..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-[#FE9F43] hover:bg-[#E88B32] text-white font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : editingExpense ? "Update Expense" : "Save Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Expense Details</h3>
                <button
                  onClick={() => setViewExpense(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Reference:</span>
                  <span className="font-bold text-gray-900">{viewExpense.reference}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Expense Name:</span>
                  <span className="font-semibold text-gray-800">{viewExpense.expenseName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Category:</span>
                  <span className="font-semibold text-gray-800">{viewExpense.categoryName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Store:</span>
                  <span className="text-gray-800">{viewExpense.storeName || "-"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Amount:</span>
                  <span className="font-bold text-lg text-emerald-600">
                    ${Number(viewExpense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Date:</span>
                  <span className="text-gray-800">{viewExpense.date}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      viewExpense.status.toLowerCase() === "approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {viewExpense.status}
                  </span>
                </div>
                {viewExpense.description && (
                  <div className="pt-2">
                    <span className="text-gray-500 font-medium block mb-1">Description:</span>
                    <p className="bg-gray-50 p-2.5 rounded-lg text-gray-700 leading-relaxed">
                      {viewExpense.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setViewExpense(null)}
                  className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Step 1 */}
        {deleteConfirmExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Expense?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-800">"{deleteConfirmExpense.expenseName}"</strong>? This
                  action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmExpense(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExpense}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modals (GEMINI.md standard) */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
              {feedbackModal.type === "add_success" && (
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "edit_success" && (
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "delete_success" && (
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "error" && (
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feedbackModal.message}</p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                {feedbackModal.type === "add_success" ? (
                  <>
                    <button
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        handleOpenAddModal();
                      }}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      + Add Another
                    </button>
                    <button
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="px-4 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
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

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Income, IncomeCategory, Store } from "@/types";
import {
  fetchIncomes,
  createIncomeApi,
  updateIncomeApi,
  deleteIncomeApi,
  fetchIncomeCategories,
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

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [viewIncome, setViewIncome] = useState<Income | null>(null);
  const [deleteConfirmIncome, setDeleteConfirmIncome] = useState<Income | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formName, setFormName] = useState<string>("");
  const [formStore, setFormStore] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formDate, setFormDate] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("Received");
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
      const [incData, catData, strData] = await Promise.all([
        fetchIncomes(),
        fetchIncomeCategories(),
        fetchStores(),
      ]);
      setIncomes(incData || []);
      setCategories(catData || []);
      setStores(strData || []);
    } catch (err) {
      console.error("Failed to fetch income:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setFormName("");
    setFormStore(stores.length > 0 ? stores[0].name : "Electro Mart");
    setFormCategory(categories.length > 0 ? categories[0].name : "Store Sales");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStatus("Received");
    setFormDescription("");
    setShowModal(true);
  };

  const handleOpenEditModal = (item: Income) => {
    setEditingIncome(item);
    setFormName(item.incomeName || "");
    setFormStore(item.storeName);
    setFormCategory(item.categoryName);
    setFormAmount(item.amount.toString());
    setFormDate(item.date);
    setFormStatus(item.status);
    setFormDescription(item.description || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter an amount.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<Income> = {
        incomeName: formName || formCategory,
        storeName: formStore,
        categoryName: formCategory,
        amount: Number(formAmount) || 0,
        date: formDate,
        status: formStatus,
        description: formDescription,
      };

      if (editingIncome) {
        await updateIncomeApi(editingIncome.id, payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Income Updated!",
          message: "Income record updated successfully.",
        });
      } else {
        await createIncomeApi(payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Income Created!",
          message: "Income of ฿" + Number(formAmount).toLocaleString() + " has been recorded.",
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save income record.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmIncome) return;
    try {
      await deleteIncomeApi(deleteConfirmIncome.id);
      const deletedRef = deleteConfirmIncome.reference;
      setDeleteConfirmIncome(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Income Deleted!",
        message: "Income " + deletedRef + " has been permanently removed.",
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "Failed to delete income record.",
      });
    }
  };

  const filteredDisplay = useMemo(() => {
    return incomes.filter((item) => {
      const matchSearch =
        (item.incomeName && item.incomeName.toLowerCase().includes(search.toLowerCase())) ||
        item.reference.toLowerCase().includes(search.toLowerCase()) ||
        item.storeName.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "all" || item.categoryName === categoryFilter;

      const matchStore =
        storeFilter === "all" || item.storeName === storeFilter;

      return matchSearch && matchCategory && matchStore;
    });
  }, [incomes, search, categoryFilter, storeFilter]);

  const totalPages = Math.ceil(filteredDisplay.length / pageSize) || 1;
  const paginatedIncomes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDisplay.slice(start, start + pageSize);
  }, [filteredDisplay, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedIncomes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedIncomes.map((e) => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    const headers = ["Reference,Store,Category,Amount,Date,Status,Description"];
    const rows = filteredDisplay.map(
      (e) =>
        '"' + e.reference + '","' + e.storeName + '","' + e.categoryName + '","' + e.amount + '","' + e.date + '","' + e.status + '","' + (e.description || "") + '"'
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "income_" + new Date().toISOString().split("T")[0] + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Income</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage Your Revenue & Inflow Records</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Export PDF / Print"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            <button
              title="Export CSV"
              onClick={exportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={"w-3.5 h-3.5 " + (loading ? "animate-spin text-[#FE9F43]" : "")} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search reference, store..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-44">
                <SearchableSelect
                  placeholder="All Categories"
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All Categories" },
                    ...categories.map((c) => ({ value: c.name, label: c.name })),
                  ]}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  placeholder="All Stores"
                  value={storeFilter}
                  onChange={(val) => {
                    setStoreFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All Stores" },
                    ...stores.map((s) => ({ value: s.name, label: s.name })),
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px] -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedIncomes.length > 0 && selectedIds.length === paginatedIncomes.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Income Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Store</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827] w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading incomes...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedIncomes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#9CA3AF]">
                      No income records found
                    </td>
                  </tr>
                ) : (
                  paginatedIncomes.map((item) => {
                    const isSelected = selectedIds.includes(item.id);

                    return (
                      <tr
                        key={item.id}
                        className={"hover:bg-[#F9FAFB] transition-colors " + (isSelected ? "bg-[#FFF8F2]" : "")}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-[#1E293B] font-bold font-mono">
                          {item.reference}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#111827]">
                          {item.incomeName || item.categoryName}
                        </td>
                        <td className="py-3.5 px-4 text-[#4B5563]">
                          {item.storeName}
                        </td>
                        <td className="py-3.5 px-4 text-[#4B5563]">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium border border-emerald-100">
                            {item.categoryName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#4B5563]">{item.date}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          +฿{item.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              title="View Details"
                              onClick={() => setViewIncome(item)}
                              className="w-7 h-7 rounded-md border border-[#E5E7EB] hover:bg-gray-50 text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Edit Income"
                              onClick={() => handleOpenEditModal(item)}
                              className="w-7 h-7 rounded-md border border-[#E5E7EB] hover:bg-blue-50 text-[#6B7280] hover:text-[#2563EB] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Delete Income"
                              onClick={() => setDeleteConfirmIncome(item)}
                              className="w-7 h-7 rounded-md border border-[#E5E7EB] hover:bg-rose-50 text-[#6B7280] hover:text-[#E11D48] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#F1F3F5] text-xs text-[#6B7280]">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E5E7EB] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries (Total {filteredDisplay.length})</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span className="px-3 py-1 bg-[#FE9F43] text-white rounded font-bold">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingIncome ? "Edit Income" : "Add Income"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Income Name / Source</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Daily Store Sales Batch #1"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Store *</label>
                    <SearchableSelect
                      placeholder="Select Store"
                      value={formStore}
                      onChange={(val) => setFormStore(val)}
                      options={stores.map((s) => ({ value: s.name, label: s.name }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Category *</label>
                    <SearchableSelect
                      placeholder="Select Category"
                      value={formCategory}
                      onChange={(val) => setFormCategory(val)}
                      options={categories.map((c) => ({ value: c.name, label: c.name }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Amount (฿) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Date *</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Sales summary notes"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white font-bold rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingIncome ? "Update Income" : "Create Income"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewIncome && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Income Details</h3>
                <button
                  onClick={() => setViewIncome(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs divide-y divide-gray-100">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{viewIncome.reference}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Store:</span>
                  <span className="font-bold text-gray-900">{viewIncome.storeName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Category:</span>
                  <span className="font-semibold text-emerald-600">{viewIncome.categoryName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Amount:</span>
                  <span className="text-sm font-bold text-emerald-600">+฿{viewIncome.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Date:</span>
                  <span className="text-gray-900">{viewIncome.date}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Status:</span>
                  <span className="font-bold text-emerald-600">{viewIncome.status}</span>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  onClick={() => setViewIncome(null)}
                  className="px-5 py-2 bg-[#0E1422] text-white font-bold rounded-lg hover:bg-gray-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmIncome && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Income Record</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteConfirmIncome.reference}"</span>?
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmIncome(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center animate-in fade-in zoom-in duration-150 border border-gray-100">
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
                        setFeedbackModal({ ...feedbackModal, isOpen: false });
                        handleOpenAddModal();
                      }}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + Add Another
                    </button>
                    <button
                      onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                      className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                    className="px-6 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
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

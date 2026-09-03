"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ExpenseCategory } from "@/types";
import { fetchExpenseCategories, createExpenseCategoryApi } from "@/lib/api";
import {
  PlusCircle,
  Search,
  RotateCcw,
  Edit,
  Trash2,
  X,
  Sparkles,
  AlertTriangle,
  FolderTree,
} from "lucide-react";

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formName, setFormName] = useState<string>("");
  const [formCode, setFormCode] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "error";
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
      const data = await fetchExpenseCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch expense categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormName("");
    setFormCode("EXPCAT-" + Math.floor(100 + Math.random() * 900));
    setFormDescription("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter category name.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createExpenseCategoryApi({
        name: formName,
        code: formCode,
        description: formDescription,
      });

      setShowModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Category Created!",
        message: "Expense category " + formName + " created successfully.",
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save category.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [categories, search]);

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Expense Categories</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage Categories for Company Expenses</p>
          </div>

          <div className="flex items-center space-x-2">
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
              <span>Add Category</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search category name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[250px] -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Code</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Description</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[#9CA3AF]">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#111827]">
                        <div className="flex items-center space-x-2">
                          <FolderTree className="w-4 h-4 text-[#FE9F43]" />
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#4B5563]">
                        {c.code || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7280]">
                        {c.description || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {c.status || "ACTIVE"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Expense Category</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Utilities"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Code</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="EXPCAT-001"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of this expense category"
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
                    {isSubmitting ? "Saving..." : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center animate-in fade-in zoom-in duration-150 border border-gray-100">
              {feedbackModal.type === "add_success" ? (
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feedbackModal.message}</p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                  className="px-6 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
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

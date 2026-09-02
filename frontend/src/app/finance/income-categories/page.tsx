"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Edit,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";

interface IncomeCategoryItem {
  id: string;
  code: string;
  category: string;
  addedDate: string;
}

export default function IncomeCategoriesPage() {
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const sampleCategories: IncomeCategoryItem[] = [
    { id: "1",  code: "INCA849", category: "Foreign investment",  addedDate: "24 Dec 2024" },
    { id: "2",  code: "INCA848", category: "Product Export",       addedDate: "10 Dec 2024" },
    { id: "3",  code: "INCA847", category: "Installation",         addedDate: "27 Nov 2024" },
    { id: "4",  code: "INCA846", category: "Product Sales",        addedDate: "18 Nov 2024" },
    { id: "5",  code: "INCA845", category: "Local Sale",           addedDate: "06 Nov 2024" },
    { id: "6",  code: "INCA844", category: "Service Fees",         addedDate: "25 Oct 2024" },
    { id: "7",  code: "INCA843", category: "Return/Refund Income", addedDate: "14 Oct 2024" },
    { id: "8",  code: "INCA842", category: "Foreign investment",   addedDate: "03 Oct 2024" },
    { id: "9",  code: "INCA841", category: "Product Export",       addedDate: "20 Sep 2024" },
    { id: "10", code: "INCA840", category: "Return/Refund Income", addedDate: "10 Sep 2024" },
  ];

  const filteredDisplay = sampleCategories.filter((item) => {
    const matchesSearch =
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisplay.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisplay.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Income Category</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your income category</p>
          </div>
          <div className="flex items-center space-x-2">
            <button title="Export PDF" onClick={() => alert("Exporting PDF...")} className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center border border-[#E5E7EB] shadow-2xs">
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>
            <button title="Export Excel" onClick={() => alert("Exporting Excel...")} className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center border border-[#E5E7EB] shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>
            <button title="Refresh" className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center border border-[#E5E7EB] shadow-2xs">
              <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
            <button title="Collapse" className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center border border-[#E5E7EB] shadow-2xs">
              <ChevronUp className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer">
                  <option value="all">Category</option>
                  <option>Foreign investment</option>
                  <option>Product Export</option>
                  <option>Installation</option>
                  <option>Product Sales</option>
                  <option>Local Sale</option>
                  <option>Service Fees</option>
                  <option>Return/Refund Income</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer">
                  <option value="all">Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
              <div className="relative">
                <select className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer">
                  <option>Sort By : Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Last Year</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] bg-white">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredDisplay.length} onChange={toggleSelectAll} className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer" />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Code</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Added Date</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`hover:bg-[#F9FAFB] transition-colors ${isSelected ? "bg-[#FFF8F2]" : ""}`}>
                      <td className="py-3.5 px-3 text-center">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#64748B]">{item.code}</td>
                      <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.category}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.addedDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button title="Edit" className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center bg-white">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button title="Delete" className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center bg-white">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-[#64748B] gap-3 border-t border-[#F1F3F5]">
            <div className="flex items-center space-x-2">
              <span>Row Per Page</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer">
                  <option>10</option><option>25</option><option>50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>Entries</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#94A3B8]">&lt;</button>
              <button className="w-6 h-6 rounded-full bg-[#FE9F43] text-white font-bold flex items-center justify-center text-xs">1</button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">&gt;</button>
            </div>
          </div>
        </div>

        {/* Add Income Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Income Category</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert("Income category created!"); setShowAddModal(false); }} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Category Name *</label>
                  <input type="text" required placeholder="e.g. Service Fees" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Description</label>
                  <textarea rows={3} placeholder="Enter short description..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                </div>
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white font-bold rounded-xl shadow-sm active:scale-95 transition-all">Create Category</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

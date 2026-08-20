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
  Calendar,
  Store,
} from "lucide-react";

interface IncomeItem {
  id: string;
  date: string;
  reference: string;
  store: string;
  category: string;
  notes: string;
  amount: string;
}

export default function IncomePage() {
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [dateRange] = useState<string>("01-Jan-2026 - 12-Dec-2026");

  const sampleIncome: IncomeItem[] = [
    { id: "1", date: "24 Dec 2024", reference: "INB49", store: "Distribution center", category: "Foreign investment", notes: "Categorize income derived", amount: "$200" },
    { id: "2", date: "10 Dec 2024", reference: "INB48", store: "Intelligent warehouse", category: "Product Export", notes: "Services that have been verified", amount: "$50" },
    { id: "3", date: "27 Nov 2024", reference: "INB47", store: "Mahin Logistics", category: "Installation", notes: "POS Installation for Store", amount: "$800" },
    { id: "4", date: "06 Nov 2024", reference: "INB45", store: "Bonded warehouse", category: "Local Sale", notes: "Travel fare for client meeting", amount: "$700" },
    { id: "5", date: "25 Oct 2024", reference: "INB44", store: "Budget warehouse", category: "Service Fees", notes: "Services that have been verified", amount: "$1000" },
    { id: "6", date: "14 Oct 2024", reference: "INB43", store: "Gati Limited", category: "Return/Refund Income", notes: "Flight tickets for meetings", amount: "$1200" },
    { id: "7", date: "03 Oct 2024", reference: "INB42", store: "Storeroom Halls", category: "Foreign investment", notes: "Services that have been verified", amount: "$750" },
    { id: "8", date: "20 Sep 2024", reference: "INB41", store: "Strongbox", category: "Product Export", notes: "Categorize income derived in office", amount: "$450" },
    { id: "9", date: "10 Sep 2024", reference: "INB40", store: "Total Quality Logistics", category: "Return/Refund Income", notes: "Services that have been verified", amount: "$300" },
  ];

  const filteredDisplay = sampleIncome.filter((item) => {
    return (
      item.reference.toLowerCase().includes(search.toLowerCase()) ||
      item.store.toLowerCase().includes(search.toLowerCase()) ||
      item.notes.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    );
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Balance Sheet</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">View Your Balance Sheet</p>
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
              <button className="flex items-center space-x-1.5 bg-white border border-[#E5E7EB] rounded-lg pl-2.5 pr-3 py-1.5 text-xs text-[#374151] hover:bg-gray-50">
                <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>{dateRange}</span>
              </button>
              <div className="relative">
                <select className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer">
                  <option value="">Select Store</option>
                  <option>Distribution center</option>
                  <option>Intelligent warehouse</option>
                  <option>Mahin Logistics</option>
                  <option>Bonded warehouse</option>
                  <option>Budget warehouse</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] bg-white">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredDisplay.length} onChange={toggleSelectAll} className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer" />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Store</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Notes</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
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
                      <td className="py-3.5 px-4 text-[#64748B]">{item.date}</td>
                      <td className="py-3.5 px-4 font-mono text-[#64748B]">{item.reference}</td>
                      <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.store}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.category}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.notes}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.amount}</td>
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

        {/* Add Income Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Income</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert("Income created!"); setShowAddModal(false); }} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Reference *</label>
                    <input type="text" required placeholder="e.g. INB50" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Date *</label>
                    <input type="date" required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Category *</label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]">
                      <option>Foreign investment</option>
                      <option>Product Export</option>
                      <option>Installation</option>
                      <option>Local Sale</option>
                      <option>Service Fees</option>
                      <option>Return/Refund Income</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Amount ($) *</label>
                    <input type="number" required placeholder="200" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Store</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]">
                      <option value="">Select Store</option>
                      <option>Distribution center</option>
                      <option>Intelligent warehouse</option>
                      <option>Mahin Logistics</option>
                      <option>Bonded warehouse</option>
                      <option>Budget warehouse</option>
                    </select>
                    <Store className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Notes</label>
                  <input type="text" placeholder="e.g. Services that have been verified" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                </div>
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white font-bold rounded-xl shadow-sm active:scale-95 transition-all">Create Income</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

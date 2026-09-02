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
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";

interface ExpenseItem {
  id: string;
  reference: string;
  expenseName: string;
  category: string;
  description: string;
  date: string;
  amount: string;
  status: "Approved" | "Pending";
}

export default function ExpensesPage() {
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [viewExpense, setViewExpense] = useState<ExpenseItem | null>(null);

  // 10 Sample items matching Screenshot 2
  const sampleExpenses: ExpenseItem[] = [
    {
      id: "1",
      reference: "EX849",
      expenseName: "Electricity Payment",
      category: "Utilities",
      description: "Electricity Bill",
      date: "24 Dec 2024",
      amount: "$200",
      status: "Approved",
    },
    {
      id: "2",
      reference: "EX848",
      expenseName: "Stationery Purchase",
      category: "Office Supplies",
      description: "Stationery items for office",
      date: "10 Dec 2024",
      amount: "$50",
      status: "Pending",
    },
    {
      id: "3",
      reference: "EX847",
      expenseName: "AC Repair Service",
      category: "Repairs & Maintenance",
      description: "AC Repair for Office",
      date: "27 Nov 2024",
      amount: "$800",
      status: "Approved",
    },
    {
      id: "4",
      reference: "EX846",
      expenseName: "Social Media Promotion",
      category: "Marketing",
      description: "Social Media Ads Campaign",
      date: "18 Nov 2024",
      amount: "$100",
      status: "Approved",
    },
    {
      id: "5",
      reference: "EX845",
      expenseName: "Client Meeting",
      category: "Travel Expenses",
      description: "Travel fare for client meeting",
      date: "06 Nov 2024",
      amount: "$700",
      status: "Approved",
    },
    {
      id: "6",
      reference: "EX844",
      expenseName: "Team Lunch",
      category: "Employee Benefits",
      description: "Team Lunch at Restaurant",
      date: "25 Oct 2024",
      amount: "$1000",
      status: "Pending",
    },
    {
      id: "7",
      reference: "EX843",
      expenseName: "Business Flight Ticket",
      category: "Travel Expenses",
      description: "Flight tickets for meetings",
      date: "14 Oct 2024",
      amount: "$1200",
      status: "Approved",
    },
    {
      id: "8",
      reference: "EX842",
      expenseName: "Chair Purchase",
      category: "Office Supplies",
      description: "Ergonomic chairs for staff",
      date: "03 Oct 2024",
      amount: "$750",
      status: "Approved",
    },
    {
      id: "9",
      reference: "EX841",
      expenseName: "Plumbing Service",
      category: "Repairs & Maintenance",
      description: "Plumbing repairs in office",
      date: "20 Sep 2024",
      amount: "$450",
      status: "Approved",
    },
    {
      id: "10",
      reference: "EX840",
      expenseName: "Internet Bill Payment",
      category: "Utilities",
      description: "Monthly internet subscription",
      date: "10 Sep 2024",
      amount: "$300",
      status: "Pending",
    },
  ];

  const filteredDisplay = sampleExpenses.filter((item) => {
    const matchesSearch =
      item.expenseName.toLowerCase().includes(search.toLowerCase()) ||
      item.reference.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisplay.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisplay.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Expenses</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage Your Expenses</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export (Red) */}
            <button
              title="Export PDF"
              onClick={() => alert("Exporting PDF report...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export (Green) */}
            <button
              title="Export Excel"
              onClick={() => alert("Exporting Excel report...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Collapse */}
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* + Add Expense Button (Orange) */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Expenses Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filters Bar */}
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
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Category</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Travel Expenses">Travel Expenses</option>
                  <option value="Employee Benefits">Employee Benefits</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Clean Table with White Thead */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredDisplay.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827] min-w-[160px]">Expense Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Description</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827] w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${
                        isSelected ? "bg-[#FFF8F2]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#64748B]">{item.reference}</td>
                      <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.expenseName}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.category}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.description}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.amount}</td>

                      {/* Status Badges: Approved (Green) / Pending (Cyan) */}
                      <td className="py-3.5 px-4">
                        {item.status === "Approved" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#28C76F] text-white">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#00CFE8] text-white">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action buttons: View, Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setViewExpense(item)}
                            title="View Expense"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Edit Expense"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Expense"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center transition-colors bg-white"
                          >
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

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-[#64748B] gap-3 border-t border-[#F1F3F5]">
            <div className="flex items-center space-x-2">
              <span>Row Per Page</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>Entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#94A3B8]">
                &lt;
              </button>
              <button className="w-6 h-6 rounded-full bg-[#FE9F43] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                1
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Add Expense Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Expense</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Expense created successfully!");
                  setShowAddModal(false);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Expense Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electricity Payment"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Category *</label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]">
                      <option value="Utilities">Utilities</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Travel Expenses">Travel Expenses</option>
                      <option value="Employee Benefits">Employee Benefits</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Amount ($) *</label>
                    <input
                      type="number"
                      required
                      placeholder="200"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Electricity Bill for December"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white font-bold rounded-xl shadow-sm active:scale-95 transition-all"
                  >
                    Create Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

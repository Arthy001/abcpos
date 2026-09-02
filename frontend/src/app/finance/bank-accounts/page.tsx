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

interface BankAccountItem {
  id: string;
  accountHolderName: string;
  accountNo: string;
  type: string;
  openingBalance: string;
  notes: string;
  status: "Active" | "Closed";
}

export default function BankAccountsPage() {
  const [activeTab, setActiveTab] = useState<"accounts" | "types">("accounts");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const sampleAccounts: BankAccountItem[] = [
    { id: "1", accountHolderName: "Zephyr Indira", accountNo: "3298784309485", type: "Savings Account", openingBalance: "$200", notes: "Account for Business", status: "Active" },
    { id: "2", accountHolderName: "Quillon Elysia", accountNo: "5475878970090", type: "Current Account", openingBalance: "$50", notes: "Account for Business", status: "Closed" },
    { id: "3", accountHolderName: "Thaddeus Juniper", accountNo: "3255465758698", type: "Salary Account", openingBalance: "$800", notes: "Current Account", status: "Active" },
    { id: "4", accountHolderName: "Orion Astrid", accountNo: "4353689870544", type: "Current Account", openingBalance: "$100", notes: "Account for Business", status: "Active" },
    { id: "5", accountHolderName: "Caspian Marigold", accountNo: "4324356677889", type: "Current Account", openingBalance: "$700", notes: "Account for Business", status: "Active" },
    { id: "6", accountHolderName: "Emma James", accountNo: "2343547586900", type: "Salary Account", openingBalance: "$1000", notes: "Account for Business", status: "Active" },
    { id: "7", accountHolderName: "Olivia Ethan", accountNo: "3453647664889", type: "Current Account", openingBalance: "$1200", notes: "A type of bank account.", status: "Active" },
    { id: "8", accountHolderName: "Sophia Liam", accountNo: "3354456565687", type: "Current Account", openingBalance: "$750", notes: "Account for Business", status: "Closed" },
    { id: "9", accountHolderName: "Ava Mason", accountNo: "3456565767787", type: "Salary Account", openingBalance: "$450", notes: "A type of bank account.", status: "Active" },
    { id: "10", accountHolderName: "Isabella Jackson", accountNo: "3434565776768", type: "Salary Account", openingBalance: "$300", notes: "A type of bank account.", status: "Active" },
  ];

  const filteredDisplay = sampleAccounts.filter((item) => {
    const matchesSearch =
      item.accountHolderName.toLowerCase().includes(search.toLowerCase()) ||
      item.accountNo.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.notes.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        {/* Top Tabs */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "accounts"
                ? "bg-[#FE9F43] text-white shadow-xs"
                : "bg-[#E5E7EB] text-[#4B5563] hover:bg-gray-300"
            }`}
          >
            Bank Accounts
          </button>
          <button
            onClick={() => setActiveTab("types")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "types"
                ? "bg-[#FE9F43] text-white shadow-xs"
                : "bg-[#E5E7EB] text-[#4B5563] hover:bg-gray-300"
            }`}
          >
            Account Type
          </button>
        </div>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Bank Accounts</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your Accounts List</p>
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
              <span>Add Account</span>
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filters */}
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer">
                  <option>Sort By : Latest</option>
                  <option>Sort By : Oldest</option>
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
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredDisplay.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Account Holder Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Account No</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Type</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Opening Balance</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Notes</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`hover:bg-[#F9FAFB] transition-colors ${isSelected ? "bg-[#FFF8F2]" : ""}`}>
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.accountHolderName}</td>
                      <td className="py-3.5 px-4 font-mono text-[#64748B]">{item.accountNo}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.type}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.openingBalance}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.notes}</td>
                      <td className="py-3.5 px-4">
                        {item.status === "Active" ? (
                          <span className="inline-flex items-center space-x-1 text-white font-semibold text-[10px] bg-[#28C76F] px-2 py-0.5 rounded">
                            <span>•</span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-white font-semibold text-[10px] bg-[#EA5455] px-2 py-0.5 rounded">
                            <span>•</span>
                            <span>Closed</span>
                          </span>
                        )}
                      </td>
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

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Bank Account</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert("Account added!"); setShowAddModal(false); }} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Account Holder Name *</label>
                  <input type="text" required placeholder="e.g. Zephyr Indira" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Account Number *</label>
                    <input type="text" required placeholder="e.g. 3298784309485" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Account Type *</label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]">
                      <option>Savings Account</option>
                      <option>Current Account</option>
                      <option>Salary Account</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Opening Balance ($) *</label>
                  <input type="number" required placeholder="200" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Notes</label>
                  <input type="text" placeholder="e.g. Account for Business" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]" />
                </div>
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white font-bold rounded-xl shadow-sm active:scale-95 transition-all">Create Account</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

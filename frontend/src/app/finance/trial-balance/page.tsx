"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Calendar,
  ChevronDown,
} from "lucide-react";

export default function TrialBalancePage() {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [dateRange] = useState<string>("01-Jan-2026 - 12-Dec-2026");

  const assets = [
    { name: "Cash in register", debit: "$5,000", credit: "" },
    { name: "Bank Accounts", debit: "$12,000", credit: "" },
    { name: "Accounts Receivable", debit: "$3,000", credit: "" },
    { name: "Inventory (POS stock)", debit: "$10,000", credit: "" },
  ];

  const liabilities = [
    { name: "Accounts Payable", debit: "", credit: "$2,000" },
    { name: "Short-term Loans", debit: "", credit: "$4,000" },
    { name: "Sales Tax Payable", debit: "", credit: "$500" },
    { name: "Wages Payable", debit: "", credit: "$1,200" },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Trial Balance</h1>
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
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-5">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="space-y-1.5 w-full md:w-64">
              <label className="text-xs font-semibold text-[#374151]">Choose Your Date</label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#374151]">
                <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                <span>{dateRange}</span>
              </div>
            </div>
            <div className="space-y-1.5 w-full md:w-64">
              <label className="text-xs font-semibold text-[#374151]">Store</label>
              <div className="relative">
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-8 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="Distribution center">Distribution center</option>
                  <option value="Intelligent warehouse">Intelligent warehouse</option>
                  <option value="Mahin Logistics">Mahin Logistics</option>
                  <option value="Bonded warehouse">Bonded warehouse</option>
                  <option value="Budget warehouse">Budget warehouse</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
            <button
              onClick={() => {}}
              className="px-6 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] bg-white">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827] w-1/2">Account Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827] w-1/4">Debit</th>
                  <th className="py-3 px-4 font-bold text-[#111827] w-1/4">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {/* Assets Section */}
                <tr className="bg-[#FAFBFD]">
                  <td colSpan={3} className="py-3 px-4 font-bold text-[#111827]">Assets</td>
                </tr>
                {assets.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 text-[#64748B] pl-6">{item.name}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.debit}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.credit}</td>
                  </tr>
                ))}
                <tr className="border-t border-[#E5E7EB] font-bold text-xs text-[#111827]">
                  <td className="py-3.5 px-4">Total Assets</td>
                  <td className="py-3.5 px-4">$37,000</td>
                  <td className="py-3.5 px-4"></td>
                </tr>

                {/* Liabilities Section */}
                <tr className="bg-[#FAFBFD]">
                  <td colSpan={3} className="py-3 px-4 font-bold text-[#111827]">Liabilities</td>
                </tr>
                {liabilities.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 text-[#64748B] pl-6">{item.name}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.debit}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.credit}</td>
                  </tr>
                ))}
                <tr className="border-t border-[#E5E7EB] font-bold text-xs text-[#111827]">
                  <td className="py-3.5 px-4">Total Liabilities</td>
                  <td className="py-3.5 px-4"></td>
                  <td className="py-3.5 px-4">$20,700</td>
                </tr>

                {/* Total Row */}
                <tr className="border-t-2 border-[#111827] font-bold text-xs text-[#111827]">
                  <td className="py-4 px-4">Total</td>
                  <td className="py-4 px-4">$37,000</td>
                  <td className="py-4 px-4">$37,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

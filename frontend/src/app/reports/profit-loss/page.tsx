"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfitLossReportItem } from "@/types";
import { fetchProfitLossReport } from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  Calendar,
} from "lucide-react";

export default function ProfitLossReportPage() {
  const [items, setItems] = useState<ProfitLossReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<string>("15/08/2026 - 21/08/2026");

  // Sample fallback matching screenshot
  const sampleIncome = [
    { key: "Sales", jan: 50000, feb: 50000, mar: 50000, apr: 50000, may: 50000, jun: 50000, isBold: false },
    { key: "Service", jan: 30000, feb: 30000, mar: 30000, apr: 30000, may: 30000, jun: 30000, isBold: false },
    { key: "Purchase Return", jan: 7000, feb: 7000, mar: 7000, apr: 7000, may: 7000, jun: 7000, isBold: false },
    { key: "Gross Profit", jan: 8000, feb: 8000, mar: 8000, apr: 8000, may: 8000, jun: 8000, isBold: true },
  ];

  const sampleExpenses = [
    { key: "Sales", jan: 50000, feb: 50000, mar: 50000, apr: 50000, may: 50000, jun: 50000, isBold: false },
    { key: "Purrchase", jan: 30000, feb: 30000, mar: 30000, apr: 30000, may: 30000, jun: 30000, isBold: false },
    { key: "Sales Return", jan: 7000, feb: 7000, mar: 7000, apr: 7000, may: 7000, jun: 7000, isBold: true },
    { key: "Total Expense", jan: 8000, feb: 8000, mar: 8000, apr: 8000, may: 8000, jun: 8000, isBold: true },
    { key: "Net Profit", jan: 8000, feb: 8000, mar: 8000, apr: 8000, may: 8000, jun: 8000, isBold: true },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchProfitLossReport();
      if (data && data.length > 0) {
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Profit / Loss Report</h1>
            <p className="text-xs text-[#64748B] mt-0.5">View Reports of Profit / Loss Report</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh */}
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>

            {/* Collapse */}
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Box (Right aligned Date & Button as in screenshot) */}
        <div className="flex justify-end items-center gap-3">
          <div className="relative flex items-center border border-[#E5E7EB] rounded-lg px-3 py-2 bg-white shadow-2xs min-w-[220px]">
            <Calendar className="w-4 h-4 text-[#9CA3AF] mr-2 shrink-0" />
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-transparent text-xs text-[#374151] focus:outline-none"
            />
          </div>

          <button
            onClick={loadData}
            className="py-2 px-5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            Generate Report
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3.5 px-5 font-bold text-[#111827] w-1/4"></th>
                  <th className="py-3.5 px-4 font-bold text-[#111827]">Jan 2026</th>
                  <th className="py-3.5 px-4 font-bold text-[#111827]">Feb 2026</th>
                  <th className="py-3.5 px-4 font-bold text-[#111827]">Mar 2026</th>
                  <th className="py-3.5 px-4 font-bold text-[#111827]">Apr 2026</th>
                  <th className="py-3.5 px-4 font-bold text-[#111827]">May 2026</th>
                  <th className="py-3.5 px-4 font-bold text-[#111827]">Jun 2026</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {/* SECTION 1: INCOME */}
                <tr className="bg-[#F8F9FA]/50">
                  <td colSpan={7} className="py-2.5 px-5 font-bold text-[#1E293B]">
                    Income
                  </td>
                </tr>
                {sampleIncome.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className={`py-3.5 px-5 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      {row.key}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.jan.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.feb.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.mar.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.apr.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.may.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.jun.toLocaleString()}
                    </td>
                  </tr>
                ))}

                {/* SECTION 2: EXPENSES */}
                <tr className="bg-[#F8F9FA]/50">
                  <td colSpan={7} className="py-2.5 px-5 font-bold text-[#1E293B]">
                    Expenses
                  </td>
                </tr>
                {sampleExpenses.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className={`py-3.5 px-5 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      {row.key}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.jan.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.feb.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.mar.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.apr.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.may.toLocaleString()}
                    </td>
                    <td className={`py-3.5 px-4 ${row.isBold ? "font-bold text-[#1E293B]" : "text-[#64748B]"}`}>
                      ${row.jun.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

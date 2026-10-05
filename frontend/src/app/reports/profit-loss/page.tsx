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

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchProfitLossReport();
      if (data && data.length > 0) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const incomeItems = items.filter((i) => i.type === "INCOME");
  const expenseItems = items.filter((i) => i.type === "EXPENSE");

  const grossProfit = {
    jan: incomeItems.reduce((acc, cur) => acc + (cur.jan2026 || 0), 0),
    feb: incomeItems.reduce((acc, cur) => acc + (cur.feb2026 || 0), 0),
    mar: incomeItems.reduce((acc, cur) => acc + (cur.mar2026 || 0), 0),
    apr: incomeItems.reduce((acc, cur) => acc + (cur.apr2026 || 0), 0),
    may: incomeItems.reduce((acc, cur) => acc + (cur.may2026 || 0), 0),
    jun: incomeItems.reduce((acc, cur) => acc + (cur.jun2026 || 0), 0),
  };

  const totalExpense = {
    jan: expenseItems.reduce((acc, cur) => acc + (cur.jan2026 || 0), 0),
    feb: expenseItems.reduce((acc, cur) => acc + (cur.feb2026 || 0), 0),
    mar: expenseItems.reduce((acc, cur) => acc + (cur.mar2026 || 0), 0),
    apr: expenseItems.reduce((acc, cur) => acc + (cur.apr2026 || 0), 0),
    may: expenseItems.reduce((acc, cur) => acc + (cur.may2026 || 0), 0),
    jun: expenseItems.reduce((acc, cur) => acc + (cur.jun2026 || 0), 0),
  };

  const netProfit = {
    jan: grossProfit.jan - totalExpense.jan,
    feb: grossProfit.feb - totalExpense.feb,
    mar: grossProfit.mar - totalExpense.mar,
    apr: grossProfit.apr - totalExpense.apr,
    may: grossProfit.may - totalExpense.may,
    jun: grossProfit.jun - totalExpense.jun,
  };

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
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
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
                {incomeItems.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-5 text-[#64748B] font-medium">
                      {row.itemKey}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.jan2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.feb2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.mar2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.apr2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.may2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.jun2026 || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {/* Gross Profit Calculated Row */}
                <tr className="bg-[#FE9F43]/5 border-t border-b border-[#FE9F43]/20 font-bold text-[#1E293B]">
                  <td className="py-3.5 px-5 font-bold text-[#1E293B]">Gross Profit</td>
                  <td className="py-3.5 px-4 font-bold text-[#1E293B]">${grossProfit.jan.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1E293B]">${grossProfit.feb.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1E293B]">${grossProfit.mar.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1E293B]">${grossProfit.apr.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1E293B]">${grossProfit.may.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1E293B]">${grossProfit.jun.toLocaleString()}</td>
                </tr>

                {/* SECTION 2: EXPENSES */}
                <tr className="bg-[#F8F9FA]/50">
                  <td colSpan={7} className="py-2.5 px-5 font-bold text-[#1E293B]">
                    Expenses
                  </td>
                </tr>
                {expenseItems.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-5 text-[#64748B] font-medium">
                      {row.itemKey}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.jan2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.feb2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.mar2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.apr2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.may2026 || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      ${(row.jun2026 || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {/* Total Expense Calculated Row */}
                <tr className="bg-rose-50/50 border-t border-b border-rose-100 font-bold text-rose-600">
                  <td className="py-3.5 px-5 font-bold text-rose-600">Total Expense</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">${totalExpense.jan.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">${totalExpense.feb.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">${totalExpense.mar.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">${totalExpense.apr.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">${totalExpense.may.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">${totalExpense.jun.toLocaleString()}</td>
                </tr>

                {/* Net Profit Row */}
                <tr className="bg-emerald-50/70 border-t-2 border-b-2 border-emerald-200 font-extrabold text-emerald-700">
                  <td className="py-4 px-5 font-extrabold text-emerald-800">Net Profit</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-700">${netProfit.jan.toLocaleString()}</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-700">${netProfit.feb.toLocaleString()}</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-700">${netProfit.mar.toLocaleString()}</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-700">${netProfit.apr.toLocaleString()}</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-700">${netProfit.may.toLocaleString()}</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-700">${netProfit.jun.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

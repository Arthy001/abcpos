"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfitLossReportItem } from "@/types";
import { fetchProfitLossReport } from "@/lib/api";
import {
  RotateCcw,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  PieChart,
} from "lucide-react";

export default function ProfitLossReportPage() {
  const [items, setItems] = useState<ProfitLossReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<"H2" | "H1">("H2"); // Default to H2 (Jul - Dec 2026) for current active sales

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

  // Determine active 6 months based on period
  const monthCols =
    period === "H1"
      ? [
          { label: "Jan 2026", key: "jan2026" as keyof ProfitLossReportItem },
          { label: "Feb 2026", key: "feb2026" as keyof ProfitLossReportItem },
          { label: "Mar 2026", key: "mar2026" as keyof ProfitLossReportItem },
          { label: "Apr 2026", key: "apr2026" as keyof ProfitLossReportItem },
          { label: "May 2026", key: "may2026" as keyof ProfitLossReportItem },
          { label: "Jun 2026", key: "jun2026" as keyof ProfitLossReportItem },
        ]
      : [
          { label: "Jul 2026", key: "jul2026" as keyof ProfitLossReportItem },
          { label: "Aug 2026", key: "aug2026" as keyof ProfitLossReportItem },
          { label: "Sep 2026", key: "sep2026" as keyof ProfitLossReportItem },
          { label: "Oct 2026", key: "oct2026" as keyof ProfitLossReportItem },
          { label: "Nov 2026", key: "nov2026" as keyof ProfitLossReportItem },
          { label: "Dec 2026", key: "dec2026" as keyof ProfitLossReportItem },
        ];

  // Helper to compute row total across the 6 selected months
  const computeRowTotal = (row: ProfitLossReportItem) => {
    return monthCols.reduce((sum, col) => sum + (Number(row[col.key]) || 0), 0);
  };

  // Monthly sums
  const monthlyGrossIncome = monthCols.map((col) =>
    incomeItems.reduce((acc, cur) => acc + (Number(cur[col.key]) || 0), 0)
  );

  const monthlyTotalExpense = monthCols.map((col) =>
    expenseItems.reduce((acc, cur) => acc + (Number(cur[col.key]) || 0), 0)
  );

  const monthlyNetProfit = monthCols.map(
    (_, idx) => monthlyGrossIncome[idx] - monthlyTotalExpense[idx]
  );

  // Period totals
  const periodTotalIncome = monthlyGrossIncome.reduce((a, b) => a + b, 0);
  const periodTotalExpense = monthlyTotalExpense.reduce((a, b) => a + b, 0);
  const periodNetProfit = periodTotalIncome - periodTotalExpense;
  const netMargin =
    periodTotalIncome > 0 ? (periodNetProfit / periodTotalIncome) * 100 : 0;

  const handleExportCSV = () => {
    const headers = ["Account Type,Item Description", ...monthCols.map((c) => c.label), "Total"];
    const rows: string[] = [];

    // Income
    incomeItems.forEach((row) => {
      const vals = monthCols.map((col) => Number(row[col.key]) || 0);
      const total = computeRowTotal(row);
      rows.push(`"Income","${row.itemKey}",${vals.join(",")},${total}`);
    });
    rows.push(`"Gross Income","Total Revenue",${monthlyGrossIncome.join(",")},${periodTotalIncome}`);

    // Expense
    expenseItems.forEach((row) => {
      const vals = monthCols.map((col) => Number(row[col.key]) || 0);
      const total = computeRowTotal(row);
      rows.push(`"Expense","${row.itemKey}",${vals.join(",")},${total}`);
    });
    rows.push(`"Total Expense","Total Expense",${monthlyTotalExpense.join(",")},${periodTotalExpense}`);

    // Net Profit
    rows.push(`"Net Profit","Net Profit",${monthlyNetProfit.join(",")},${periodNetProfit}`);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `profit_loss_${period}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Profit & Loss Statement</h1>
            <p className="text-xs text-gray-500 mt-0.5">Comprehensive financial statement comparing store revenues, COGS, and operating expenses</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Period Switcher */}
            <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200">
              <button
                onClick={() => setPeriod("H2")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === "H2"
                    ? "bg-white text-orange-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                H2 (Jul - Dec 2026)
              </button>
              <button
                onClick={() => setPeriod("H1")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === "H1"
                    ? "bg-white text-orange-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                H1 (Jan - Jun 2026)
              </button>
            </div>

            <button
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 flex items-center space-x-1.5 transition-colors border border-gray-200 shadow-xs text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : "text-gray-500"}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-emerald-700 flex items-center space-x-1.5 transition-colors border border-gray-200 shadow-xs text-xs font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              title="Print"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 flex items-center space-x-1.5 transition-colors border border-gray-200 shadow-xs text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Revenue ({period})</p>
              <h3 className="text-xl font-extrabold text-emerald-600 mt-1">
                ฿{periodTotalIncome.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Expenses & COGS</p>
              <h3 className="text-xl font-extrabold text-rose-600 mt-1">
                ฿{periodTotalExpense.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Net Profit ({netMargin.toFixed(1)}%)</p>
              <h3 className={`text-xl font-extrabold mt-1 ${periodNetProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                ฿{periodNetProfit.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3.5 px-5 font-bold w-1/4">Account Item</th>
                  {monthCols.map((c) => (
                    <th key={c.key} className="py-3.5 px-4 font-bold text-right">
                      {c.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-5 font-bold text-right text-gray-900 bg-gray-100/50">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* SECTION 1: INCOME */}
                <tr className="bg-emerald-50/40">
                  <td colSpan={monthCols.length + 2} className="py-2.5 px-5 font-bold text-emerald-800 uppercase tracking-wider text-[11px]">
                    1. Revenues & Incomes
                  </td>
                </tr>
                {incomeItems.map((row) => {
                  const rowTotal = computeRowTotal(row);
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-5 text-gray-800 font-medium">{row.itemKey}</td>
                      {monthCols.map((col) => (
                        <td key={col.key} className="py-3 px-4 text-right text-gray-600 font-medium">
                          ฿{(Number(row[col.key]) || 0).toLocaleString()}
                        </td>
                      ))}
                      <td className="py-3 px-5 text-right font-bold text-gray-900 bg-gray-50/50">
                        ฿{rowTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}

                {/* Gross Income Calculated Row */}
                <tr className="bg-emerald-50/70 border-t border-b border-emerald-200 font-bold text-emerald-900">
                  <td className="py-3.5 px-5 font-extrabold text-emerald-900">Gross Income</td>
                  {monthlyGrossIncome.map((val, idx) => (
                    <td key={idx} className="py-3.5 px-4 text-right font-extrabold text-emerald-800">
                      ฿{val.toLocaleString()}
                    </td>
                  ))}
                  <td className="py-3.5 px-5 text-right font-extrabold text-emerald-900 bg-emerald-100/50">
                    ฿{periodTotalIncome.toLocaleString()}
                  </td>
                </tr>

                {/* SECTION 2: EXPENSES */}
                <tr className="bg-rose-50/40">
                  <td colSpan={monthCols.length + 2} className="py-2.5 px-5 font-bold text-rose-800 uppercase tracking-wider text-[11px]">
                    2. Costs & Operating Expenses
                  </td>
                </tr>
                {expenseItems.map((row) => {
                  const rowTotal = computeRowTotal(row);
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-5 text-gray-800 font-medium">{row.itemKey}</td>
                      {monthCols.map((col) => (
                        <td key={col.key} className="py-3 px-4 text-right text-gray-600 font-medium">
                          ฿{(Number(row[col.key]) || 0).toLocaleString()}
                        </td>
                      ))}
                      <td className="py-3 px-5 text-right font-bold text-gray-900 bg-gray-50/50">
                        ฿{rowTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}

                {/* Total Expense Calculated Row */}
                <tr className="bg-rose-50/70 border-t border-b border-rose-200 font-bold text-rose-900">
                  <td className="py-3.5 px-5 font-extrabold text-rose-900">Total Expenses</td>
                  {monthlyTotalExpense.map((val, idx) => (
                    <td key={idx} className="py-3.5 px-4 text-right font-extrabold text-rose-800">
                      ฿{val.toLocaleString()}
                    </td>
                  ))}
                  <td className="py-3.5 px-5 text-right font-extrabold text-rose-900 bg-rose-100/50">
                    ฿{periodTotalExpense.toLocaleString()}
                  </td>
                </tr>

                {/* Net Profit Row */}
                <tr className="bg-blue-50/80 border-t-2 border-b-2 border-blue-200 font-extrabold text-blue-900">
                  <td className="py-4 px-5 font-extrabold text-blue-900 text-sm">
                    Net Operating Profit
                  </td>
                  {monthlyNetProfit.map((val, idx) => (
                    <td
                      key={idx}
                      className={`py-4 px-4 text-right font-extrabold text-sm ${
                        val >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      ฿{val.toLocaleString()}
                    </td>
                  ))}
                  <td className="py-4 px-5 text-right font-black text-sm text-blue-900 bg-blue-100/50">
                    ฿{periodNetProfit.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

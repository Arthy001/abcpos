"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BankAccount, Expense, Income } from "@/types";
import { fetchBankAccounts, fetchExpenses, fetchIncomes } from "@/lib/api";
import {
  FileText,
  RotateCcw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function CashFlowPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accs, exps, incs] = await Promise.all([
        fetchBankAccounts(),
        fetchExpenses(),
        fetchIncomes(),
      ]);
      setBankAccounts(accs || []);
      setExpenses(exps || []);
      setIncomes(incs || []);
    } catch (err) {
      console.error("Failed to fetch cash flow:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalInflow = useMemo(() => {
    return incomes.reduce((s, i) => s + (i.amount || 0), 0);
  }, [incomes]);

  const totalOutflow = useMemo(() => {
    return expenses.reduce((s, e) => s + (e.amount || 0), 0);
  }, [expenses]);

  const netCashFlow = totalInflow - totalOutflow;

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Cash Flow</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Real-time Operating Cash Inflow & Outflow</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Print"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={"w-3.5 h-3.5 " + (loading ? "animate-spin text-[#FE9F43]" : "")} />
            </button>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Cash Inflow (Revenue)</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-emerald-600 mt-2">+฿{totalInflow.toLocaleString()}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Cash Outflow (Expenses)</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-lg font-bold text-rose-600 mt-2">-฿{totalOutflow.toLocaleString()}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Net Operating Cash Flow</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-[#FE9F43]">YTD</span>
            </div>
            <p className={"text-lg font-bold mt-2 " + (netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600")}>
              ฿{netCashFlow.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

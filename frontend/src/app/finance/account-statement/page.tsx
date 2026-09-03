"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BankAccount, Expense, Income } from "@/types";
import { fetchBankAccounts, fetchExpenses, fetchIncomes } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Building2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface StatementRow {
  id: string;
  referenceNumber: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: "Credit" | "Debit";
  balanceAfter: number;
}

export default function AccountStatementPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
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
      if (accs && accs.length > 0) {
        setSelectedAccountId(accs[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch statement data:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = useMemo(() => {
    return bankAccounts.find((a) => a.id === selectedAccountId);
  }, [bankAccounts, selectedAccountId]);

  const statementRows = useMemo(() => {
    const list: StatementRow[] = [];
    let runningBalance = selectedAccount ? selectedAccount.balance : 0;

    // Map Incomes (Credits)
    incomes.forEach((inc) => {
      list.push({
        id: inc.id,
        referenceNumber: inc.reference,
        date: inc.date,
        category: inc.categoryName,
        description: inc.incomeName || "Revenue Received",
        amount: inc.amount,
        type: "Credit",
        balanceAfter: runningBalance,
      });
    });

    // Map Expenses (Debits)
    expenses.forEach((exp) => {
      list.push({
        id: exp.id,
        referenceNumber: exp.reference,
        date: exp.date,
        category: exp.categoryName,
        description: exp.expenseName,
        amount: exp.amount,
        type: "Debit",
        balanceAfter: runningBalance,
      });
    });

    // Sort descending by date
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [incomes, expenses, selectedAccount]);

  const exportCSV = () => {
    const headers = ["Reference,Date,Category,Description,Amount,Type,Balance"];
    const rows = statementRows.map(
      (r) =>
        '"' + r.referenceNumber + '","' + r.date + '","' + r.category + '","' + r.description + '","' + r.amount + '","' + r.type + '","' + r.balanceAfter + '"'
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "account_statement_" + new Date().toISOString().split("T")[0] + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Account Statement</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Real-time Bank Account Ledger & Statements</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Export PDF / Print"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            <button
              title="Export CSV"
              onClick={exportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
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

        {/* Account Selector Card */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-80 space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Select Bank Account</label>
              <SearchableSelect
                placeholder="Select Account"
                value={selectedAccountId}
                onChange={(val) => setSelectedAccountId(val)}
                options={bankAccounts.map((a) => ({
                  value: a.id,
                  label: a.bankName + " - " + a.accountNumber + " (" + a.accountName + ")",
                }))}
              />
            </div>

            {selectedAccount && (
              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-[11px] text-gray-500 block">Bank & Branch</span>
                  <span className="text-xs font-bold text-gray-900">{selectedAccount.bankName} ({selectedAccount.branch || "Main"})</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block">Current Balance</span>
                  <span className="text-sm font-bold text-emerald-600">฿{selectedAccount.balance.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statement Table */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5">
          <div className="overflow-x-auto min-h-[300px] -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Description</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Type</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading statement...</span>
                      </div>
                    </td>
                  </tr>
                ) : statementRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#9CA3AF]">
                      No transactions found for this account
                    </td>
                  </tr>
                ) : (
                  statementRows.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1E293B]">
                        {r.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#4B5563]">{r.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-gray-700">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#111827] font-medium">
                        {r.description}
                      </td>
                      <td className={"py-3.5 px-4 font-bold " + (r.type === "Credit" ? "text-emerald-600" : "text-rose-600")}>
                        {r.type === "Credit" ? "+" : "-"}฿{r.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={"inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold " + (r.type === "Credit" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200")}>
                          {r.type === "Credit" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{r.type}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        ฿{r.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

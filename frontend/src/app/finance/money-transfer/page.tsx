"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MoneyTransfer, BankAccount } from "@/types";
import {
  fetchMoneyTransfers,
  createMoneyTransferApi,
  fetchBankAccounts,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ArrowRightLeft,
  X,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export default function MoneyTransferPage() {
  const [transfers, setTransfers] = useState<MoneyTransfer[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trfData, accData] = await Promise.all([
        fetchMoneyTransfers(),
        fetchBankAccounts(),
      ]);
      setTransfers(trfData || []);
      setBankAccounts(accData || []);
      if (accData && accData.length >= 2) {
        setFromAccountId(accData[0].id);
        setToAccountId(accData[1].id);
      }
    } catch (err) {
      console.error("Failed to fetch money transfers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Invalid Accounts",
        message: "Source and Destination accounts must be different.",
      });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Invalid Amount",
        message: "Please enter a valid transfer amount.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createMoneyTransferApi({
        fromAccountId,
        toAccountId,
        amount: Number(amount),
        date,
        notes,
      });

      setShowModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Transfer Completed!",
        message: "Successfully transferred ฿" + Number(amount).toLocaleString(),
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Transfer Failed",
        message: err.message || "Failed to execute transfer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisplay = useMemo(() => {
    return transfers.filter((item) => {
      const fromName = item.fromAccount?.accountName || "";
      const toName = item.toAccount?.accountName || "";
      return (
        item.reference.toLowerCase().includes(search.toLowerCase()) ||
        fromName.toLowerCase().includes(search.toLowerCase()) ||
        toName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [transfers, search]);

  const totalPages = Math.ceil(filteredDisplay.length / pageSize) || 1;
  const paginatedTransfers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDisplay.slice(start, start + pageSize);
  }, [filteredDisplay, currentPage, pageSize]);

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Money Transfer</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Transfer Funds Between Bank Accounts & Registers</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={"w-3.5 h-3.5 " + (loading ? "animate-spin text-[#FE9F43]" : "")} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Transfer Money</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search transfer reference, account..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px] -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">From Account</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">To Account</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading transfers...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#9CA3AF]">
                      No money transfers recorded yet
                    </td>
                  </tr>
                ) : (
                  paginatedTransfers.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4 text-[#1E293B] font-bold font-mono">
                        {item.reference}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-rose-600">
                        {item.fromAccount?.accountName || "Source Account"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">
                        {item.toAccount?.accountName || "Target Account"}
                      </td>
                      <td className="py-3.5 px-4 text-[#4B5563]">{item.date}</td>
                      <td className="py-3.5 px-4 font-bold text-[#111827]">
                        ฿{item.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7280]">
                        {item.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#F1F3F5] text-xs text-[#6B7280]">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E5E7EB] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span>entries (Total {filteredDisplay.length})</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span className="px-3 py-1 bg-[#FE9F43] text-white rounded font-bold">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Transfer Money</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">From Account (Source) *</label>
                  <SearchableSelect
                    placeholder="Select Source Account"
                    value={fromAccountId}
                    onChange={(val) => setFromAccountId(val)}
                    options={bankAccounts.map((a) => ({
                      value: a.id,
                      label: a.accountName + " (Bal: ฿" + a.balance.toLocaleString() + ")",
                    }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">To Account (Destination) *</label>
                  <SearchableSelect
                    placeholder="Select Destination Account"
                    value={toAccountId}
                    onChange={(val) => setToAccountId(val)}
                    options={bankAccounts.map((a) => ({
                      value: a.id,
                      label: a.accountName + " (Bal: ฿" + a.balance.toLocaleString() + ")",
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Amount (฿) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Monthly transfer for operations"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white font-bold rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Transferring..." : "Execute Transfer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center animate-in fade-in zoom-in duration-150 border border-gray-100">
              {feedbackModal.type === "add_success" && (
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "error" && (
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feedbackModal.message}</p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                  className="px-6 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

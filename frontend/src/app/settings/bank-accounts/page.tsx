"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  Landmark,
  PlusCircle,
  Search,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  QrCode,
  Building2,
} from "lucide-react";
import {
  BankAccount,
} from "@/types";
import {
  fetchBankAccounts,
  createBankAccountApi,
  updateBankAccountApi,
  deleteBankAccountApi,
} from "@/lib/api";

const THAI_BANKS = [
  { code: "KBANK", name: "Kasikornbank (KBANK)", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { code: "SCB", name: "Siam Commercial Bank (SCB)", color: "text-purple-600 bg-purple-50 border-purple-200" },
  { code: "BBL", name: "Bangkok Bank (BBL)", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { code: "KTB", name: "Krungthai Bank (KTB)", color: "text-sky-600 bg-sky-50 border-sky-200" },
  { code: "BAY", name: "Bank of Ayudhya (Krungsri)", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { code: "TTB", name: "TMBThanachart Bank (ttb)", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { code: "GSB", name: "Government Savings Bank (GSB)", color: "text-pink-600 bg-pink-50 border-pink-200" },
  { code: "PROMPTPAY", name: "PromptPay (พร้อมเพย์)", color: "text-blue-800 bg-blue-100 border-blue-300" },
];

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type ModalMode = "add" | "edit" | "view" | null;
type FeedbackType = "add" | "edit" | "delete-confirm" | "delete-success" | "error" | null;

const EMPTY_FORM = {
  accountName: "",
  accountNumber: "",
  bankName: "Kasikornbank (KBANK)",
  branch: "",
  balance: "0",
  status: "ACTIVE",
};

export default function BankAccountsSettingsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bankFilter, setBankFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Feedback modals
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBankAccounts();
      setAccounts(data);
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to load bank accounts");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // ─── Filter & Paginate ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        acc.accountName.toLowerCase().includes(search.toLowerCase()) ||
        acc.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
        acc.bankName.toLowerCase().includes(search.toLowerCase()) ||
        (acc.branch && acc.branch.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "All" || acc.status === statusFilter;
      const matchBank = bankFilter === "All" || acc.bankName === bankFilter;
      return matchSearch && matchStatus && matchBank;
    });
  }, [accounts, search, statusFilter, bankFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  // ─── Modal Helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setSelectedAccount(null);
    setModalMode("add");
  };

  const openEdit = (acc: BankAccount) => {
    setForm({
      accountName: acc.accountName,
      accountNumber: acc.accountNumber,
      bankName: acc.bankName,
      branch: acc.branch || "",
      balance: acc.balance.toString(),
      status: acc.status,
    });
    setSelectedAccount(acc);
    setModalMode("edit");
  };

  const openView = (acc: BankAccount) => {
    setSelectedAccount(acc);
    setModalMode("view");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedAccount(null);
  };

  // ─── CRUD Actions ──────────────────────────────────────────────────────────
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.accountName.trim() || !form.accountNumber.trim() || !form.bankName.trim()) {
      setFeedbackError("Account Name, Account Number, and Bank Name are required.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "add") {
        const created = await createBankAccountApi({
          accountName: form.accountName.trim(),
          accountNumber: form.accountNumber.trim(),
          bankName: form.bankName.trim(),
          branch: form.branch.trim() || undefined,
          balance: parseFloat(form.balance) || 0,
        });
        await loadAccounts();
        closeModal();
        setFeedbackName(`${created.accountName} (${created.accountNumber})`);
        setFeedbackType("add");
      } else if (modalMode === "edit" && selectedAccount) {
        await updateBankAccountApi(selectedAccount.id, {
          accountName: form.accountName.trim(),
          accountNumber: form.accountNumber.trim(),
          bankName: form.bankName.trim(),
          branch: form.branch.trim() || undefined,
          balance: parseFloat(form.balance) || 0,
          status: form.status,
        });
        await loadAccounts();
        closeModal();
        setFeedbackName(form.accountName.trim());
        setFeedbackType("edit");
      }
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to save bank account");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (acc: BankAccount) => {
    setAccountToDelete(acc);
    setFeedbackName(`${acc.accountName} (${acc.accountNumber})`);
    setFeedbackType("delete-confirm");
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    try {
      await deleteBankAccountApi(accountToDelete.id);
      await loadAccounts();
      setFeedbackType("delete-success");
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to delete bank account");
      setFeedbackType("error");
    } finally {
      setAccountToDelete(null);
    }
  };

  // ─── CSV Export ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ["Account Name", "Account Number", "Bank Name", "Branch", "Balance", "Status", "Created"];
    const rows = filtered.map((a) => [
      `"${a.accountName}"`,
      `"${a.accountNumber}"`,
      `"${a.bankName}"`,
      `"${a.branch || "-"}"`,
      a.balance.toFixed(2),
      a.status,
      a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "-",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bank_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper Bank Tag
  const getBankBadge = (bankName: string) => {
    const isPromptPay = bankName.toLowerCase().includes("promptpay");
    if (isPromptPay) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200">
          <QrCode className="w-3 h-3" />
          PromptPay
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#1E293B] bg-gray-50 border border-gray-200">
        <Building2 className="w-3 h-3 text-[#64748B]" />
        {bankName}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage store bank accounts and PromptPay receive channels</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadAccounts}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: Bank Accounts */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            {/* Panel Header */}
            <div className="p-5 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-[#FE9F43]" />
                <h2 className="text-sm font-bold text-[#1E293B]">Bank & PromptPay Accounts</h2>
              </div>

              <button
                type="button"
                onClick={openAdd}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Bank Account</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-[#F1F3F5] flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search account, number, bank..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-8 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43] w-56"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Bank Filter */}
                <select
                  value={bankFilter}
                  onChange={(e) => {
                    setBankFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All Banks</option>
                  {THAI_BANKS.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>

                {/* Page Size */}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s} / page
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>

            {/* Table (GEMINI.md Order: View -> Edit -> Delete) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="border-b border-[#F1F3F5] bg-[#F8F9FA]/70">
                  <tr>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Account Name</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Account / PromptPay No.</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Bank Provider</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Branch</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827] text-right">Balance</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Status</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">
                        Loading bank accounts...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#94A3B8] text-xs">
                        No bank accounts found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((acc) => (
                      <tr key={acc.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-[#1E293B]">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-[#64748B]" />
                            {acc.accountName}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-[#1E293B]">
                          {acc.accountNumber}
                        </td>
                        <td className="py-3.5 px-5">{getBankBadge(acc.bankName)}</td>
                        <td className="py-3.5 px-5 text-[#64748B]">{acc.branch || "-"}</td>
                        <td className="py-3.5 px-5 text-right font-bold text-[#1E293B]">
                          ฿{acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              acc.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {acc.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* 1. View (Eye) */}
                            <button
                              type="button"
                              onClick={() => openView(acc)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
                              title="View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {/* 2. Edit (Edit) */}
                            <button
                              type="button"
                              onClick={() => openEdit(acc)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-[#FE9F43] hover:border-[#FE9F43] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {/* 3. Delete (Trash2) */}
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(acc)}
                              className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#F1F3F5] flex items-center justify-between text-xs text-[#64748B]">
              <span>
                Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} accounts
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-[#E2E8F0] rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-[#E2E8F0] rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Add / Edit / View Modal ─────────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#FE9F43]" />
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {modalMode === "add"
                    ? "Add New Bank Account"
                    : modalMode === "edit"
                    ? "Edit Bank Account"
                    : "Bank Account Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {modalMode === "view" && selectedAccount ? (
                <div className="space-y-3 text-xs">
                  {[
                    ["Account Name", selectedAccount.accountName],
                    ["Account Number / PromptPay", selectedAccount.accountNumber],
                    ["Bank Name", selectedAccount.bankName],
                    ["Branch", selectedAccount.branch || "-"],
                    ["Balance", `฿${selectedAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
                    ["Status", selectedAccount.status],
                    ["Created At", selectedAccount.createdAt ? new Date(selectedAccount.createdAt).toLocaleString() : "-"],
                    ["Updated At", selectedAccount.updatedAt ? new Date(selectedAccount.updatedAt).toLocaleString() : "-"],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center py-2 border-b border-[#F8F9FA] last:border-0"
                    >
                      <span className="text-[#64748B] font-medium">{label}</span>
                      <span className="text-[#1E293B] font-semibold text-right max-w-[60%] font-mono">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  {/* Bank Name Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#374151]">
                      Bank Provider / Method <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                    >
                      <option value="">Select Bank...</option>
                      {THAI_BANKS.map((b) => (
                        <option key={b.code} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Account Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#374151]">
                      Account Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.accountName}
                      onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                      placeholder="e.g. ABC POS Retail Co., Ltd."
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#374151]">
                      Account Number / PromptPay ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.accountNumber}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      placeholder="e.g. 012-3-45678-9 or Tax ID"
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Branch & Balance */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Branch</label>
                      <input
                        type="text"
                        value={form.branch}
                        onChange={(e) => setForm({ ...form, branch: e.target.value })}
                        placeholder="e.g. Sukhumvit"
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Opening Balance</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.balance}
                        onChange={(e) => setForm({ ...form, balance: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  {modalMode === "edit" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#374151]">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#F1F3F5] bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-bold text-[#374151] border border-[#E2E8F0] rounded-lg hover:bg-white cursor-pointer"
              >
                {modalMode === "view" ? "Close" : "Cancel"}
              </button>
              {modalMode !== "view" && (
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "add"
                    ? "Create Account"
                    : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Feedback Modals (GEMINI.md Standards) ────────────────────────────── */}
      {/* 1. Add Success Modal (Emerald Sparkles) */}
      {feedbackType === "add" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Bank Account Created!</h3>
              <p className="text-xs text-[#64748B] mt-1">
                <span className="font-semibold">{feedbackName}</span> has been added successfully.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackType(null);
                  openAdd();
                }}
                className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                + Add Another
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType(null)}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Success Modal (Blue CheckCircle2) */}
      {feedbackType === "edit" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Bank Account Updated!</h3>
              <p className="text-xs text-[#64748B] mt-1">
                <span className="font-semibold">{feedbackName}</span> has been updated successfully.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 3. Delete Confirm Modal (Rose Trash2) */}
      {feedbackType === "delete-confirm" && accountToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Delete Bank Account?</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Are you sure you want to delete <span className="font-semibold">{feedbackName}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackType(null);
                  setAccountToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Success Modal (Amber Trash2) */}
      {feedbackType === "delete-success" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Bank Account Deleted!</h3>
              <p className="text-xs text-[#64748B] mt-1">The bank account has been deleted successfully.</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 5. Error Modal (Rose AlertTriangle) */}
      {feedbackType === "error" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Operation Failed</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackError}</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

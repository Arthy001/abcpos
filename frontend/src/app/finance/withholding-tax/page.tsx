"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WithholdingTax } from "@/types";
import {
  fetchWithholdingTaxes,
  createWithholdingTaxApi,
  updateWithholdingTaxApi,
  deleteWithholdingTaxApi,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  Receipt,
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Building2,
  User,
} from "lucide-react";

export default function WithholdingTaxPage() {
  const [records, setRecords] = useState<WithholdingTax[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [formTypeFilter, setFormTypeFilter] = useState<string>("all");
  const [incomeTypeFilter, setIncomeTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<WithholdingTax | null>(null);
  const [viewRecord, setViewRecord] = useState<WithholdingTax | null>(null);
  const [printCertificate, setPrintCertificate] = useState<WithholdingTax | null>(null);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<WithholdingTax | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Feedback Modals
  const [addSuccessRecord, setAddSuccessRecord] = useState<WithholdingTax | null>(null);
  const [editSuccessRecord, setEditSuccessRecord] = useState<WithholdingTax | null>(null);
  const [deleteSuccessName, setDeleteSuccessName] = useState<string | null>(null);
  const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<string>("PND53");
  const [payeeType, setPayeeType] = useState<string>("COMPANY");
  const [payeeName, setPayeeName] = useState<string>("");
  const [payeeTaxId, setPayeeTaxId] = useState<string>("");
  const [payeeBranch, setPayeeBranch] = useState<string>("00000");
  const [payeeAddress, setPayeeAddress] = useState<string>("");
  const [incomeType, setIncomeType] = useState<string>("SERVICE");
  const [description, setDescription] = useState<string>("");
  const [baseAmount, setBaseAmount] = useState<string>("");
  const [taxRate, setTaxRate] = useState<string>("3.0");
  const [paymentMethod, setPaymentMethod] = useState<string>("TRANSFER");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchWithholdingTaxes();
      setRecords(data);
    } catch (err: any) {
      console.error(err);
      setErrorModalMsg(err.message || "Failed to load withholding tax records");
    } finally {
      setLoading(false);
    }
  };

  const calculatedTaxAmount = useMemo(() => {
    const base = parseFloat(baseAmount) || 0;
    const rate = parseFloat(taxRate) || 0;
    return Math.round((base * rate) / 100 * 100) / 100;
  }, [baseAmount, taxRate]);

  const calculatedNetPaid = useMemo(() => {
    const base = parseFloat(baseAmount) || 0;
    return Math.round((base - calculatedTaxAmount) * 100) / 100;
  }, [baseAmount, calculatedTaxAmount]);

  const resetForm = () => {
    setEditingRecord(null);
    setFormType("PND53");
    setPayeeType("COMPANY");
    setPayeeName("");
    setPayeeTaxId("");
    setPayeeBranch("00000");
    setPayeeAddress("");
    setIncomeType("SERVICE");
    setDescription("");
    setBaseAmount("");
    setTaxRate("3.0");
    setPaymentMethod("TRANSFER");
    setNotes("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (r: WithholdingTax) => {
    setEditingRecord(r);
    setFormType(r.formType);
    setPayeeType(r.payeeType);
    setPayeeName(r.payeeName);
    setPayeeTaxId(r.payeeTaxId || "");
    setPayeeBranch(r.payeeBranch || "00000");
    setPayeeAddress(r.payeeAddress || "");
    setIncomeType(r.incomeType);
    setDescription(r.description);
    setBaseAmount(String(r.baseAmount));
    setTaxRate(String(r.taxRate));
    setPaymentMethod(r.paymentMethod || "TRANSFER");
    setNotes(r.notes || "");
    setShowModal(true);
  };

  const handleIncomeTypeChange = (type: string) => {
    setIncomeType(type);
    if (type === "TRANSPORT") setTaxRate("1.0");
    else if (type === "AD") setTaxRate("2.0");
    else if (type === "SERVICE") setTaxRate("3.0");
    else if (type === "RENT") setTaxRate("5.0");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeName.trim() || !description.trim() || !(parseFloat(baseAmount) > 0)) {
      setErrorModalMsg("กรุณากรอกชื่อผู้รับเงิน, รายละเอียด และยอดเงินฐานภาษีให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<WithholdingTax> = {
        formType,
        payeeType,
        payeeName: payeeName.trim(),
        payeeTaxId: payeeTaxId.trim() || undefined,
        payeeBranch: payeeBranch.trim() || "00000",
        payeeAddress: payeeAddress.trim() || undefined,
        incomeType,
        description: description.trim(),
        baseAmount: parseFloat(baseAmount),
        taxRate: parseFloat(taxRate),
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      if (editingRecord) {
        const updated = await updateWithholdingTaxApi(editingRecord.id, payload);
        setShowModal(false);
        setEditSuccessRecord(updated);
        loadData();
      } else {
        const created = await createWithholdingTaxApi(payload);
        setShowModal(false);
        setAddSuccessRecord(created);
        loadData();
      }
    } catch (err: any) {
      setErrorModalMsg(err.message || "Failed to save Withholding Tax record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmRecord) return;
    try {
      await deleteWithholdingTaxApi(deleteConfirmRecord.id);
      const name = deleteConfirmRecord.whtNumber;
      setDeleteConfirmRecord(null);
      setDeleteSuccessName(name);
      loadData();
    } catch (err: any) {
      setErrorModalMsg(err.message || "Failed to delete record");
    }
  };

  // Filtered & Paginated Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.whtNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.payeeName.toLowerCase().includes(search.toLowerCase()) ||
        (r.payeeTaxId && r.payeeTaxId.includes(search)) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      const matchForm = formTypeFilter === "all" || r.formType === formTypeFilter;
      const matchIncome = incomeTypeFilter === "all" || r.incomeType === incomeTypeFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchForm && matchIncome && matchStatus;
    });
  }, [records, search, formTypeFilter, incomeTypeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Totals
  const totalBase = useMemo(() => filteredRecords.reduce((sum, r) => sum + r.baseAmount, 0), [filteredRecords]);
  const totalTax = useMemo(() => filteredRecords.reduce((sum, r) => sum + r.taxAmount, 0), [filteredRecords]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["WHT Number", "Form", "Date", "Payee", "Tax ID", "Income Type", "Description", "Base Amount", "Rate %", "Tax Amount", "Net Paid"];
    const rows = filteredRecords.map((r) => [
      r.whtNumber,
      r.formType,
      new Date(r.date).toLocaleDateString("th-TH"),
      `"${r.payeeName}"`,
      r.payeeTaxId || "-",
      r.incomeType,
      `"${r.description}"`,
      r.baseAmount,
      r.taxRate,
      r.taxAmount,
      r.netPaid,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Withholding_Tax_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Receipt className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Withholding Tax (ภาษีหัก ณ ที่จ่าย)</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ออกและจัดพิมพ์หนังสือรับรองการหักภาษี ณ ที่จ่าย (มาตรา 50 ทวิ) พร้อมสรุปนำส่ง ภ.ง.ด. 3 / ภ.ง.ด. 53
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-all"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              Print
            </button>
            <button
              onClick={openCreateModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              + บันทึกหัก ณ ที่จ่าย
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              จำนวนรายการทั้งหมด
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{filteredRecords.length}</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium">
                รายการ
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ฐานภาษีรวม (Total Base)
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ฿{totalBase.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400">ก่อนหักภาษี</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ภาษีหักรวม (Tax Deducted)
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                ฿{totalTax.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full font-medium">
                นำส่งสรรพากร
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่, ผู้รับเงิน, เลขผู้เสียภาษี..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <SearchableSelect
                value={formTypeFilter}
                onChange={(val) => {
                  setFormTypeFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="แบบแสดงรายการ: All"
                options={[
                  { label: "แบบแสดงรายการ: ทั้งหมด", value: "all" },
                  { label: "ภ.ง.ด. 53 (นิติบุคคล)", value: "PND53" },
                  { label: "ภ.ง.ด. 3 (บุคคลธรรมดา)", value: "PND3" },
                ]}
              />
            </div>
            <div>
              <SearchableSelect
                value={incomeTypeFilter}
                onChange={(val) => {
                  setIncomeTypeFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="ประเภทเงินได้: All"
                options={[
                  { label: "ประเภทเงินได้: ทั้งหมด", value: "all" },
                  { label: "ค่าบริการ (3%)", value: "SERVICE" },
                  { label: "ค่าเช่า (5%)", value: "RENT" },
                  { label: "ค่าขนส่ง (1%)", value: "TRANSPORT" },
                  { label: "ค่าโฆษณา (2%)", value: "AD" },
                ]}
              />
            </div>
            <div>
              <SearchableSelect
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="สถานะ: All"
                options={[
                  { label: "สถานะ: ทั้งหมด", value: "all" },
                  { label: "ออกเอกสารแล้ว (ISSUED)", value: "ISSUED" },
                  { label: "ยกเลิก (CANCELLED)", value: "CANCELLED" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">เลขที่เอกสาร</th>
                  <th className="px-4 py-3.5 font-semibold">แบบภาษี</th>
                  <th className="px-4 py-3.5 font-semibold">ผู้รับเงิน / เลขผู้เสียภาษี</th>
                  <th className="px-4 py-3.5 font-semibold">รายละเอียดเงินได้</th>
                  <th className="px-4 py-3.5 font-semibold text-right">ฐานภาษี</th>
                  <th className="px-4 py-3.5 font-semibold text-center">อัตรา</th>
                  <th className="px-4 py-3.5 font-semibold text-right">ภาษีที่หัก</th>
                  <th className="px-4 py-3.5 font-semibold text-right">ยอดจ่ายสุทธิ</th>
                  <th className="px-4 py-3.5 font-semibold text-center">สถานะ</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                      ไม่พบข้อมูลภาษีหัก ณ ที่จ่าย
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {r.whtNumber}
                        <div className="text-xs text-gray-400 font-normal">
                          {new Date(r.date).toLocaleDateString("th-TH")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            r.formType === "PND53"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}
                        >
                          {r.formType === "PND53" ? "ภ.ง.ด. 53" : "ภ.ง.ด. 3"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                          {r.payeeType === "COMPANY" ? (
                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          )}
                          {r.payeeName}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {r.payeeTaxId ? `Tax ID: ${r.payeeTaxId}` : "ไม่ระบุ Tax ID"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-white max-w-[200px] truncate" title={r.description}>
                          {r.description}
                        </div>
                        <span className="text-xs text-gray-400">
                          {r.incomeType === "SERVICE"
                            ? "ค่าบริการ"
                            : r.incomeType === "RENT"
                            ? "ค่าเช่า"
                            : r.incomeType === "TRANSPORT"
                            ? "ค่าขนส่ง"
                            : "ค่าโฆษณา"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        ฿{r.baseAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {r.taxRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        ฿{r.taxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        ฿{r.netPaid.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            r.status === "ISSUED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      {/* Action Buttons Ordering Standard: View -> Edit -> Delete */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPrintCertificate(r)}
                            title="พิมพ์หนังสือรับรอง 50 ทวิ"
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewRecord(r)}
                            title="View"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(r)}
                            title="Edit"
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmRecord(r)}
                            title="Delete"
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>แสดง</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>รายการต่อหน้า (ทั้งหมด {filteredRecords.length} รายการ)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <span className="px-3 py-1 font-semibold text-gray-900 dark:text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Add / Edit Withholding Tax */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingRecord ? "แก้ไขข้อมูลหัก ณ ที่จ่าย" : "บันทึกหัก ณ ที่จ่าย (Withholding Tax)"}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      แบบแสดงรายการภาษี
                    </label>
                    <SearchableSelect
                      value={formType}
                      onChange={(v) => {
                        setFormType(v);
                        if (v === "PND53") setPayeeType("COMPANY");
                        else setPayeeType("INDIVIDUAL");
                      }}
                      options={[
                        { label: "ภ.ง.ด. 53 (ผู้รับเป็นนิติบุคคล / บริษัท)", value: "PND53" },
                        { label: "ภ.ง.ด. 3 (ผู้รับเป็นบุคคลธรรมดา)", value: "PND3" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      ประเภทผู้รับเงิน
                    </label>
                    <SearchableSelect
                      value={payeeType}
                      onChange={(v) => setPayeeType(v)}
                      options={[
                        { label: "นิติบุคคล (บริษัท / หจก.)", value: "COMPANY" },
                        { label: "บุคคลธรรมดา", value: "INDIVIDUAL" },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      ชื่อผู้รับเงิน / ผู้ถูกหัก ณ ที่จ่าย <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น บริษัท ฟาสต์ เฟรท จำกัด หรือ นาย สมศักดิ์ มีสุข"
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      สาขา (00000 = สนญ.)
                    </label>
                    <input
                      type="text"
                      placeholder="00000"
                      value={payeeBranch}
                      onChange={(e) => setPayeeBranch(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      เลขประจำตัวผู้เสียภาษี (13 หลัก)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 0105558012345"
                      value={payeeTaxId}
                      onChange={(e) => setPayeeTaxId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      ที่อยู่ผู้ถูกหักภาษี
                    </label>
                    <input
                      type="text"
                      placeholder="ที่อยู่ตาม ภ.พ.20 หรือบัตรประชาชน"
                      value={payeeAddress}
                      onChange={(e) => setPayeeAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      ประเภทเงินได้
                    </label>
                    <SearchableSelect
                      value={incomeType}
                      onChange={handleIncomeTypeChange}
                      options={[
                        { label: "ค่าบริการ / จ้างทำของ (3%)", value: "SERVICE" },
                        { label: "ค่าเช่าทรัพย์สิน (5%)", value: "RENT" },
                        { label: "ค่าขนส่ง (1%)", value: "TRANSPORT" },
                        { label: "ค่าโฆษณา (2%)", value: "AD" },
                      ]}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      รายละเอียดเงินได้ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ค่าจ้างผลิตบรรจุภัณฑ์, ค่าเช่าอาคารสำนักงาน"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      ฐานเงินได้ก่อนหักภาษี (฿) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      อัตราภาษี (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      ภาษีที่หัก (฿)
                    </label>
                    <div className="px-3 py-2 text-base font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-700">
                      ฿{calculatedTaxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-300">ยอดเงินที่ต้องจ่ายสุทธิ (Net Paid):</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ฿{calculatedNetPaid.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 disabled:opacity-50"
                  >
                    {isSubmitting ? "กำลังบันทึก..." : editingRecord ? "บันทึกการแก้ไข" : "บันทึกออกหนังสือรับรอง"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Details */}
        {viewRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">รายละเอียดภาษีหัก ณ ที่จ่าย</h3>
                  <p className="text-xs text-gray-400 font-mono">{viewRecord.whtNumber}</p>
                </div>
                <button onClick={() => setViewRecord(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">แบบภาษี:</span>
                  <span className="font-semibold">{viewRecord.formType === "PND53" ? "ภ.ง.ด. 53 (นิติบุคคล)" : "ภ.ง.ด. 3 (บุคคลธรรมดา)"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">ผู้รับเงิน:</span>
                  <span className="font-semibold text-right">{viewRecord.payeeName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">เลขประจำตัวผู้เสียภาษี:</span>
                  <span className="font-mono">{viewRecord.payeeTaxId || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">รายละเอียด:</span>
                  <span className="text-right">{viewRecord.description}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">ฐานภาษี:</span>
                  <span className="font-semibold">฿{viewRecord.baseAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">อัตราภาษี:</span>
                  <span>{viewRecord.taxRate}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">ภาษีที่หัก:</span>
                  <span className="font-bold text-rose-600">฿{viewRecord.taxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2 bg-emerald-50 dark:bg-emerald-950/30 px-3 rounded-xl font-bold">
                  <span className="text-emerald-800 dark:text-emerald-300">ยอดจ่ายสุทธิ:</span>
                  <span className="text-emerald-700 dark:text-emerald-400">฿{viewRecord.netPaid.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const r = viewRecord;
                    setViewRecord(null);
                    setPrintCertificate(r);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์ 50 ทวิ
                </button>
                <button
                  onClick={() => setViewRecord(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Print Withholding Tax Certificate (หนังสือรับรอง 50 ทวิ สไตล์พิมพ์ทางการ) */}
        {printCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white text-gray-900 rounded-2xl max-w-3xl w-full p-8 shadow-2xl max-h-[95vh] overflow-y-auto">
              <div className="border border-gray-800 p-6 rounded-lg text-xs font-sans">
                {/* Header */}
                <div className="text-center pb-4 border-b border-gray-400">
                  <h2 className="text-base font-bold tracking-wide">
                    หนังสือรับรองการหักภาษี ณ ที่จ่าย
                  </h2>
                  <p className="text-xs text-gray-600">
                    ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร (ฉบับสำหรับผู้ถูกหักภาษี ณ ที่จ่าย)
                  </p>
                  <div className="mt-2 text-right font-mono text-xs font-bold">
                    เลขที่: {printCertificate.whtNumber} | ยื่นแบบ: {printCertificate.formType === "PND53" ? "ภ.ง.ด. 53" : "ภ.ง.ด. 3"}
                  </div>
                </div>

                {/* Payer */}
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-bold text-gray-800">ผู้มีหน้าที่หักภาษี ณ ที่จ่าย (ผู้จ่ายเงิน):</div>
                  <div className="mt-1 font-semibold">{printCertificate.payerName}</div>
                  <div>เลขประจำตัวผู้เสียภาษีอากร: <span className="font-mono font-bold">{printCertificate.payerTaxId}</span></div>
                  <div>ที่อยู่: {printCertificate.payerAddress}</div>
                </div>

                {/* Payee */}
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-bold text-gray-800">ผู้ถูกหักภาษี ณ ที่จ่าย (ผู้รับเงิน):</div>
                  <div className="mt-1 font-semibold">{printCertificate.payeeName}</div>
                  <div>เลขประจำตัวผู้เสียภาษีอากร: <span className="font-mono font-bold">{printCertificate.payeeTaxId || "-"}</span> (สาขา: {printCertificate.payeeBranch || "00000"})</div>
                  <div>ที่อยู่: {printCertificate.payeeAddress || "ตามที่ระบุในฐานข้อมูล"}</div>
                </div>

                {/* Table */}
                <table className="w-full mt-4 border border-gray-400 text-left">
                  <thead className="bg-gray-100 border-b border-gray-400 text-[11px] font-bold">
                    <tr>
                      <th className="p-2 border-r border-gray-400">ประเภทเงินได้พึงประเมินที่จ่าย</th>
                      <th className="p-2 border-r border-gray-400 text-center">วัน เดือน ปี ที่จ่าย</th>
                      <th className="p-2 border-r border-gray-400 text-right">จำนวนเงินที่จ่าย</th>
                      <th className="p-2 text-right">ภาษีที่หักและนำส่ง</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 border-r border-gray-400">
                        {printCertificate.description} ({printCertificate.taxRate}%)
                      </td>
                      <td className="p-2 border-r border-gray-400 text-center">
                        {new Date(printCertificate.date).toLocaleDateString("th-TH")}
                      </td>
                      <td className="p-2 border-r border-gray-400 text-right font-mono">
                        ฿{printCertificate.baseAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-rose-600">
                        ฿{printCertificate.taxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={2} className="p-2 border-r border-gray-400 text-right">
                        รวมเงินที่จ่ายและภาษีที่หักนำส่ง:
                      </td>
                      <td className="p-2 border-r border-gray-400 text-right font-mono">
                        ฿{printCertificate.baseAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-mono text-rose-600">
                        ฿{printCertificate.taxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="h-12 border-b border-gray-400 border-dashed"></div>
                    <div className="mt-2 font-medium">ลงชื่อผู้จ่ายเงิน</div>
                    <div className="text-gray-500 text-[10px]">({printCertificate.payerName})</div>
                  </div>
                  <div>
                    <div className="h-12 border-b border-gray-400 border-dashed"></div>
                    <div className="mt-2 font-medium">ประทับตรานิติบุคคล (ถ้ามี)</div>
                    <div className="text-gray-500 text-[10px]">วันที่ {new Date(printCertificate.date).toLocaleDateString("th-TH")}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  สั่งพิมพ์เอกสาร (Print Form)
                </button>
                <button
                  onClick={() => setPrintCertificate(null)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal (Rule standard: Trash2 rose bg-rose-50 text-rose-500) */}
        {deleteConfirmRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">ยืนยันการลบรายการภาษี?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                คุณแน่ใจหรือไม่ว่าต้องการลบรายการ <strong>{deleteConfirmRecord.whtNumber}</strong> ({deleteConfirmRecord.payeeName})?
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmRecord(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-600/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal 1: Add Success Modal (Rule: Sparkles emerald bg-emerald-50 text-emerald-600 with '+ Add Another' & 'Done') */}
        {addSuccessRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Withholding Tax Created!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                บันทึกรายการหัก ณ ที่จ่าย <strong>{addSuccessRecord.whtNumber}</strong> สำเร็จเรียบร้อย
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setAddSuccessRecord(null);
                    openCreateModal();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-xl"
                >
                  + Add Another
                </button>
                <button
                  onClick={() => setAddSuccessRecord(null)}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal 2: Edit Success Modal (Rule: CheckCircle2 blue bg-blue-50 text-blue-600 with 'OK') */}
        {editSuccessRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Withholding Tax Updated!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                อัปเดตข้อมูลรายการ <strong>{editSuccessRecord.whtNumber}</strong> สำเร็จเรียบร้อย
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setEditSuccessRecord(null)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal 3: Delete Success Modal (Rule: Trash2 amber bg-amber-50 text-amber-600 with 'OK') */}
        {deleteSuccessName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deleted Successfully!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                ลบรายการ <strong>{deleteSuccessName}</strong> เรียบร้อยแล้ว
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setDeleteSuccessName(null)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal 4: Error Modal (Rule: AlertTriangle rose bg-rose-50 text-rose-600 with 'OK') */}
        {errorModalMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Operation Failed</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{errorModalMsg}</p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setErrorModalMsg(null)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
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

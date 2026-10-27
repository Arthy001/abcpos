"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TaxInvoice, Customer } from "@/types";
import {
  fetchTaxInvoices,
  createTaxInvoiceApi,
  updateTaxInvoiceApi,
  deleteTaxInvoiceApi,
  fetchCustomers,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  FileCheck,
  PlusCircle,
  Search,
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
  Phone,
  FileText,
} from "lucide-react";

export default function TaxInvoicesPage() {
  const [invoices, setInvoices] = useState<TaxInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingInvoice, setEditingInvoice] = useState<TaxInvoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<TaxInvoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<TaxInvoice | null>(null);
  const [deleteConfirmInvoice, setDeleteConfirmInvoice] = useState<TaxInvoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Feedback Modals
  const [addSuccessInvoice, setAddSuccessInvoice] = useState<TaxInvoice | null>(null);
  const [editSuccessInvoice, setEditSuccessInvoice] = useState<TaxInvoice | null>(null);
  const [deleteSuccessName, setDeleteSuccessName] = useState<string | null>(null);
  const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);

  // Form Fields
  const [saleReference, setSaleReference] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [taxId, setTaxId] = useState<string>("");
  const [branch, setBranch] = useState<string>("00000");
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [subtotal, setSubtotal] = useState<string>("");
  const [vatRate, setVatRate] = useState<string>("7.0");
  const [paymentMethod, setPaymentMethod] = useState<string>("TRANSFER");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    loadData();
    loadCustomers();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchTaxInvoices();
      setInvoices(data);
    } catch (err: any) {
      console.error(err);
      setErrorModalMsg(err.message || "Failed to load tax invoices");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await fetchCustomers();
      setCustomers(res);
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  };

  const calculatedVatAmount = useMemo(() => {
    const sub = parseFloat(subtotal) || 0;
    const rate = parseFloat(vatRate) || 0;
    return Math.round((sub * rate) / 100 * 100) / 100;
  }, [subtotal, vatRate]);

  const calculatedGrandTotal = useMemo(() => {
    const sub = parseFloat(subtotal) || 0;
    return Math.round((sub + calculatedVatAmount) * 100) / 100;
  }, [subtotal, calculatedVatAmount]);

  const resetForm = () => {
    setEditingInvoice(null);
    setSaleReference("");
    setCustomerName("");
    setTaxId("");
    setBranch("00000");
    setAddress("");
    setPhone("");
    setSubtotal("");
    setVatRate("7.0");
    setPaymentMethod("TRANSFER");
    setNotes("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (inv: TaxInvoice) => {
    setEditingInvoice(inv);
    setSaleReference(inv.saleReference || "");
    setCustomerName(inv.customerName);
    setTaxId(inv.taxId);
    setBranch(inv.branch || "00000");
    setAddress(inv.address);
    setPhone(inv.phone || "");
    setSubtotal(String(inv.subtotal));
    setVatRate(String(inv.vatRate));
    setPaymentMethod(inv.paymentMethod || "TRANSFER");
    setNotes(inv.notes || "");
    setShowModal(true);
  };

  const handleSelectCustomer = (selectedName: string) => {
    setCustomerName(selectedName);
    const found = customers.find((c) => c.name === selectedName);
    if (found) {
      if (found.taxId) setTaxId(found.taxId);
      if (found.branchNo) setBranch(found.branchNo);
      if (found.address) setAddress(found.address);
      if (found.phone) setPhone(found.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !taxId.trim() || !(parseFloat(subtotal) > 0)) {
      setErrorModalMsg("กรุณากรอกชื่อลูกค้า, เลขผู้เสียภาษี และยอดเงินก่อนภาษีให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<TaxInvoice> = {
        saleReference: saleReference.trim() || undefined,
        customerName: customerName.trim(),
        taxId: taxId.trim(),
        branch: branch.trim() || "00000",
        address: address.trim() || "กรุงเทพมหานคร",
        phone: phone.trim() || undefined,
        subtotal: parseFloat(subtotal),
        vatRate: parseFloat(vatRate),
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      if (editingInvoice) {
        const updated = await updateTaxInvoiceApi(editingInvoice.id, payload);
        setShowModal(false);
        setEditSuccessInvoice(updated);
        loadData();
      } else {
        const created = await createTaxInvoiceApi(payload);
        setShowModal(false);
        setAddSuccessInvoice(created);
        loadData();
      }
    } catch (err: any) {
      setErrorModalMsg(err.message || "Failed to save Tax Invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmInvoice) return;
    try {
      await deleteTaxInvoiceApi(deleteConfirmInvoice.id);
      const name = deleteConfirmInvoice.invoiceNumber;
      setDeleteConfirmInvoice(null);
      setDeleteSuccessName(name);
      loadData();
    } catch (err: any) {
      setErrorModalMsg(err.message || "Failed to delete tax invoice");
    }
  };

  // Filtered & Paginated Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.taxId.includes(search) ||
        (inv.saleReference && inv.saleReference.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  // Totals
  const totalSubtotal = useMemo(() => filteredInvoices.reduce((sum, i) => sum + i.subtotal, 0), [filteredInvoices]);
  const totalVat = useMemo(() => filteredInvoices.reduce((sum, i) => sum + i.vatAmount, 0), [filteredInvoices]);
  const totalGrand = useMemo(() => filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0), [filteredInvoices]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Tax Invoice No", "Ref Order", "Date", "Customer", "Tax ID", "Branch", "Subtotal", "VAT Rate", "VAT Amount", "Grand Total", "Status"];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.saleReference || "-",
      new Date(inv.date).toLocaleDateString("th-TH"),
      `"${inv.customerName}"`,
      inv.taxId,
      inv.branch,
      inv.subtotal,
      `${inv.vatRate}%`,
      inv.vatAmount,
      inv.grandTotal,
      inv.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tax_Invoices_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <FileCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tax Invoices (ใบกำกับภาษีเต็มรูป / ใบเสร็จรับเงิน)</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ออกใบกำกับภาษีเต็มรูปตามมาตรา 86/4 แห่งประมวลรัษฎากร พร้อมเลขประจำตัวผู้เสียภาษีและสาขา
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              + ออกใบกำกับภาษี
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              มูลค่าก่อนภาษี (Subtotal)
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ฿{totalSubtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400">{filteredInvoices.length} ฉบับ</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ภาษีมูลค่าเพิ่ม (Output VAT 7%)
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ฿{totalVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full font-medium">
                ภาษีขาย
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ยอดรวมสุทธิ (Grand Total)
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ฿{totalGrand.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400">รวม VAT แล้ว</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่ใบกำกับ, ชื่อลูกค้า, เลขประจำตัวผู้เสียภาษี, เลขที่อ้างอิง..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                  <th className="px-4 py-3.5 font-semibold">เลขที่ใบกำกับภาษี</th>
                  <th className="px-4 py-3.5 font-semibold">อ้างอิง Order</th>
                  <th className="px-4 py-3.5 font-semibold">ชื่อลูกค้า / เลขผู้เสียภาษี</th>
                  <th className="px-4 py-3.5 font-semibold">สาขา</th>
                  <th className="px-4 py-3.5 font-semibold text-right">มูลค่าก่อนภาษี</th>
                  <th className="px-4 py-3.5 font-semibold text-right">VAT 7%</th>
                  <th className="px-4 py-3.5 font-semibold text-right">ยอดรวมสุทธิ</th>
                  <th className="px-4 py-3.5 font-semibold text-center">สถานะ</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      กำลังโหลดข้อมูลใบกำกับภาษี...
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      ไม่พบข้อมูลใบกำกับภาษี
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                        {inv.invoiceNumber}
                        <div className="text-xs text-gray-400 font-normal">
                          {new Date(inv.date).toLocaleDateString("th-TH")}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                        {inv.saleReference || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {inv.customerName}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          Tax ID: {inv.taxId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">
                          {inv.branch === "00000" ? "สำนักงานใหญ่" : `สาขา ${inv.branch}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        ฿{inv.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                        ฿{inv.vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ฿{inv.grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === "ISSUED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      {/* Action Buttons: View -> Edit -> Delete */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPrintInvoice(inv)}
                            title="พิมพ์ใบกำกับภาษี / ใบเสร็จรับเงิน"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewInvoice(inv)}
                            title="View"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(inv)}
                            title="Edit"
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmInvoice(inv)}
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
              <span>รายการต่อหน้า (ทั้งหมด {filteredInvoices.length} ฉบับ)</span>
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

        {/* Modal: Add / Edit Tax Invoice */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingInvoice ? "แก้ไขใบกำกับภาษีเต็มรูป" : "ออกใบกำกับภาษีเต็มรูป (Tax Invoice)"}
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
                      เลือกลูกค้าจากฐานข้อมูล (Customer Master)
                    </label>
                    <SearchableSelect
                      value={customerName}
                      onChange={handleSelectCustomer}
                      placeholder="Select Customer..."
                      options={[
                        { label: "เลือกจากลูกค้าในระบบ...", value: "" },
                        ...customers.map((c) => ({ label: `${c.name} (${c.code || "B2B"})`, value: c.name })),
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      อ้างอิงเลขที่คำสั่งซื้อ / Sale Ref
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น SO-202610-001 หรือ SL-849201"
                      value={saleReference}
                      onChange={(e) => setSaleReference(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      ชื่อผู้ซื้อ / บริษัทนิติบุคคล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น บริษัท บรรจุภัณฑ์ไทยแลนด์ จำกัด"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      สาขา (00000 = สนญ.)
                    </label>
                    <input
                      type="text"
                      placeholder="00000"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      เลขประจำตัวผู้เสียภาษี (13 หลัก) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0105559098765"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="text"
                      placeholder="02-888-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    ที่อยู่ตามทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)
                  </label>
                  <input
                    type="text"
                    placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      มูลค่าก่อนภาษี (฿) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={subtotal}
                      onChange={(e) => setSubtotal(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      อัตราภาษี (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      VAT 7% (฿)
                    </label>
                    <div className="px-3 py-2 text-base font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 rounded-xl border border-blue-200 dark:border-blue-700">
                      ฿{calculatedVatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-300">ยอดรวมสุทธิ (Grand Total):</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ฿{calculatedGrandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
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
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/30 disabled:opacity-50"
                  >
                    {isSubmitting ? "กำลังบันทึก..." : editingInvoice ? "บันทึกการแก้ไข" : "ออกใบกำกับภาษี"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Details */}
        {viewInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">รายละเอียดใบกำกับภาษี</h3>
                  <p className="text-xs text-gray-400 font-mono">{viewInvoice.invoiceNumber}</p>
                </div>
                <button onClick={() => setViewInvoice(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">ลูกค้า:</span>
                  <span className="font-semibold text-right">{viewInvoice.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">เลขประจำตัวผู้เสียภาษี:</span>
                  <span className="font-mono">{viewInvoice.taxId} ({viewInvoice.branch === "00000" ? "สำนักงานใหญ่" : `สาขา ${viewInvoice.branch}`})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">ที่อยู่:</span>
                  <span className="text-right text-xs max-w-[250px]">{viewInvoice.address}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">มูลค่าก่อนภาษี:</span>
                  <span className="font-semibold">฿{viewInvoice.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">ภาษีมูลค่าเพิ่ม (VAT {viewInvoice.vatRate}%):</span>
                  <span className="font-bold text-blue-600">฿{viewInvoice.vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2 bg-emerald-50 dark:bg-emerald-950/30 px-3 rounded-xl font-bold">
                  <span className="text-emerald-800 dark:text-emerald-300">ยอดรวมสุทธิ:</span>
                  <span className="text-emerald-700 dark:text-emerald-400">฿{viewInvoice.grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const inv = viewInvoice;
                    setViewInvoice(null);
                    setPrintInvoice(inv);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์ใบกำกับภาษี
                </button>
                <button
                  onClick={() => setViewInvoice(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Print Official Tax Invoice & Receipt (แบบฟอร์มเอกสารภาษีมาตรฐานสรรพากร) */}
        {printInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white text-gray-900 rounded-2xl max-w-3xl w-full p-8 shadow-2xl max-h-[95vh] overflow-y-auto font-sans">
              <div className="border border-gray-800 p-6 rounded-lg text-xs">
                {/* Header Section */}
                <div className="flex justify-between items-start pb-4 border-b border-gray-300">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">บริษัท เอบีซี โพส รีเทล จำกัด</h2>
                    <p className="text-gray-600">88/9 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110</p>
                    <p className="text-gray-600">
                      เลขประจำตัวผู้เสียภาษี: <span className="font-mono font-bold">010556209999</span> (สำนักงานใหญ่)
                    </p>
                    <p className="text-gray-600">โทรศัพท์: 02-123-4567 | อีเมล: accounting@abcpos.com</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-gray-100 border border-gray-300 font-bold text-sm">
                      ใบกำกับภาษี / ใบเสร็จรับเงิน
                    </div>
                    <div className="mt-2 font-mono text-xs">
                      <div>เลขที่: <strong>{printInvoice.invoiceNumber}</strong></div>
                      <div>วันที่: {new Date(printInvoice.date).toLocaleDateString("th-TH")}</div>
                      {printInvoice.saleReference && <div>อ้างอิง: {printInvoice.saleReference}</div>}
                    </div>
                  </div>
                </div>

                {/* Customer Section */}
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="font-bold text-gray-800">ลูกค้า / ผู้ซื้อ:</div>
                  <div className="mt-1 font-semibold text-sm">{printInvoice.customerName}</div>
                  <div>เลขประจำตัวผู้เสียภาษี: <span className="font-mono font-bold">{printInvoice.taxId}</span> ({printInvoice.branch === "00000" ? "สำนักงานใหญ่" : `สาขา ${printInvoice.branch}`})</div>
                  <div>ที่อยู่: {printInvoice.address}</div>
                  {printInvoice.phone && <div>เบอร์โทรศัพท์: {printInvoice.phone}</div>}
                </div>

                {/* Items Table */}
                <table className="w-full mt-4 border border-gray-400 text-left">
                  <thead className="bg-gray-100 border-b border-gray-400 text-[11px] font-bold">
                    <tr>
                      <th className="p-2 border-r border-gray-400 text-center w-12">ลำดับ</th>
                      <th className="p-2 border-r border-gray-400">รายการสินค้า / บริการ</th>
                      <th className="p-2 border-r border-gray-400 text-center w-20">จำนวน</th>
                      <th className="p-2 border-r border-gray-400 text-right w-24">ราคา/หน่วย</th>
                      <th className="p-2 text-right w-28">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 border-r border-gray-400 text-center">1</td>
                      <td className="p-2 border-r border-gray-400">
                        {printInvoice.notes || "สินค้าและผลิตภัณฑ์บรรจุภัณฑ์ตามคำสั่งซื้อ"}
                      </td>
                      <td className="p-2 border-r border-gray-400 text-center">1</td>
                      <td className="p-2 border-r border-gray-400 text-right font-mono">
                        ฿{printInvoice.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-mono">
                        ฿{printInvoice.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="h-16">
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td className="border-r border-gray-400"></td>
                      <td></td>
                    </tr>
                    <tr className="border-t border-gray-400">
                      <td colSpan={3} className="p-2 border-r border-gray-400 text-xs italic text-gray-500">
                        การชำระเงิน: {printInvoice.paymentMethod}
                      </td>
                      <td className="p-2 border-r border-gray-400 text-right font-semibold">รวมมูลค่าสินค้า:</td>
                      <td className="p-2 text-right font-mono font-semibold">
                        ฿{printInvoice.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="border-r border-gray-400"></td>
                      <td className="p-2 border-r border-gray-400 text-right font-semibold">ภาษีมูลค่าเพิ่ม 7%:</td>
                      <td className="p-2 text-right font-mono font-semibold text-blue-600">
                        ฿{printInvoice.vatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-gray-100 font-bold border-t border-gray-400">
                      <td colSpan={3} className="p-2 border-r border-gray-400"></td>
                      <td className="p-2 border-r border-gray-400 text-right">จำนวนเงินรวมทั้งสิ้น:</td>
                      <td className="p-2 text-right font-mono text-emerald-700 text-sm">
                        ฿{printInvoice.grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="h-12 border-b border-gray-400 border-dashed"></div>
                    <div className="mt-2 font-medium">ผู้รับของ / ผู้มีอำนาจลงนาม</div>
                    <div className="text-gray-500 text-[10px]">วันที่ ......./......./...........</div>
                  </div>
                  <div>
                    <div className="h-12 border-b border-gray-400 border-dashed"></div>
                    <div className="mt-2 font-medium">ผู้รับเงิน / ผู้มีอำนาจลงนาม</div>
                    <div className="text-gray-500 text-[10px]">(บริษัท เอบีซี โพส รีเทล จำกัด)</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  สั่งพิมพ์ใบกำกับภาษี (Print Tax Invoice)
                </button>
                <button
                  onClick={() => setPrintInvoice(null)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal (Rule: Trash2 rose bg-rose-50 text-rose-500) */}
        {deleteConfirmInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">ยืนยันการลบใบกำกับภาษี?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                คุณแน่ใจหรือไม่ว่าต้องการลบใบกำกับภาษี <strong>{deleteConfirmInvoice.invoiceNumber}</strong> ({deleteConfirmInvoice.customerName})?
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmInvoice(null)}
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

        {/* Feedback Modal 1: Add Success Modal */}
        {addSuccessInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tax Invoice Created!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                ออกใบกำกับภาษีเลขที่ <strong>{addSuccessInvoice.invoiceNumber}</strong> สำเร็จเรียบร้อย
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setAddSuccessInvoice(null);
                    openCreateModal();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-xl"
                >
                  + Add Another
                </button>
                <button
                  onClick={() => setAddSuccessInvoice(null)}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal 2: Edit Success Modal */}
        {editSuccessInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tax Invoice Updated!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                อัปเดตข้อมูลใบกำกับภาษี <strong>{editSuccessInvoice.invoiceNumber}</strong> สำเร็จเรียบร้อย
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setEditSuccessInvoice(null)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal 3: Delete Success Modal */}
        {deleteSuccessName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deleted Successfully!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                ลบใบกำกับภาษี <strong>{deleteSuccessName}</strong> เรียบร้อยแล้ว
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

        {/* Feedback Modal 4: Error Modal */}
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

"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AccountantExportData } from "@/types";
import { fetchAccountantExportPackage } from "@/lib/api";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  Receipt,
  Package,
  Layers,
  ArrowRight,
  Loader2,
  DollarSign,
  Scale,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function AccountantHubPage() {
  const [data, setData] = useState<AccountantExportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [activeTab, setActiveTab] = useState<"summary" | "salesVat" | "purchaseVat" | "wht" | "inventory">("summary");
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAccountantExportPackage(period);
      setData(res);
    } catch (err) {
      console.error("Failed to load accountant export package:", err);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary;

  // 1. Export Sales VAT Report
  const exportSalesVatCSV = () => {
    if (!data) return;
    const headers = ["ลำดับ", "วันที่", "เลขที่เอกสาร", "ชื่อลูกค้า/ผู้ซื้อ", "มูลค่าสินค้าก่อนภาษี", "ภาษีมูลค่าเพิ่ม 7%", "ยอดรวมสุทธิ"];
    const rows = data.salesVatItems.map((item, idx) => [
      idx + 1,
      new Date(item.date).toLocaleDateString("th-TH"),
      item.reference,
      `"${item.customer}"`,
      item.subtotal,
      item.tax,
      item.total,
    ]);
    downloadCSV(`รายงานภาษีขาย_${period}.csv`, [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));
  };

  // 2. Export Purchase VAT Report
  const exportPurchaseVatCSV = () => {
    if (!data) return;
    const headers = ["ลำดับ", "วันที่", "เลขที่ใบกำกับภาษี", "ชื่อผู้ขาย/ซัพพลายเออร์", "มูลค่าสินค้าก่อนภาษี", "ภาษีมูลค่าเพิ่ม 7%", "ยอดรวมสุทธิ"];
    const rows = data.purchaseVatItems.map((item, idx) => [
      idx + 1,
      new Date(item.date).toLocaleDateString("th-TH"),
      item.reference,
      `"${item.supplier}"`,
      item.subtotal,
      item.tax,
      item.total,
    ]);
    downloadCSV(`รายงานภาษีซื้อ_${period}.csv`, [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));
  };

  // 3. Export WHT Report
  const exportWhtCSV = () => {
    if (!data) return;
    const headers = ["เลขที่หนังสือรับรอง", "แบบภาษี", "วันที่", "ผู้ถูกหักภาษี", "เลขประจำตัวผู้เสียภาษี", "รายการ", "ฐานภาษี", "อัตรา %", "ภาษีที่หัก", "ยอดจ่ายสุทธิ"];
    const rows = data.withholdingTaxItems.map((w) => [
      w.whtNumber,
      w.formType,
      new Date(w.date).toLocaleDateString("th-TH"),
      `"${w.payeeName}"`,
      w.payeeTaxId || "-",
      `"${w.description}"`,
      w.baseAmount,
      w.taxRate,
      w.taxAmount,
      w.netPaid,
    ]);
    downloadCSV(`รายงานภาษีหักณที่จ่าย_${period}.csv`, [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));
  };

  // 4. Export Inventory Valuation
  const exportInventoryCSV = () => {
    if (!data) return;
    const headers = ["รหัสสินค้า", "ชื่อสินค้า/วัตถุดิบ", "หมวดหมู่", "ยอดคงเหลือปลายงวด", "ต้นทุนต่อหน่วย (บาท)", "มูลค่าคงเหลือรวม (บาท)"];
    const rows = data.inventoryValuation.map((p) => [
      p.code,
      `"${p.name}"`,
      `"${p.category}"`,
      p.stock,
      p.unitCost,
      p.totalValue,
    ]);
    downloadCSV(`รายงานสินค้าและวัตถุดิบคงเหลือปลายงวด_${period}.csv`, [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));
  };

  // Helper download function
  const downloadCSV = (filename: string, content: string) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + content;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccessMsg(`ส่งออกไฟล์ ${filename} สำเร็จ`);
  };

  // Export Complete Package (All-in-one text summary + individual CSVs)
  const exportCompletePackage = () => {
    exportSalesVatCSV();
    setTimeout(() => exportPurchaseVatCSV(), 300);
    setTimeout(() => exportWhtCSV(), 600);
    setTimeout(() => exportInventoryCSV(), 900);
    setDownloadSuccessMsg(`ส่งออกชุดไฟล์บัญชีครบ 4 รายงาน ประจำเดือน ${period} เรียบร้อยแล้ว`);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Accountant Export Hub (ศูนย์ส่งข้อมูลสำนักงานบัญชี)</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              รวบรวมรายงานภาษีซื้อ, ภาษีขาย, ภาษีหัก ณ ที่จ่าย และมูลค่าสต็อกปลายงวด พร้อมส่งต่อนักบัญชีในคลิกเดียว
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-900 dark:text-white outline-none"
              />
            </div>
            <button
              onClick={exportCompletePackage}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Full Package (4 ไฟล์)
            </button>
          </div>
        </div>

        {/* Financial Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              ภาษีขายสุทธิ (Output VAT)
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-600">
              ฿{(summary?.totalOutputVat || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              จากยอดขาย ฿{(summary?.totalSalesRevenue || 0).toLocaleString("th-TH", { minimumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              ภาษีซื้อสุทธิ (Input VAT)
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">
              ฿{(summary?.totalInputVat || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              จากยอดจัดซื้อ ฿{(summary?.totalPurchaseCost || 0).toLocaleString("th-TH", { minimumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              ภาษีมูลค่าเพิ่มที่ต้องนำส่ง (ภ.พ.30)
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-600">
              ฿{(summary?.netVatPayable || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1">ภาษีขาย - ภาษีซื้อ</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              มูลค่าสต็อกคงเหลือปลายงวด
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-600">
              ฿{(summary?.totalInventoryValue || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1">สินค้าสำเร็จรูปและวัตถุดิบ</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 gap-2">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "summary"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            ภาพรวม & สรุปตัวเลขนำส่ง
          </button>
          <button
            onClick={() => setActiveTab("salesVat")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "salesVat"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            รายงานภาษีขาย ({data?.salesVatItems.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("purchaseVat")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "purchaseVat"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            รายงานภาษีซื้อ ({data?.purchaseVatItems.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("wht")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "wht"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            ภาษีหัก ณ ที่จ่าย ({data?.withholdingTaxItems.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "inventory"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            สต็อกคงเหลือปลายงวด ({data?.inventoryValuation.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center text-gray-500 border border-gray-100 dark:border-gray-700">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
            กำลังรวบรวมชุดข้อมูลบัญชี...
          </div>
        ) : !data ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center text-gray-400 border border-gray-100 dark:border-gray-700">
            ไม่พบข้อมูล
          </div>
        ) : (
          <div>
            {/* TAB 1: SUMMARY / COVER SHEET */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-start pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        ใบปะหน้าสรุปข้อมูลบัญชีและภาษีประจำงวด (Accountant Cover Sheet)
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        บริษัท เอบีซี โพส รีเทล จำกัด (เลขผู้เสียภาษี 010556209999) | งวดเดือน: {period}
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      พิมพ์สรุป
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Tax Section */}
                    <div className="space-y-3 bg-gray-50/50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-indigo-600" />
                        1. สรุปภาษีมูลค่าเพิ่ม (ภ.พ. 30)
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>ยอดขายรวมทั้งสิ้น:</span>
                        <span className="font-medium">฿{summary?.totalSalesRevenue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>ภาษีขาย (Output VAT 7%):</span>
                        <span className="font-semibold text-blue-600">฿{summary?.totalOutputVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>ยอดจัดซื้อรวมทั้งสิ้น:</span>
                        <span className="font-medium">฿{summary?.totalPurchaseCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>ภาษีซื้อ (Input VAT 7%):</span>
                        <span className="font-semibold text-emerald-600">฿{summary?.totalInputVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between font-bold">
                        <span className="text-gray-900 dark:text-white">ภาษีมูลค่าเพิ่มสุทธิที่ต้องนำส่ง:</span>
                        <span className="text-rose-600">฿{summary?.netVatPayable.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* WHT & Assets Section */}
                    <div className="space-y-3 bg-gray-50/50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Scale className="w-4 h-4 text-purple-600" />
                        2. ภาษีหัก ณ ที่จ่าย และ สินทรัพย์คงเหลือ
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>ฐานภาษีหัก ณ ที่จ่าย (WHT Base):</span>
                        <span className="font-medium">฿{summary?.totalWhtBase.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>ภาษีหัก ณ ที่จ่ายนำส่ง (ภ.ง.ด.3/53):</span>
                        <span className="font-semibold text-rose-600">฿{summary?.totalWhtDeducted.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>มูลค่าสินค้าและวัตถุดิบคงเหลือ (Inventory):</span>
                        <span className="font-semibold text-purple-600">฿{summary?.totalInventoryValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>ยอดเงินในบัญชีธนาคาร (Bank Balance):</span>
                        <span className="font-semibold text-emerald-600">฿{summary?.totalBankBalance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between font-bold">
                        <span>ลูกหนี้การค้าคงค้าง (AR):</span>
                        <span className="text-blue-600">฿{summary?.accountsReceivable.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={exportSalesVatCSV}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      1. โหลดรายงานภาษีขาย
                    </button>
                    <button
                      onClick={exportPurchaseVatCSV}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      2. โหลดรายงานภาษีซื้อ
                    </button>
                    <button
                      onClick={exportWhtCSV}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-600" />
                      3. โหลดรายงานหัก ณ ที่จ่าย
                    </button>
                    <button
                      onClick={exportInventoryCSV}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-600" />
                      4. โหลดสต็อกปลายงวด
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SALES VAT TABLE */}
            {activeTab === "salesVat" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    รายการภาษีขายประจำงวด (Sales Tax Report)
                  </h4>
                  <button
                    onClick={exportSalesVatCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3">วันที่</th>
                        <th className="px-4 py-3">เลขที่เอกสาร</th>
                        <th className="px-4 py-3">ลูกค้า</th>
                        <th className="px-4 py-3 text-right">มูลค่าก่อนภาษี</th>
                        <th className="px-4 py-3 text-right">ภาษีขาย 7%</th>
                        <th className="px-4 py-3 text-right">ยอดรวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {data.salesVatItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2.5">{new Date(item.date).toLocaleDateString("th-TH")}</td>
                          <td className="px-4 py-2.5 font-mono font-semibold text-blue-600">{item.reference}</td>
                          <td className="px-4 py-2.5">{item.customer}</td>
                          <td className="px-4 py-2.5 text-right">฿{item.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-blue-600">฿{item.tax.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">฿{item.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PURCHASE VAT TABLE */}
            {activeTab === "purchaseVat" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    รายการภาษีซื้อประจำงวด (Purchase Tax Report)
                  </h4>
                  <button
                    onClick={exportPurchaseVatCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3">วันที่</th>
                        <th className="px-4 py-3">เลขที่ใบกำกับ</th>
                        <th className="px-4 py-3">ผู้ขาย / ซัพพลายเออร์</th>
                        <th className="px-4 py-3 text-right">มูลค่าก่อนภาษี</th>
                        <th className="px-4 py-3 text-right">ภาษีซื้อ 7%</th>
                        <th className="px-4 py-3 text-right">ยอดรวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {data.purchaseVatItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2.5">{new Date(item.date).toLocaleDateString("th-TH")}</td>
                          <td className="px-4 py-2.5 font-mono font-semibold text-emerald-600">{item.reference}</td>
                          <td className="px-4 py-2.5">{item.supplier}</td>
                          <td className="px-4 py-2.5 text-right">฿{item.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-emerald-600">฿{item.tax.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">฿{item.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: WHT TABLE */}
            {activeTab === "wht" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    รายการภาษีหัก ณ ที่จ่าย (Withholding Tax Report)
                  </h4>
                  <button
                    onClick={exportWhtCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3">เลขที่เอกสาร</th>
                        <th className="px-4 py-3">แบบภาษี</th>
                        <th className="px-4 py-3">ผู้ถูกหักภาษี</th>
                        <th className="px-4 py-3">รายการ</th>
                        <th className="px-4 py-3 text-right">ฐานภาษี</th>
                        <th className="px-4 py-3 text-center">อัตรา</th>
                        <th className="px-4 py-3 text-right">ภาษีที่หัก</th>
                        <th className="px-4 py-3 text-right">จ่ายสุทธิ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {data.withholdingTaxItems.map((w) => (
                        <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2.5 font-mono font-semibold text-emerald-600">{w.whtNumber}</td>
                          <td className="px-4 py-2.5 font-bold">{w.formType}</td>
                          <td className="px-4 py-2.5">{w.payeeName}</td>
                          <td className="px-4 py-2.5 max-w-[200px] truncate">{w.description}</td>
                          <td className="px-4 py-2.5 text-right font-medium">฿{w.baseAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2.5 text-center">{w.taxRate}%</td>
                          <td className="px-4 py-2.5 text-right font-bold text-rose-600">฿{w.taxAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">฿{w.netPaid.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: INVENTORY VALUATION TABLE */}
            {activeTab === "inventory" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    สรุปมูลค่าสินค้าและวัตถุดิบคงเหลือปลายงวด (Ending Inventory Valuation)
                  </h4>
                  <button
                    onClick={exportInventoryCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3">รหัสสินค้า</th>
                        <th className="px-4 py-3">ชื่อสินค้า / วัตถุดิบ</th>
                        <th className="px-4 py-3">หมวดหมู่</th>
                        <th className="px-4 py-3 text-right">จำนวนคงเหลือ</th>
                        <th className="px-4 py-3 text-right">ต้นทุน/หน่วย (Cost)</th>
                        <th className="px-4 py-3 text-right">มูลค่ารวมปลายงวด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {data.inventoryValuation.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2.5 font-mono text-gray-500">{p.code}</td>
                          <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">{p.name}</td>
                          <td className="px-4 py-2.5 text-gray-500">{p.category}</td>
                          <td className="px-4 py-2.5 text-right font-medium">{p.stock.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-mono">฿{p.unitCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-purple-600">฿{p.totalValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Download Feedback Modal */}
        {downloadSuccessMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Package Ready!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{downloadSuccessMsg}</p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setDownloadSuccessMsg(null)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
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

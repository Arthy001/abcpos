"use client";

import React from "react";
import { Quotation, Customer, CompanySettings } from "@/types";
import { thaiBahtText } from "@/lib/thaiBahtText";

interface QuotationTemplateProps {
  quotation: Quotation;
  company: CompanySettings | null;
  customer: Customer | null;
}

// =========================================================================
// 1. EXECUTIVE MODERN TEMPLATE
// โทนสี: Slate Navy (#0F172A) + Amber Gold (#FE9F43)
// โครงสร้าง: ทรงพลัง หรูหรา ข้อมูลครบถ้วน ตาราง Zebra สลับสี มีกรอบประทับตรา
// =========================================================================
export const ExecutiveModernTemplate: React.FC<QuotationTemplateProps> = ({
  quotation,
  company,
  customer,
}) => {
  const subtotal = quotation.quantity * quotation.unitPrice;
  const discount = quotation.discount || 0;
  const taxable = Math.max(0, subtotal - discount);
  const vat = quotation.tax || taxable * 0.07;
  const total = quotation.total || taxable + vat;

  return (
    <div className="w-full bg-white text-gray-800 text-[12px] leading-relaxed font-sans p-8 print:p-0 flex flex-col justify-between">
      <div>
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0F172A] via-[#334155] to-[#FE9F43] rounded-full mb-6"></div>

        {/* Company Header & Document Meta */}
        <div className="flex justify-between items-start gap-6 pb-6 border-b border-gray-100">
          <div className="space-y-1.5 max-w-[55%]">
            <div className="flex items-center space-x-3 mb-2">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt="Company Logo"
                  className="h-11 w-auto object-contain max-w-[150px]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="h-10 px-3 bg-[#0F172A] text-white rounded-lg flex items-center font-black tracking-wider text-sm">
                  <span className="text-[#FE9F43] mr-1">ABC</span> POS
                </div>
              )}
              <h1 className="font-extrabold text-base text-[#0F172A] tracking-tight leading-snug">
                {company?.companyName || "บริษัท เอบีซี โพส รีเทล จำกัด"}
              </h1>
            </div>

            <p className="text-gray-500 text-[11px] leading-relaxed">
              {company?.address ? `${company.address} ${company.city || ""} ${company.state || ""} ${company.postalCode || ""}` : "88/18 หมู่ 4 ถ.พระราม 2 ต.คอกกระบือ อ.เมือง จ.สมุทรสาคร 74000"}
            </p>

            <div className="flex flex-wrap gap-x-4 text-gray-600 text-[11px] pt-1">
              <span>
                เลขประจำตัวผู้เสียภาษี:{" "}
                <strong className="font-mono text-gray-900">{company?.taxId || "0105562098888"}</strong>
              </span>
              <span>
                สาขา:{" "}
                <strong className="text-gray-900">
                  {company?.branchType === "BRANCH"
                    ? `${company?.branchName || "สาขา"} (${company?.branchCode || "00001"})`
                    : `สำนักงานใหญ่ (${company?.branchCode || "00000"})`}
                </strong>
              </span>
            </div>

            <p className="text-gray-500 text-[11px]">
              โทร: {company?.phone || "02-890-1234"} | อีเมล: {company?.email || "sales@abcpos.com"}
              {company?.website && ` | เว็บไซต์: ${company.website}`}
            </p>
          </div>

          {/* Right: Quotation Badge & Reference Details */}
          <div className="text-right shrink-0 space-y-2">
            <div className="inline-block px-4 py-1.5 bg-[#0F172A] text-white rounded-lg shadow-xs">
              <span className="text-xs font-black tracking-widest uppercase">ใบเสนอราคา</span>
              <span className="text-[10px] text-orange-300 font-mono block tracking-wider">PRICE QUOTATION</span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-gray-600 pt-1">
              <div>
                เลขที่ (QT No.): <strong className="text-gray-900 text-xs">{quotation.reference}</strong>
              </div>
              <div>
                วันที่ (Date):{" "}
                <strong className="text-gray-800">
                  {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString("th-TH") : new Date().toLocaleDateString("th-TH")}
                </strong>
              </div>
              <div>
                กำหนดยืนราคา:{" "}
                <span className="text-orange-600 font-bold">
                  {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("th-TH") : "30 วัน นับจากวันที่ออกเอกสาร"}
                </span>
              </div>
              <div>
                สถานะเอกสาร:{" "}
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {quotation.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Delivery Info Cards */}
        <div className="grid grid-cols-2 gap-4 my-5">
          {/* Client Box */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              ลูกค้า / ผู้ติดต่อ (Client Information)
            </span>
            <div className="font-bold text-gray-900 text-[13px]">{quotation.customerName}</div>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              {customer?.address ? `${customer.address} ${customer.city || ""} ${customer.country || ""}` : "ลูกค้าทั่วไป / Standard Customer"}
            </p>
            <div className="flex flex-wrap gap-x-3 text-[11px] text-gray-600 pt-0.5">
              <span>
                เลขผู้เสียภาษี: <strong className="font-mono text-gray-900">{customer?.taxId || "-"}</strong>
              </span>
              <span>
                สาขา:{" "}
                <strong className="text-gray-900">
                  {customer?.branchNo ? (customer.branchNo === "00000" ? "สำนักงานใหญ่" : `สาขา ${customer.branchNo}`) : "สำนักงานใหญ่"}
                </strong>
              </span>
            </div>
            {customer?.phone && <div className="text-[11px] text-gray-600">เบอร์โทรศัพท์: {customer.phone}</div>}
          </div>

          {/* Terms & Delivery Box */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              เงื่อนไขการค้า (Commercial Terms)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-gray-400 block text-[10px]">เงื่อนไขการชำระเงิน</span>
                <span className="font-bold text-gray-800">
                  {customer?.creditTermDays && customer.creditTermDays > 0 ? `เครดิตการค้า ${customer.creditTermDays} วัน` : "ชำระเงินสด / โอนชำระ"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">ระยะเวลาส่งมอบ</span>
                <span className="font-bold text-gray-800">3 - 7 วันทำการ</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">สถานที่ส่งมอบ</span>
                <span className="font-bold text-gray-800">ตามที่อยู่ลูกค้า / คลังสินค้า</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">ผู้รับผิดชอบการขาย</span>
                <span className="font-bold text-gray-800">ฝ่ายขายและบริการลูกค้า</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white text-[11px] font-semibold tracking-wider">
                <th className="py-2.5 px-3 text-center w-12">ลำดับ</th>
                <th className="py-2.5 px-3">รายการสินค้า / บริการ (Item Description)</th>
                <th className="py-2.5 px-3 text-center w-20">จำนวน</th>
                <th className="py-2.5 px-3 text-right w-28">ราคา/หน่วย (฿)</th>
                <th className="py-2.5 px-3 text-right w-32">จำนวนเงิน (฿)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr className="bg-white">
                <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">1</td>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{quotation.productName}</div>
                  {quotation.notes && <div className="text-[10px] text-slate-500 italic mt-0.5">รายละเอียด: {quotation.notes}</div>}
                </td>
                <td className="py-3 px-3 text-center font-semibold text-slate-800">{quotation.quantity.toLocaleString()}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">
                  {quotation.unitPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                  {subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Filler lines for A4 stability */}
              <tr className="h-28 bg-slate-50/20">
                <td colSpan={5}></td>
              </tr>
            </tbody>

            {/* Total Calculation Footer */}
            <tfoot className="border-t-2 border-slate-200 bg-slate-50/60 text-[11px]">
              <tr>
                <td colSpan={3} rowSpan={4} className="p-4 border-r border-slate-200 align-top">
                  <div className="space-y-2">
                    <div className="p-2.5 bg-orange-50/70 border border-orange-100 rounded-lg">
                      <span className="text-[10px] font-bold text-orange-700 uppercase block mb-0.5">จำนวนเงินตัวอักษร:</span>
                      <span className="text-[11px] font-bold text-slate-900">({thaiBahtText(total)})</span>
                    </div>
                    <div className="text-[10px] text-gray-500 space-y-0.5 pt-1">
                      <p className="font-bold text-gray-700">ข้อมูลบัญชีธนาคารสำหรับโอนชำระ:</p>
                      <p>ธนาคารกสิกรไทย (KBANK) • เลขที่บัญชี: 123-2-99887-1</p>
                      <p>ชื่อบัญชี: บจก. เอบีซี โพส รีเทล (กระแสรายวัน)</p>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3 border-r border-slate-200 text-right font-medium text-slate-600">รวมมูลค่าสินค้า (Subtotal):</td>
                <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                  ฿{subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {discount > 0 && (
                <tr>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-medium text-slate-600">ส่วนลดพิเศษ (Discount):</td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-rose-600">
                    -฿{discount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-2 px-3 border-r border-slate-200 text-right font-medium text-slate-600">ภาษีมูลค่าเพิ่ม 7% (VAT):</td>
                <td className="py-2 px-3 text-right font-mono font-medium text-blue-600">
                  ฿{vat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="bg-amber-50 font-bold border-t border-slate-300">
                <td className="py-2.5 px-3 border-r border-slate-200 text-right text-slate-900">ยอดรวมทั้งสิ้น (Grand Total):</td>
                <td className="py-2.5 px-3 text-right font-mono text-sm text-[#FE9F43]">
                  ฿{total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Signature & Seal Block */}
      <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-[11px]">
        <div className="space-y-3">
          <p className="text-slate-500 font-semibold">ในนาม ผู้เสนอราคา (Prepared By)</p>
          <div className="h-16 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
            <span className="text-[10px] text-slate-400 italic">ลงชื่อและประทับตราสำคัญ</span>
          </div>
          <div>
            <p className="font-bold text-slate-800">({company?.companyName || "บริษัท เอบีซี โพส รีเทล จำกัด"})</p>
            <p className="text-slate-400 text-[10px]">วันที่ ......./......./...........</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-slate-500 font-semibold">ในนาม ลูกค้า / ผู้มีอำนาจสั่งซื้อ (Approved By)</p>
          <div className="h-16 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
            <span className="text-[10px] text-slate-400 italic">ลงชื่อและประทับตราสำคัญ</span>
          </div>
          <div>
            <p className="font-bold text-slate-800">({quotation.customerName})</p>
            <p className="text-slate-400 text-[10px]">วันที่ ......./......./...........</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. MINIMALIST SWISS CORPORATE TEMPLATE
// โทนสี: คลีน มินิมอล ดำ-ขาว-เทา โปร่งตา สไตล์สถาปัตยกรรมสวิส
// =========================================================================
export const MinimalistSwissTemplate: React.FC<QuotationTemplateProps> = ({
  quotation,
  company,
  customer,
}) => {
  const subtotal = quotation.quantity * quotation.unitPrice;
  const discount = quotation.discount || 0;
  const taxable = Math.max(0, subtotal - discount);
  const vat = quotation.tax || taxable * 0.07;
  const total = quotation.total || taxable + vat;

  return (
    <div className="w-full bg-white text-gray-900 text-[12px] leading-relaxed font-sans p-8 print:p-0 flex flex-col justify-between">
      <div>
        {/* Double Line Top Header */}
        <div className="border-t-2 border-b border-gray-900 py-3 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">{company?.companyName || "SIAM POLYPACK"}</h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest">
              Tax ID: {company?.taxId || "0105562098888"} • {company?.branchType === "BRANCH" ? `Branch ${company.branchCode || "00001"}` : "Head Office"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-black tracking-widest">QUOTATION</div>
            <div className="font-mono text-xs text-gray-500">REF: {quotation.reference}</div>
          </div>
        </div>

        {/* 2-Column Meta Grid */}
        <div className="grid grid-cols-2 gap-12 pb-8 text-[11px]">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-gray-400 text-[10px] mb-2">Issued To:</h3>
            <div className="text-sm font-bold text-gray-900">{quotation.customerName}</div>
            <p className="text-gray-600 mt-1">{customer?.address || "Commercial Client"}</p>
            <p className="text-gray-500 mt-0.5">Tax ID: {customer?.taxId || "-"}</p>
            {customer?.phone && <p className="text-gray-500">Phone: {customer.phone}</p>}
          </div>

          <div className="text-right space-y-1">
            <h3 className="font-bold uppercase tracking-wider text-gray-400 text-[10px] mb-2">Document Details:</h3>
            <div>Date: <strong>{quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}</strong></div>
            <div>Validity: <strong className="text-gray-700">30 Calendar Days</strong></div>
            <div>Payment: <strong>{customer?.creditTermDays ? `Credit ${customer.creditTermDays} Days` : "Net Cash"}</strong></div>
            <div>Status: <span className="uppercase font-bold text-gray-700">{quotation.status}</span></div>
          </div>
        </div>

        {/* Borderless Table */}
        <div className="my-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-900 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 w-12 text-center">#</th>
                <th className="py-2.5">Description</th>
                <th className="py-2.5 text-center w-20">Qty</th>
                <th className="py-2.5 text-right w-28">Unit Price</th>
                <th className="py-2.5 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[11px]">
              <tr>
                <td className="py-3 text-center text-gray-400 font-mono">01</td>
                <td className="py-3">
                  <div className="font-bold text-gray-900">{quotation.productName}</div>
                  {quotation.notes && <div className="text-gray-500 text-[10px] mt-0.5">{quotation.notes}</div>}
                </td>
                <td className="py-3 text-center font-mono">{quotation.quantity}</td>
                <td className="py-3 text-right font-mono">{quotation.unitPrice.toFixed(2)}</td>
                <td className="py-3 text-right font-mono font-bold">{subtotal.toFixed(2)}</td>
              </tr>
              <tr className="h-32">
                <td colSpan={5}></td>
              </tr>
            </tbody>
          </table>

          {/* Minimalist Summary */}
          <div className="border-t-2 border-gray-900 pt-4 flex justify-between items-start text-[11px]">
            <div className="max-w-md space-y-1 text-gray-500">
              <p className="font-bold text-gray-800 uppercase text-[10px]">Payment Information</p>
              <p>Bank: Kasikorn Bank (Account: 123-2-99887-1)</p>
              <p className="italic font-sans text-gray-700 pt-1">({thaiBahtText(total)})</p>
            </div>

            <div className="w-64 space-y-2 text-right">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono">฿{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span className="font-mono">-฿{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>VAT 7%:</span>
                <span className="font-mono">฿{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-900 pt-2 text-gray-900">
                <span>TOTAL DUE:</span>
                <span className="font-mono text-base">฿{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="pt-10 border-t border-gray-200 grid grid-cols-2 gap-16 text-[11px]">
        <div>
          <p className="font-bold uppercase tracking-wider text-[10px] text-gray-400 mb-8">Authorized Signature</p>
          <div className="border-b border-gray-400 w-4/5"></div>
          <p className="mt-2 text-gray-600">{company?.companyName || "ABC POS Retail Co., Ltd."}</p>
        </div>
        <div>
          <p className="font-bold uppercase tracking-wider text-gray-400 mb-8">Client Acceptance</p>
          <div className="border-b border-gray-400 w-4/5"></div>
          <p className="mt-2 text-gray-600">{quotation.customerName}</p>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. THAI OFFICIAL FORMAL TEMPLATE
// โทนสี: ทางการ ราชการ/จัดซื้อจัดจ้าง ตาราง Full Grid ครบทุกช่องระเบียบการ
// =========================================================================
export const ThaiOfficialFormalTemplate: React.FC<QuotationTemplateProps> = ({
  quotation,
  company,
  customer,
}) => {
  const subtotal = quotation.quantity * quotation.unitPrice;
  const discount = quotation.discount || 0;
  const taxable = Math.max(0, subtotal - discount);
  const vat = quotation.tax || taxable * 0.07;
  const total = quotation.total || taxable + vat;

  return (
    <div className="w-full bg-white text-gray-900 text-[11px] leading-snug font-sans p-6 print:p-0 flex flex-col justify-between">
      <div>
        {/* Official Header */}
        <div className="text-center pb-3 border-b-2 border-black space-y-1">
          <h1 className="text-base font-bold text-gray-900">{company?.companyName || "บริษัท เอบีซี โพส รีเทล จำกัด"}</h1>
          <p className="text-[11px] text-gray-700">
            {company?.address ? `${company.address} ${company.city || ""} ${company.state || ""} ${company.postalCode || ""}` : "88/18 หมู่ 4 ถ.พระราม 2 ต.คอกกระบือ อ.เมือง จ.สมุทรสาคร 74000"}
          </p>
          <p className="text-[11px] text-gray-700">
            เลขประจำตัวผู้เสียภาษีอากร: <strong>{company?.taxId || "0105562098888"}</strong> ({company?.branchType === "BRANCH" ? `สาขา ${company.branchCode || "00001"}` : "สำนักงานใหญ่"}) โทรศัพท์: {company?.phone || "02-890-1234"}
          </p>
        </div>

        {/* Title Badge */}
        <div className="text-center my-3">
          <span className="text-sm font-extrabold border-2 border-black px-8 py-1 uppercase tracking-wide inline-block">
            ใบเสนอราคา (QUOTATION)
          </span>
        </div>

        {/* Customer & Document Info Grid */}
        <div className="border border-black grid grid-cols-2 text-[11px]">
          <div className="p-2.5 border-r border-black space-y-1">
            <div><strong>เรียน:</strong> ฝ่ายจัดซื้อ / Purchasing Department</div>
            <div><strong>ชื่อลูกค้า/บริษัท:</strong> {quotation.customerName}</div>
            <div><strong>ที่อยู่:</strong> {customer?.address || "ตามที่ระบุในฐานข้อมูล"}</div>
            <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> {customer?.taxId || "-"} ({customer?.branchNo ? `สาขา ${customer.branchNo}` : "สำนักงานใหญ่"})</div>
            <div><strong>โทรศัพท์:</strong> {customer?.phone || "-"}</div>
          </div>

          <div className="p-2.5 space-y-1">
            <div><strong>เลขที่เอกสาร:</strong> <span className="font-mono">{quotation.reference}</span></div>
            <div><strong>วันที่:</strong> {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString("th-TH") : new Date().toLocaleDateString("th-TH")}</div>
            <div><strong>กำหนดยืนราคา:</strong> 30 วัน นับแต่วันที่ออกเอกสาร</div>
            <div><strong>เงื่อนไขการชำระเงิน:</strong> {customer?.creditTermDays ? `เครดิต ${customer.creditTermDays} วัน` : "เงินสด / โอนชำระ"}</div>
            <div><strong>กำหนดส่งของ:</strong> ภายใน 5-7 วันทำการหลังได้รับใบสั่งซื้อ</div>
          </div>
        </div>

        <p className="my-2 text-[11px] text-gray-700">
          บริษัทฯ มีความยินดีขอเสนอราคาสินค้าและบริการ ตามรายการและเงื่อนไขดังต่อไปนี้:
        </p>

        {/* Full Grid Table */}
        <table className="w-full border-collapse border border-black text-left text-[11px]">
          <thead>
            <tr className="bg-gray-100 border-b border-black font-bold text-center">
              <th className="border-r border-black p-2 w-12">ลำดับ</th>
              <th className="border-r border-black p-2">รายการสินค้า / บริการ</th>
              <th className="border-r border-black p-2 w-16">จำนวน</th>
              <th className="border-r border-black p-2 w-16">หน่วย</th>
              <th className="border-r border-black p-2 text-right w-24">ราคา/หน่วย</th>
              <th className="p-2 text-right w-28">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="border-r border-black p-2 text-center font-mono">1</td>
              <td className="border-r border-black p-2">
                <div className="font-bold">{quotation.productName}</div>
                {quotation.notes && <div className="text-[10px] text-gray-600 mt-0.5">({quotation.notes})</div>}
              </td>
              <td className="border-r border-black p-2 text-center">{quotation.quantity}</td>
              <td className="border-r border-black p-2 text-center">ชิ้น</td>
              <td className="border-r border-black p-2 text-right font-mono">
                {quotation.unitPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </td>
              <td className="p-2 text-right font-mono font-bold">
                {subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </td>
            </tr>
            {/* Blank Grid Spacer */}
            <tr className="h-28 border-b border-black">
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td></td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-b border-black">
              <td colSpan={4} rowSpan={4} className="border-r border-black p-2 align-top text-[10px] text-gray-600 space-y-1">
                <div className="font-bold text-gray-800">หมายเหตุและเงื่อนไข:</div>
                <p>1. ราคานี้รวมภาษีมูลค่าเพิ่ม 7% เรียบร้อยแล้ว</p>
                <p>2. จัดส่งสินค้าฟรีเมื่อมียอดสั่งซื้อตามเงื่อนไขที่ตกลง</p>
                <p>3. กรุณาลงนามและประทับตรา ส่งสำเนากลับเพื่อยืนยันการสั่งซื้อ</p>
                <div className="font-bold text-black pt-1">
                  (ตัวอักษร: {thaiBahtText(total)})
                </div>
              </td>
              <td className="border-r border-black p-1.5 text-right font-bold">รวมเป็นเงิน:</td>
              <td className="p-1.5 text-right font-mono">{subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
            </tr>
            {discount > 0 && (
              <tr className="border-b border-black">
                <td className="border-r border-black p-1.5 text-right text-rose-600">หักส่วนลด:</td>
                <td className="p-1.5 text-right font-mono text-rose-600">-{discount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
              </tr>
            )}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 text-right">ภาษีมูลค่าเพิ่ม 7%:</td>
              <td className="p-1.5 text-right font-mono text-blue-700">{vat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="bg-gray-100 font-bold">
              <td className="border-r border-black p-2 text-right">จำนวนเงินรวมทั้งสิ้น:</td>
              <td className="p-2 text-right font-mono text-xs">{total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>

        {/* Customer Order Approval Checkbox */}
        <div className="border border-black border-t-0 p-2.5 bg-gray-50 flex items-center space-x-2 text-[11px]">
          <span className="w-4 h-4 border border-black inline-block"></span>
          <span><strong>อนุมัติสั่งซื้อตามรายการข้างต้น</strong> (โปรดลงนามและส่งกลับเพื่อเปิดคำสั่งซื้อ)</span>
        </div>
      </div>

      {/* Dual Official Signatures */}
      <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[11px]">
        <div className="space-y-2">
          <p className="font-bold">ขอแสดงความนับถือ</p>
          <div className="h-14 border-b border-black border-dotted mx-10"></div>
          <p className="font-bold">({company?.companyName || "บริษัท เอบีซี โพส รีเทล จำกัด"})</p>
          <p className="text-gray-500 text-[10px]">ผู้มีอำนาจลงนาม / ผู้เสนอราคา</p>
        </div>

        <div className="space-y-2">
          <p className="font-bold">อนุมัติสั่งซื้อสินค้า</p>
          <div className="h-14 border-b border-black border-dotted mx-10"></div>
          <p className="font-bold">({quotation.customerName})</p>
          <p className="text-gray-500 text-[10px]">ผู้มีอำนาจสั่งซื้อ / วันที่ ...../...../.........</p>
        </div>
      </div>
    </div>
  );
};

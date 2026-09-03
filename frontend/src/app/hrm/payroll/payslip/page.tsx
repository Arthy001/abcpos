"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Payroll } from "@/types";
import { fetchPayrolls, fetchPayrollById } from "@/lib/api";
import {
  ChevronUp,
  Printer,
  ArrowLeft,
  Mail,
  Download,
  Barcode,
  ShoppingBag,
} from "lucide-react";

function PayslipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");

  const [allPayrolls, setAllPayrolls] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await fetchPayrolls();
        setAllPayrolls(list || []);

        if (targetId) {
          const found = (list || []).find((p) => p.id === targetId);
          if (found) {
            setSelectedPayroll(found);
          } else {
            const single = await fetchPayrollById(targetId);
            setSelectedPayroll(single || (list && list.length > 0 ? list[0] : null));
          }
        } else if (list && list.length > 0) {
          setSelectedPayroll(list[0]);
        } else {
          setSelectedPayroll(null);
        }
      } catch (e) {
        console.error("Failed to load payroll:", e);
        setSelectedPayroll(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [targetId]);

  const p = selectedPayroll;

  const totalEarnings = p
    ? (p.basicSalary || p.salary || 0) +
      (p.hra || 0) +
      (p.conveyance || 0) +
      (p.medical || 0) +
      (p.bonus || 0)
    : 0;

  const totalDeductions = p
    ? (p.pf || 0) +
      (p.professionalTax || 0) +
      (p.tds || 0) +
      (p.loans || 0)
    : 0;

  const netSalary = totalEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    if (!p) return;
    alert(`Payslip has been sent to ${p.email || "employee@example.com"}!`);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Payslip</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* PDF Export Button (Red) */}
          <button
            onClick={handlePrint}
            title="Export PDF"
            className="w-8 h-8 rounded-lg bg-[#FF4D4F]/10 hover:bg-[#FF4D4F]/20 text-[#FF4D4F] flex items-center justify-center transition-colors border border-[#FF4D4F]/20 shadow-2xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-1v-2h1c.55 0 1 .45 1 1s-.45 1-1 1zm5.5 0c0 .55-.45 1-1 1h-2v-4h2c.55 0 1 .45 1 1v2zm-2.5-1h1v-1h-1v1z" />
            </svg>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            title="Print"
            className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Collapse */}
          <button
            title="Collapse"
            className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Back to Payroll Button (Dark Navy) */}
          <button
            onClick={() => router.push("/hrm/payroll/salary")}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Payroll</span>
          </button>
        </div>
      </div>

      {/* Select Employee Quick Switcher (If multiple) */}
      {allPayrolls.length > 0 && p && (
        <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-[#E9ECEF] text-xs">
          <span className="font-semibold text-gray-700">Select Employee:</span>
          <select
            value={p.id}
            onChange={(e) => {
              const found = allPayrolls.find((item) => item.id === e.target.value);
              if (found) setSelectedPayroll(found);
            }}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
          >
            {allPayrolls.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.empCode} - {emp.employeeName} ({emp.employeeRole})
              </option>
            ))}
          </select>
        </div>
      )}

      {!p ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] p-12 text-center text-gray-500">
          <p className="text-sm font-semibold">No Payroll records found in database.</p>
          <button
            onClick={() => router.push("/hrm/payroll/salary")}
            className="mt-3 px-4 py-2 bg-[#FE9F43] text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Go to Salary Management
          </button>
        </div>
      ) : (
      /* Payslip Document Card */
      <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-6 md:p-8 space-y-6 max-w-4xl mx-auto print:shadow-none print:border-none">
        {/* Card Header & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">
              Payslip for the Month of {p?.payPeriod || "Jan 2026"}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* Send Email Button (Orange) */}
            <button
              onClick={handleSendEmail}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>

            {/* Download Button (Dark Navy) */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            {/* Print Barcode Button (Red) */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FF4D4F] hover:bg-[#E03E40] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Print Barcode</span>
            </button>
          </div>
        </div>

        {/* Employee Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#334155] gap-2">
          <div className="space-y-1">
            <p>
              <span className="text-[#64748B]">Employee Name : </span>
              <span className="font-semibold text-[#1E293B]">{p.employeeName}</span>
            </p>
            <p>
              <span className="text-[#64748B]">Employee ID : </span>
              <span className="font-semibold text-[#1E293B]">{p.empCode}</span>
            </p>
          </div>

          <div className="space-y-1 sm:text-right">
            <p>
              <span className="text-[#64748B]">Location : </span>
              <span className="font-semibold text-[#1E293B]">{p.location || "USA"}</span>
            </p>
            <p>
              <span className="text-[#64748B]">Pay Period : </span>
              <span className="font-semibold text-[#1E293B]">{p.payPeriod || "Jan 2026"}</span>
            </p>
          </div>
        </div>

        {/* 2-Columns Grid for Earnings vs Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Earnings Table */}
          <div className="border border-[#E9ECEF] rounded-xl overflow-hidden">
            <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#E9ECEF]">
              <h3 className="font-bold text-xs text-[#1E293B]">Earnings</h3>
            </div>
            <table className="w-full text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#64748B] bg-white">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-left">Pay Type</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA] text-[#334155]">
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">Basic Salary</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.basicSalary || p.salary || 32000).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">HRA Allowance</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.hra || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">Conveyance</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.conveyance || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">Medical Allowance</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.medical || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">Bonus</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.bonus || 0).toFixed(2)}</td>
                </tr>
                <tr className="bg-[#F8F9FA] font-bold text-[#1E293B]">
                  <td className="py-3 px-4">Total Earnings</td>
                  <td className="py-3 px-4 text-right">${totalEarnings.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deductions Table */}
          <div className="border border-[#E9ECEF] rounded-xl overflow-hidden">
            <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#E9ECEF]">
              <h3 className="font-bold text-xs text-[#1E293B]">Deductions</h3>
            </div>
            <table className="w-full text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#64748B] bg-white">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-left">Pay Type</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA] text-[#334155]">
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">PF</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.pf || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">Professional Tax</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.professionalTax || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">TDS</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.tds || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">Loans &amp; Others</td>
                  <td className="py-2.5 px-4 text-right font-medium">${(p.loans || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-[#64748B]">Bonus</td>
                  <td className="py-2.5 px-4 text-right font-medium">$0.00</td>
                </tr>
                <tr className="bg-[#F8F9FA] font-bold text-[#1E293B]">
                  <td className="py-3 px-4">Total Deductions</td>
                  <td className="py-3 px-4 text-right">${totalDeductions.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Net Salary Summary */}
        <div className="space-y-1 pt-2">
          <p className="text-sm font-bold text-[#1E293B]">
            Net Salary <span className="ml-2 font-extrabold">${netSalary.toLocaleString()}</span>
          </p>
          <p className="text-xs text-[#64748B]">
            <span className="font-medium">Inwords</span> Thirty Two Thousand Only
          </p>
        </div>

        {/* Footer Brand Logo & Address */}
        <div className="pt-8 border-t border-gray-100 flex flex-col items-center justify-center text-center space-y-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-6 h-6 bg-[#FE9F43] rounded flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-sm text-[#0F172A]">
              dreams<span className="text-[#FE9F43] font-bold text-xs ml-0.5">POS</span>
            </span>
          </div>
          <p className="text-xs text-[#64748B] max-w-xs leading-relaxed">
            81, Randall Drive, Hornchurch <br />
            RM126TA.
          </p>
        </div>
      </div>
      )}
    </div>
  );
}

export default function PayslipPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Payslip...</div>}>
        <PayslipContent />
      </Suspense>
    </AppLayout>
  );
}

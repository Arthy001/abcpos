"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface TaxRateItem {
  id: string;
  name: string;
  rate: string;
  createdOn: string;
}

export default function TaxRatesSettingsPage() {
  const [taxRates, setTaxRates] = useState<TaxRateItem[]>([
    { id: "1", name: "VAT", rate: "10%", createdOn: "12 Jan 2026" },
    { id: "2", name: "CGST", rate: "08%", createdOn: "10 Jan 2026" },
    { id: "3", name: "SGST", rate: "10%", createdOn: "06 Jan 2026" },
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDelete = (id: string) => {
    setTaxRates((prev) => prev.filter((t) => t.id !== id));
    showFeedback("Tax rate removed successfully");
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your settings on portal</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={() => showFeedback("Tax rates refreshed")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: Tax Rates */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-[#1E293B]">Tax Rates</h2>

              <button
                type="button"
                onClick={() => showFeedback("Add new tax rate requested")}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add New Tax Rate</span>
              </button>
            </div>

            {/* Table matching screenshot */}
            <div className="overflow-x-auto p-5">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#F8F9FA]/60">
                  <tr>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Tax Name</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Tax rates</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Created On</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {taxRates.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-4 px-5 font-semibold text-[#1E293B]">{item.name}</td>
                      <td className="py-4 px-5 text-[#64748B]">{item.rate}</td>
                      <td className="py-4 px-5 text-[#64748B]">{item.createdOn}</td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => showFeedback(`Edit ${item.name}`)}
                            className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-[#FE9F43] hover:border-[#FE9F43] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

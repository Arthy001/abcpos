"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  Plus,
  Star,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface SignatureItem {
  id: string;
  name: string;
  isDefault: boolean;
  status: "Active" | "Inactive";
}

export default function SignaturesSettingsPage() {
  const [signatures, setSignatures] = useState<SignatureItem[]>([
    { id: "1", name: "Allen", isDefault: true, status: "Active" },
    { id: "2", name: "Raymond", isDefault: false, status: "Active" },
    { id: "3", name: "Ralph", isDefault: false, status: "Active" },
    { id: "4", name: "Steven", isDefault: false, status: "Active" },
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const toggleStar = (id: string) => {
    setSignatures((prev) =>
      prev.map((s) => ({ ...s, isDefault: s.id === id }))
    );
    showFeedback("Default signature updated");
  };

  const handleDelete = (id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    showFeedback("Signature removed");
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
              onClick={() => showFeedback("Signatures refreshed")}
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

          {/* Right Content Panel: Signatures */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-[#1E293B]">Signatures</h2>

              <button
                type="button"
                onClick={() => showFeedback("Add signature modal requested")}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Signature</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto p-5">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#F8F9FA]/60">
                  <tr>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Signature Name</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Signature</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827]">Status</th>
                    <th className="py-3.5 px-5 font-bold text-[#111827] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {signatures.map((sig) => (
                    <tr key={sig.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-4 px-5 font-medium text-[#1E293B]">{sig.name}</td>

                      {/* Signature graphic vector simulation */}
                      <td className="py-4 px-5">
                        <svg className="w-24 h-8 text-gray-800" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M10,20 Q25,5 35,18 T55,10 Q70,25 90,12" strokeLinecap="round" />
                          <path d="M30,22 Q45,28 65,20" strokeLinecap="round" />
                        </svg>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                          {sig.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => toggleStar(sig.id)}
                            title="Set as default"
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              sig.isDefault
                                ? "border-amber-400 bg-amber-50 text-amber-500"
                                : "border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-300"
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${sig.isDefault ? "fill-current" : ""}`} />
                          </button>
                          <button
                            onClick={() => showFeedback(`Edit ${sig.name}`)}
                            className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-[#FE9F43] hover:border-[#FE9F43] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sig.id)}
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

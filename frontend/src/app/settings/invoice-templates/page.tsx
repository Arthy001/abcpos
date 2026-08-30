"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  Star,
  CheckCircle2,
} from "lucide-react";

interface TemplateCard {
  id: string;
  name: string;
  isFavorite: boolean;
  category: "invoices" | "purchases" | "receipts";
}

export default function InvoiceTemplatesPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "purchases" | "receipts">("invoices");
  const [templates, setTemplates] = useState<TemplateCard[]>([
    { id: "1", name: "General Invoice 1", isFavorite: true, category: "invoices" },
    { id: "2", name: "General Invoice 2", isFavorite: false, category: "invoices" },
    { id: "3", name: "General Invoice 3", isFavorite: false, category: "invoices" },
    { id: "4", name: "General Invoice 4", isFavorite: false, category: "invoices" },
    { id: "5", name: "General Invoice 5", isFavorite: false, category: "invoices" },
    { id: "6", name: "Standard Purchase 1", isFavorite: false, category: "purchases" },
    { id: "7", name: "Detailed Purchase 2", isFavorite: false, category: "purchases" },
    { id: "8", name: "Thermal Receipt 1", isFavorite: true, category: "receipts" },
    { id: "9", name: "80mm POS Receipt", isFavorite: false, category: "receipts" },
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const toggleFavorite = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
    showFeedback("Template default preference updated");
  };

  const currentTemplates = templates.filter((t) => t.category === activeTab);

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
              onClick={() => showFeedback("Templates refreshed")}
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

          {/* Right Content Panel: Invoice Templates */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Invoice Templates</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Category Switcher Tabs */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("invoices")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "invoices"
                      ? "bg-[#FE9F43] text-white shadow-xs"
                      : "bg-[#E2E8F0] text-[#64748B] hover:bg-gray-200"
                  }`}
                >
                  Invoices
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("purchases")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "purchases"
                      ? "bg-[#FE9F43] text-white shadow-xs"
                      : "bg-[#E2E8F0] text-[#64748B] hover:bg-gray-200"
                  }`}
                >
                  Purchases
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("receipts")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "receipts"
                      ? "bg-[#FE9F43] text-white shadow-xs"
                      : "bg-[#E2E8F0] text-[#64748B] hover:bg-gray-200"
                  }`}
                >
                  Receipts
                </button>
              </div>

              {/* Template Mockup Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {currentTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group border border-[#E2E8F0] rounded-xl overflow-hidden bg-white hover:border-[#FE9F43] transition-all hover:shadow-md"
                  >
                    {/* Visual Preview Box */}
                    <div className="p-4 bg-[#F8FAFC] border-b border-[#F1F3F5] h-52 flex flex-col justify-between">
                      {/* Header sample */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="h-2 w-12 bg-gray-300 rounded-xs"></div>
                          <div className="h-1.5 w-20 bg-gray-200 rounded-xs"></div>
                        </div>
                        <div className="h-4 w-4 bg-emerald-500/20 rounded-xs"></div>
                      </div>

                      {/* Line items sample */}
                      <div className="space-y-1.5 my-auto">
                        <div className="h-2 w-full bg-gray-200 rounded-xs"></div>
                        <div className="h-2 w-full bg-gray-100 rounded-xs"></div>
                        <div className="h-2 w-3/4 bg-gray-100 rounded-xs"></div>
                      </div>

                      {/* Total and signature line */}
                      <div className="flex items-end justify-between pt-2 border-t border-gray-200">
                        <div className="h-1.5 w-10 bg-gray-300 rounded-xs"></div>
                        <div className="h-3 w-12 bg-[#FE9F43]/30 rounded-xs"></div>
                      </div>
                    </div>

                    {/* Bottom Label and Star Button */}
                    <div className="p-3.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1E293B]">{template.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(template.id)}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                          template.isFavorite
                            ? "border-amber-400 bg-amber-50 text-amber-500"
                            : "border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-300"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${template.isFavorite ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

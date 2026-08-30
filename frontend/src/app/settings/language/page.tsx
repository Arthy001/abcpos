"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Search,
  Plus,
  Filter,
  CheckCircle2,
} from "lucide-react";

interface LanguageItem {
  id: string;
  name: string;
  code: string;
  flag: string;
  rtl: boolean;
  isDefault: boolean;
  total: number;
  done: number;
  progress: number;
  status: boolean;
}

export default function LanguageSettingsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [search, setSearch] = useState("");

  // Only TH and ENG as requested by user
  const [languages, setLanguages] = useState<LanguageItem[]>([
    {
      id: "en",
      name: "English",
      code: "en",
      flag: "🇺🇸",
      rtl: false,
      isDefault: true,
      total: 2145,
      done: 2145,
      progress: 100,
      status: true,
    },
    {
      id: "th",
      name: "ไทย (Thai)",
      code: "th",
      flag: "🇹🇭",
      rtl: false,
      isDefault: false,
      total: 2145,
      done: 1950,
      progress: 90,
      status: true,
    },
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggle = (id: string, field: "rtl" | "isDefault" | "status") => {
    setLanguages((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === "isDefault") {
            return { ...item, isDefault: true };
          }
          return { ...item, [field]: !item[field] };
        }
        if (field === "isDefault") {
          return { ...item, isDefault: false };
        }
        return item;
      })
    );
    showFeedback("Language updated successfully");
  };

  const filteredLanguages = languages.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

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
              onClick={() => showFeedback("Languages refreshed")}
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

          {/* Right Content Panel: Language */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            {/* Card Header & Controls */}
            <div className="p-6 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-[#1E293B]">Language</h2>

              <div className="flex items-center space-x-3">
                <div className="relative min-w-[150px]">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="th">ไทย (Thai)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-2.5 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => showFeedback("Add translation requested")}
                  className="flex items-center space-x-1 px-4 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Translation</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>

              <button
                type="button"
                onClick={() => showFeedback("Import sample language requested")}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Import Sample</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto p-5 pt-0">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#F8F9FA]/60">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <input type="checkbox" className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43]" />
                    </th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Language</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Code</th>
                    <th className="py-3 px-4 font-bold text-[#111827] text-center">RTL</th>
                    <th className="py-3 px-4 font-bold text-[#111827] text-center">Default</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Total</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Done</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Progress</th>
                    <th className="py-3 px-4 font-bold text-[#111827] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {filteredLanguages.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43]" />
                      </td>

                      {/* Language with Flag */}
                      <td className="py-3.5 px-4 font-medium text-[#1E293B]">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">{item.flag}</span>
                          <span>{item.name}</span>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3.5 px-4 text-[#64748B] font-mono">{item.code}</td>

                      {/* RTL */}
                      <td className="py-3.5 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.rtl}
                            onChange={() => handleToggle(item.id, "rtl")}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                        </label>
                      </td>

                      {/* Default */}
                      <td className="py-3.5 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isDefault}
                            onChange={() => handleToggle(item.id, "isDefault")}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                        </label>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-[#64748B] font-semibold">{item.total}</td>

                      {/* Done */}
                      <td className="py-3.5 px-4 text-[#64748B] font-semibold">{item.done}</td>

                      {/* Progress */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin-none flex items-center justify-center">
                            <span className="text-[8px] font-bold text-emerald-600">✓</span>
                          </div>
                          <span className="text-xs font-bold text-[#1E293B]">{item.progress}%</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.status}
                            onChange={() => handleToggle(item.id, "status")}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-[#F1F3F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <div className="flex items-center space-x-2">
                <span>Row Per Page</span>
                <select className="border border-[#E2E8F0] rounded-md px-2 py-1 bg-white text-xs text-[#374151] focus:outline-none cursor-pointer">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>Entries</span>
              </div>

              <div className="flex items-center space-x-1">
                <button className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 cursor-not-allowed">
                  ‹
                </button>
                <button className="w-7 h-7 rounded-md bg-[#FE9F43] text-white font-bold flex items-center justify-center shadow-xs">
                  1
                </button>
                <button className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 cursor-not-allowed">
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

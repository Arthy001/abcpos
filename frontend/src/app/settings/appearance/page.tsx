"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [accentColor, setAccentColor] = useState<string>("#FE9F43");
  const [expandSidebar, setExpandSidebar] = useState<boolean>(true);
  const [sidebarSize, setSidebarSize] = useState<string>("Small - 85px");
  const [fontFamily, setFontFamily] = useState<string>("Nunito");

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showFeedback("Appearance settings saved successfully!");
  };

  const colors = [
    { name: "Orange", hex: "#FE9F43" },
    { name: "Purple", hex: "#7367F0" },
    { name: "Blue", hex: "#00CFE8" },
    { name: "Brown", hex: "#C47200" },
  ];

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
              onClick={() => showFeedback("Appearance settings refreshed")}
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

          {/* Right Content Panel: Appearance */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Appearance</h2>
            </div>

            <div className="p-6 space-y-8">
              {/* 1. Select Theme */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Select Theme</h4>
                  <p className="text-[11px] text-[#64748B]">Choose theme of website</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light Theme */}
                  <div
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      theme === "light"
                        ? "border-[#FE9F43] bg-[#FFFBF8] shadow-xs"
                        : "border-[#E2E8F0] hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="h-28 rounded-lg bg-[#F8FAFC] border border-gray-200 p-2 flex flex-col justify-between mb-3 overflow-hidden">
                      <div className="flex items-center space-x-1.5 border-b border-gray-200 pb-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FE9F43]"></span>
                        <span className="w-8 h-1.5 bg-gray-200 rounded-full"></span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 my-1">
                        <div className="h-7 bg-[#FE9F43]/15 rounded-xs"></div>
                        <div className="h-7 bg-blue-50 rounded-xs"></div>
                        <div className="h-7 bg-emerald-50 rounded-xs"></div>
                      </div>
                      <div className="h-8 bg-white border border-gray-200 rounded-xs"></div>
                    </div>
                    <p className="text-xs font-bold text-center text-[#1E293B]">Light</p>
                  </div>

                  {/* Dark Theme */}
                  <div
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      theme === "dark"
                        ? "border-[#FE9F43] bg-[#FFFBF8] shadow-xs"
                        : "border-[#E2E8F0] hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="h-28 rounded-lg bg-[#0F172A] border border-gray-800 p-2 flex flex-col justify-between mb-3 overflow-hidden">
                      <div className="flex items-center space-x-1.5 border-b border-gray-800 pb-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FE9F43]"></span>
                        <span className="w-8 h-1.5 bg-gray-700 rounded-full"></span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 my-1">
                        <div className="h-7 bg-gray-800 rounded-xs"></div>
                        <div className="h-7 bg-gray-800 rounded-xs"></div>
                        <div className="h-7 bg-gray-800 rounded-xs"></div>
                      </div>
                      <div className="h-8 bg-gray-900 border border-gray-800 rounded-xs"></div>
                    </div>
                    <p className="text-xs font-bold text-center text-[#1E293B]">Dark</p>
                  </div>

                  {/* Automatic Theme */}
                  <div
                    onClick={() => setTheme("auto")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      theme === "auto"
                        ? "border-[#FE9F43] bg-[#FFFBF8] shadow-xs"
                        : "border-[#E2E8F0] hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="h-28 rounded-lg bg-gradient-to-r from-[#F8FAFC] to-[#0F172A] border border-gray-300 p-2 flex flex-col justify-between mb-3 overflow-hidden">
                      <div className="flex items-center space-x-1.5 border-b border-gray-400 pb-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FE9F43]"></span>
                        <span className="w-8 h-1.5 bg-gray-400 rounded-full"></span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 my-1">
                        <div className="h-7 bg-white/70 rounded-xs"></div>
                        <div className="h-7 bg-gray-500/50 rounded-xs"></div>
                        <div className="h-7 bg-gray-800/80 rounded-xs"></div>
                      </div>
                      <div className="h-8 bg-white/40 rounded-xs"></div>
                    </div>
                    <p className="text-xs font-bold text-center text-[#1E293B]">Automatic</p>
                  </div>
                </div>
              </div>

              {/* 2. Accent Color */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-[#1E293B]">Accent Color</h4>
                <p className="text-[11px] text-[#64748B]">Choose accent colour of website</p>

                <div className="flex items-center space-x-3 pt-1">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setAccentColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full shadow-2xs transition-transform cursor-pointer ${
                        accentColor === c.hex
                          ? "ring-4 ring-[#FE9F43]/30 scale-110"
                          : "hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 3. Expand Sidebar */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Expand Sidebar</h4>
                  <p className="text-[11px] text-[#64748B]">Choose sidebar expand behaviour</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expandSidebar}
                    onChange={() => setExpandSidebar(!expandSidebar)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                </label>
              </div>

              {/* 4. Sidebar Size */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Sidebar Size</h4>
                  <p className="text-[11px] text-[#64748B]">Select size of the sidebar to display</p>
                </div>
                <div className="relative min-w-[200px]">
                  <select
                    value={sidebarSize}
                    onChange={(e) => setSidebarSize(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                  >
                    <option value="Small - 85px">Small - 85px</option>
                    <option value="Medium - 200px">Medium - 200px</option>
                    <option value="Large - 260px">Large - 260px</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 5. Font Family */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Font Family</h4>
                  <p className="text-[11px] text-[#64748B]">Select font family of website</p>
                </div>
                <div className="relative min-w-[200px]">
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                  >
                    <option value="Nunito">Nunito</option>
                    <option value="Inter">Inter</option>
                    <option value="Prompt">Prompt</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 p-5 bg-white border-t border-[#F1F3F5]">
              <button
                type="button"
                onClick={() => showFeedback("Cancelled changes")}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

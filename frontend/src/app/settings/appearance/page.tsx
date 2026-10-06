"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  AppearanceSettings,
  getAppearanceSettingsApi,
  updateAppearanceSettingsApi,
} from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Palette,
  Sun,
  Moon,
  Monitor,
  Layout,
  Type,
  Check,
  Save,
  Loader2,
} from "lucide-react";

export default function AppearanceSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<AppearanceSettings>({
    theme: "light",
    accentColor: "#FE9F43",
    expandSidebar: true,
    sidebarSize: "Small - 85px",
    fontFamily: "Nunito",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAppearanceSettingsApi();
      setFormData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load appearance settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateAppearanceSettingsApi(formData);
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save appearance settings");
    } finally {
      setSaving(false);
    }
  };

  const accentColors = [
    { name: "Warm Orange", hex: "#FE9F43", bg: "bg-[#FE9F43]" },
    { name: "Royal Purple", hex: "#7367F0", bg: "bg-[#7367F0]" },
    { name: "Cyan Teal", hex: "#00CFE8", bg: "bg-[#00CFE8]" },
    { name: "Emerald Green", hex: "#10B981", bg: "bg-[#10B981]" },
    { name: "Rose Pink", hex: "#F43F5E", bg: "bg-[#F43F5E]" },
    { name: "Deep Indigo", hex: "#6366F1", bg: "bg-[#6366F1]" },
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Appearance & Theme</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Customize application colors, typography, and sidebar layout</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
            </button>
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <SettingsSidebar />

          <div className="flex-1 w-full">
            {loading ? (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-12 flex flex-col items-center justify-center shadow-xs">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading appearance preferences...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]">Theme & Interface Customization</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">Personalize the look and feel for your workspace</p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Changes..." : "Save Appearance"}</span>
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Theme Mode */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Color Theme Mode</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Light */}
                      <div
                        onClick={() => setFormData({ ...formData, theme: "light" })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.theme === "light"
                            ? "border-[#FE9F43] bg-orange-50/30 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Sun className="w-4 h-4" />
                          </div>
                          {formData.theme === "light" && (
                            <div className="w-5 h-5 rounded-full bg-[#FE9F43] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">Light Theme</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">Clean, bright white background for daylight work</p>
                      </div>

                      {/* Dark */}
                      <div
                        onClick={() => setFormData({ ...formData, theme: "dark" })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.theme === "dark"
                            ? "border-[#FE9F43] bg-gray-900 text-white shadow-xs"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-800 text-gray-200 flex items-center justify-center">
                            <Moon className="w-4 h-4" />
                          </div>
                          {formData.theme === "dark" && (
                            <div className="w-5 h-5 rounded-full bg-[#FE9F43] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <h4 className={`text-xs font-bold ${formData.theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Dark Theme
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${formData.theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          High contrast dark mode to reduce eye strain
                        </p>
                      </div>

                      {/* System Auto */}
                      <div
                        onClick={() => setFormData({ ...formData, theme: "auto" })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.theme === "auto"
                            ? "border-[#FE9F43] bg-orange-50/30 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Monitor className="w-4 h-4" />
                          </div>
                          {formData.theme === "auto" && (
                            <div className="w-5 h-5 rounded-full bg-[#FE9F43] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">System Auto</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">Automatically syncs with OS dark/light mode</p>
                      </div>
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Palette className="w-4 h-4 text-purple-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Primary Accent Color</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {accentColors.map((col) => (
                        <div
                          key={col.hex}
                          onClick={() => setFormData({ ...formData, accentColor: col.hex })}
                          className={`p-3 rounded-xl border cursor-pointer flex flex-col items-center justify-center space-y-2 transition-all ${
                            formData.accentColor === col.hex
                              ? "border-gray-900 ring-2 ring-orange-500/30 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full ${col.bg} flex items-center justify-center text-white shadow-2xs`}>
                            {formData.accentColor === col.hex && <Check className="w-4 h-4" />}
                          </div>
                          <span className="text-[11px] font-semibold text-gray-800 text-center">{col.name}</span>
                          <span className="text-[9px] font-mono text-gray-400">{col.hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layout & Typography */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Layout className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Layout & Typography</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Font Family</label>
                        <SearchableSelect
                          options={[
                            { value: "Nunito", label: "Nunito (Default POS Font)" },
                            { value: "Inter", label: "Inter (Modern Sans)" },
                            { value: "Sarabun", label: "Sarabun (Clean Thai/Eng)" },
                            { value: "Prompt", label: "Prompt (Modern Thai)" },
                            { value: "Roboto", label: "Roboto" },
                          ]}
                          value={formData.fontFamily}
                          onChange={(val) => setFormData({ ...formData, fontFamily: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sidebar Width</label>
                        <SearchableSelect
                          options={[
                            { value: "Small - 85px", label: "Compact Icon Mode (85px)" },
                            { value: "Medium - 240px", label: "Standard Expanded (240px)" },
                            { value: "Large - 280px", label: "Spacious Full (280px)" },
                          ]}
                          value={formData.sidebarSize}
                          onChange={(val) => setFormData({ ...formData, sidebarSize: val })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-xs font-semibold text-gray-800">Auto Expand Sidebar on Hover</span>
                        <p className="text-[11px] text-gray-500">Automatically expand the navigation menu when hovering over icons</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.expandSidebar}
                          onChange={(e) => setFormData({ ...formData, expandSidebar: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={loadData}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Changes..." : "Save Appearance"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Edit Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Appearance Updated!</h3>
            <p className="text-xs text-gray-500 mb-6">Theme, accent colors, and layout preferences have been saved.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Operation Failed</h3>
            <p className="text-xs text-gray-500 mb-6">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

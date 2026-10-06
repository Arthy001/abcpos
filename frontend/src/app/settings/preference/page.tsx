"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  PreferenceSettings,
  getPreferenceSettingsApi,
  updatePreferenceSettingsApi,
} from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ScanLine,
  Printer,
  Volume2,
  Monitor,
  Package,
  Percent,
  Calculator,
  Save,
  Loader2,
  ShieldAlert,
} from "lucide-react";

export default function PreferenceSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<PreferenceSettings>({
    maintenanceMode: false,
    allowNegativeStock: false,
    enableBarcodeScanner: true,
    autoPrintReceipt: true,
    enableSoundEffects: true,
    enableCustomerDisplay: false,
    stockAlertThreshold: 5,
    orderPrefix: "ORD-",
    enableDiscountPerItem: true,
    enableTaxCalculation: true,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPreferenceSettingsApi();
      setFormData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load preferences");
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
      await updatePreferenceSettingsApi(formData);
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">System Preferences</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Control operational rules, POS hardware triggers, and business automation</p>
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
                <p className="text-sm font-medium text-gray-500">Loading system preferences...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]">Operational Behavior & Rules</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">Toggle global functionality for POS registers and inventory checks</p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Changes..." : "Save Preferences"}</span>
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* POS Hardware & Register Automations */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Sliders className="w-4 h-4 text-orange-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">POS Register & Checkout Triggers</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Barcode Scanner */}
                      <div className="flex items-start justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                            <ScanLine className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900">Barcode Scanner Active</span>
                            <p className="text-[11px] text-gray-500 mt-0.5">Allow automatic item addition on USB/Bluetooth barcode scan</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.enableBarcodeScanner}
                            onChange={(e) => setFormData({ ...formData, enableBarcodeScanner: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                        </label>
                      </div>

                      {/* Auto Print Receipt */}
                      <div className="flex items-start justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Printer className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900">Auto Print Receipt</span>
                            <p className="text-[11px] text-gray-500 mt-0.5">Automatically trigger thermal print slip upon completing payment</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.autoPrintReceipt}
                            onChange={(e) => setFormData({ ...formData, autoPrintReceipt: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                        </label>
                      </div>

                      {/* Sound Effects */}
                      <div className="flex items-start justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Volume2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900">POS Sound Effects</span>
                            <p className="text-[11px] text-gray-500 mt-0.5">Play audible beep on item add, error alerts, and successful checkout</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.enableSoundEffects}
                            onChange={(e) => setFormData({ ...formData, enableSoundEffects: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                        </label>
                      </div>

                      {/* Customer Secondary Display */}
                      <div className="flex items-start justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Monitor className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900">Customer Dual Display</span>
                            <p className="text-[11px] text-gray-500 mt-0.5">Broadcast cart items and total amount to second screen for shoppers</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.enableCustomerDisplay}
                            onChange={(e) => setFormData({ ...formData, enableCustomerDisplay: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Stock & Sales Rules */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Package className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Inventory Rules & Stock Controls</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Allow Negative Stock */}
                      <div className="flex items-start justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-xs font-bold text-gray-900">Allow Negative Stock</span>
                          <p className="text-[11px] text-gray-500 mt-0.5">Permit sales even when item inventory count reaches zero</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.allowNegativeStock}
                            onChange={(e) => setFormData({ ...formData, allowNegativeStock: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                        </label>
                      </div>

                      {/* Stock Alert Threshold */}
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-900 mb-1">Low Stock Alert Threshold (Qty)</label>
                        <p className="text-[11px] text-gray-500 mb-2">Show warning badges when stock falls below this quantity</p>
                        <input
                          type="number"
                          min={0}
                          value={formData.stockAlertThreshold}
                          onChange={(e) => setFormData({ ...formData, stockAlertThreshold: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculations & Discounts */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Percent className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Discounts & Tax Calculation</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Discount per Item */}
                      <div className="flex items-start justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Percent className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900">Per-Item Custom Discount</span>
                            <p className="text-[11px] text-gray-500 mt-0.5">Allow cashiers to apply individual discount on specific lines in POS</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.enableDiscountPerItem}
                            onChange={(e) => setFormData({ ...formData, enableDiscountPerItem: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                        </label>
                      </div>

                      {/* Tax Calculation */}
                      <div className="flex items-start justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Calculator className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900">Auto Tax Calculation (VAT)</span>
                            <p className="text-[11px] text-gray-500 mt-0.5">Automatically calculate sales VAT based on branch tax configuration</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.enableTaxCalculation}
                            onChange={(e) => setFormData({ ...formData, enableTaxCalculation: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Mode Alert */}
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-amber-900">Maintenance Mode (Store Lock)</span>
                        <p className="text-[11px] text-amber-700">When enabled, only administrators can access the system. POS terminals will be paused.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                      <input
                        type="checkbox"
                        checked={formData.maintenanceMode}
                        onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={loadData}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Preferences..." : "Save Preferences"}</span>
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
            <h3 className="text-base font-bold text-gray-900 mb-1">Preferences Updated!</h3>
            <p className="text-xs text-gray-500 mb-6">System operational rules and hardware triggers have been saved.</p>
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

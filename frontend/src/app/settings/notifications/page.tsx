"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
} from "lucide-react";
import {
  UserNotificationSettings,
  getNotificationSettingsApi,
  updateNotificationSettingsApi,
} from "@/lib/api";

interface NotificationMatrixRow {
  key: string;
  label: string;
  description: string;
  push: boolean;
  sms: boolean;
  email: boolean;
}

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Top level channel master switches
  const [mobilePush, setMobilePush] = useState(true);
  const [desktop, setDesktop] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  // Matrix table rows matching screenshot & business features
  const [matrix, setMatrix] = useState<NotificationMatrixRow[]>([
    {
      key: "payment",
      label: "Payment & Settlement",
      description: "Receive alert when customer pays via POS, QR, or Card",
      push: true,
      sms: true,
      email: true,
    },
    {
      key: "transaction",
      label: "New Orders & Transactions",
      description: "Alerts when new POS sales or online orders are created",
      push: true,
      sms: false,
      email: true,
    },
    {
      key: "low_stock",
      label: "Low Stock & Reorder Alert",
      description: "Notify inventory manager when product stock falls below threshold",
      push: true,
      sms: true,
      email: true,
    },
    {
      key: "invoices",
      label: "Invoice & Billing Status",
      description: "Overdue invoice reminders and payment due notifications",
      push: false,
      sms: true,
      email: true,
    },
    {
      key: "otp",
      label: "Security & Login OTP",
      description: "Two-factor verification codes and unauthorized login attempts",
      push: true,
      sms: true,
      email: true,
    },
    {
      key: "weekly_reports",
      label: "Weekly Business Summary",
      description: "Executive sales, revenue, and profit summaries sent weekly",
      push: false,
      sms: false,
      email: true,
    },
  ]);

  // Feedback modals
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificationSettingsApi();
      setMobilePush(data.pushAlerts);
      setDesktop(data.pushAlerts);
      setEmailNotif(data.emailAlerts);
      setSmsNotif(data.smsAlerts);

      // Synchronize matrix with database fields
      setMatrix((prev) =>
        prev.map((row) => {
          if (row.key === "payment") {
            return { ...row, push: data.paymentAlerts, email: data.paymentAlerts, sms: data.paymentAlerts && data.smsAlerts };
          }
          if (row.key === "transaction") {
            return { ...row, push: data.newOrderAlerts, email: data.newOrderAlerts };
          }
          if (row.key === "low_stock") {
            return { ...row, push: data.lowStockAlerts, email: data.lowStockAlerts, sms: data.lowStockAlerts && data.smsAlerts };
          }
          if (row.key === "invoices") {
            return { ...row, push: data.invoicesAlerts, email: data.invoicesAlerts };
          }
          if (row.key === "weekly_reports") {
            return { ...row, email: data.weeklyReports };
          }
          return row;
        })
      );
      setIsDirty(false);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Failed to load notification settings");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ─── Matrix Toggle ─────────────────────────────────────────────────────────
  const handleToggleMatrix = (key: string, channel: "push" | "sms" | "email") => {
    setMatrix((prev) =>
      prev.map((row) => {
        if (row.key === key) {
          return { ...row, [channel]: !row[channel] };
        }
        return row;
      })
    );
    setIsDirty(true);
  };

  // ─── Save Settings ─────────────────────────────────────────────────────────
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const paymentRow = matrix.find((m) => m.key === "payment");
      const orderRow = matrix.find((m) => m.key === "transaction");
      const stockRow = matrix.find((m) => m.key === "low_stock");
      const invoiceRow = matrix.find((m) => m.key === "invoices");
      const weeklyRow = matrix.find((m) => m.key === "weekly_reports");

      const payload: Partial<UserNotificationSettings> = {
        pushAlerts: mobilePush || desktop,
        emailAlerts: emailNotif,
        smsAlerts: smsNotif,
        paymentAlerts: Boolean(paymentRow?.push || paymentRow?.email || paymentRow?.sms),
        newOrderAlerts: Boolean(orderRow?.push || orderRow?.email || orderRow?.sms),
        lowStockAlerts: Boolean(stockRow?.push || stockRow?.email || stockRow?.sms),
        invoicesAlerts: Boolean(invoiceRow?.push || invoiceRow?.email || invoiceRow?.sms),
        weeklyReports: Boolean(weeklyRow?.email || weeklyRow?.push),
      };

      await updateNotificationSettingsApi(payload);
      setIsDirty(false);
      setFeedbackMsg("Notification preferences have been saved successfully.");
      setFeedbackType("success");
    } catch (err: any) {
      setFeedbackMsg(err.message || "Failed to save notification settings");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your notification channels and alert preferences</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadSettings}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: Notification */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Notification Preferences</h2>
                {isDirty && <p className="text-[10px] text-amber-600 mt-0.5">● Unsaved changes</p>}
              </div>
              {loading && <span className="text-xs text-[#94A3B8]">Loading preferences...</span>}
            </div>

            <div className="p-6 space-y-6">
              {/* Top 4 General Channel Master Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-[#F1F3F5]">
                {/* Mobile Push Notifications */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1E293B] block">Mobile Push</span>
                      <span className="text-[10px] text-[#64748B]">Push to mobile POS app</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={mobilePush}
                      onChange={() => {
                        setMobilePush(!mobilePush);
                        setIsDirty(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>

                {/* Desktop Notifications */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1E293B] block">Desktop Alerts</span>
                      <span className="text-[10px] text-[#64748B]">Browser notifications</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={desktop}
                      onChange={() => {
                        setDesktop(!desktop);
                        setIsDirty(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1E293B] block">Email Alerts</span>
                      <span className="text-[10px] text-[#64748B]">Daily summaries & receipts</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={() => {
                        setEmailNotif(!emailNotif);
                        setIsDirty(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1E293B] block">SMS Alerts</span>
                      <span className="text-[10px] text-[#64748B]">Direct cellular SMS</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={smsNotif}
                      onChange={() => {
                        setSmsNotif(!smsNotif);
                        setIsDirty(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>
              </div>

              {/* Notification Matrix Table */}
              <div>
                <div className="mb-3">
                  <h3 className="text-xs font-bold text-[#1E293B]">Event Channel Matrix</h3>
                  <p className="text-[11px] text-[#64748B]">Select specific delivery channels for each business event</p>
                </div>

                <div className="overflow-x-auto border border-[#F1F3F5] rounded-xl">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#F8F9FA]/80">
                      <tr>
                        <th className="py-3.5 px-4 font-bold text-[#111827]">Business Event</th>
                        <th className="py-3.5 px-4 font-bold text-[#111827] text-center w-28">Push</th>
                        <th className="py-3.5 px-4 font-bold text-[#111827] text-center w-28">SMS</th>
                        <th className="py-3.5 px-4 font-bold text-[#111827] text-center w-28">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8F9FA]">
                      {matrix.map((row) => (
                        <tr key={row.key} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#1E293B] block">{row.label}</span>
                            <span className="text-[11px] text-[#64748B]">{row.description}</span>
                          </td>

                          {/* Push Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={row.push}
                                onChange={() => handleToggleMatrix(row.key, "push")}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#28C76F]"></div>
                            </label>
                          </td>

                          {/* SMS Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={row.sms}
                                onChange={() => handleToggleMatrix(row.key, "sms")}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#28C76F]"></div>
                            </label>
                          </td>

                          {/* Email Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={row.email}
                                onChange={() => handleToggleMatrix(row.key, "email")}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#28C76F]"></div>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 p-5 bg-white border-t border-[#F1F3F5]">
              <button
                type="button"
                onClick={loadSettings}
                disabled={!isDirty || saving}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving || loading}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Preferences"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Feedback Modals (GEMINI.md Standards) ────────────────────────────── */}
      {/* Success Modal (Blue CheckCircle2) */}
      {feedbackType === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Preferences Saved!</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal (Rose AlertTriangle) */}
      {feedbackType === "error" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Operation Failed</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

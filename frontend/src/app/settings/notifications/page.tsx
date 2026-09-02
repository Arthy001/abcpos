"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

interface NotificationMatrixRow {
  key: string;
  label: string;
  push: boolean;
  sms: boolean;
  email: boolean;
}

export default function NotificationSettingsPage() {
  // Top level toggles matching screenshot
  const [mobilePush, setMobilePush] = useState(true);
  const [desktop, setDesktop] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [msmsNotif, setMsmsNotif] = useState(true);

  // Matrix table rows matching screenshot
  const [matrix, setMatrix] = useState<NotificationMatrixRow[]>([
    { key: "payment", label: "Payment", push: true, sms: true, email: true },
    { key: "transaction", label: "Transaction", push: true, sms: true, email: true },
    { key: "email_verification", label: "Email Verification", push: true, sms: true, email: true },
    { key: "otp", label: "OTP", push: true, sms: true, email: true },
    { key: "activity", label: "Activity", push: true, sms: true, email: true },
    { key: "account", label: "Account", push: true, sms: true, email: true },
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggleMatrix = (key: string, channel: "push" | "sms" | "email") => {
    setMatrix((prev) =>
      prev.map((row) => {
        if (row.key === key) {
          const newVal = !row[channel];
          return { ...row, [channel]: newVal };
        }
        return row;
      })
    );
    showFeedback("Notification preference updated");
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
              onClick={() => showFeedback("Notification settings refreshed")}
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

          {/* Right Content Panel: Notification */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Notification</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Top 4 General Toggles */}
              <div className="space-y-4 pb-6 border-b border-[#F1F3F5]">
                {/* Mobile Push Notifications */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1E293B]">Mobile Push Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mobilePush}
                      onChange={() => {
                        setMobilePush(!mobilePush);
                        showFeedback("Mobile Push Notifications updated");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>

                {/* Desktop Notifications */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1E293B]">Desktop Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={desktop}
                      onChange={() => {
                        setDesktop(!desktop);
                        showFeedback("Desktop Notifications updated");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1E293B]">Email Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={() => {
                        setEmailNotif(!emailNotif);
                        showFeedback("Email Notifications updated");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>

                {/* MSMS Notifications */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1E293B]">MSMS Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={msmsNotif}
                      onChange={() => {
                        setMsmsNotif(!msmsNotif);
                        showFeedback("MSMS Notifications updated");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>
              </div>

              {/* Notification Matrix Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-left text-xs min-w-[850px]">
                  <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#F8F9FA]/60">
                    <tr>
                      <th className="py-3 px-4 font-bold text-[#111827]">General Notification</th>
                      <th className="py-3 px-4 font-bold text-[#111827] text-center w-28">Push</th>
                      <th className="py-3 px-4 font-bold text-[#111827] text-center w-28">SMS</th>
                      <th className="py-3 px-4 font-bold text-[#111827] text-center w-28">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F9FA]">
                    {matrix.map((row) => (
                      <tr key={row.key} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#1E293B]">{row.label}</td>

                        {/* Push Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={row.push}
                              onChange={() => handleToggleMatrix(row.key, "push")}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

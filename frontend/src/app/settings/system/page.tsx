"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  Wrench,
  CheckCircle2,
} from "lucide-react";

interface SystemIntegrationItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: "captcha" | "analytics" | "adsense" | "maps";
}

export default function SystemSettingsPage() {
  const [integrations, setIntegrations] = useState<SystemIntegrationItem[]>([
    {
      id: "1",
      name: "Google Captcha",
      description: "Captcha helps protect you from spam and password decryption",
      enabled: true,
      type: "captcha",
    },
    {
      id: "2",
      name: "Google Analytics",
      description: "Provides statistics and basic analytical tools for SEO and marketing purposes.",
      enabled: true,
      type: "analytics",
    },
    {
      id: "3",
      name: "Google Adsense Code",
      description: "Provides a way for publishers to earn money from their online content.",
      enabled: true,
      type: "adsense",
    },
    {
      id: "4",
      name: "Google Map",
      description: "Provides detailed information about geographical regions and sites worldwide.",
      enabled: true,
      type: "maps",
    },
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggle = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.enabled;
          showFeedback(`${item.name} is now ${next ? "Enabled" : "Disabled"}`);
          return { ...item, enabled: next };
        }
        return item;
      })
    );
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "captcha":
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5zm1.5-6.5a2.5 2.5 0 0 0-5 0h-2a4.5 4.5 0 1 1 7.2 3.6l-.7.7a1 1 0 0 0-.5.7h-2a3 3 0 0 1 1.5-2.5l.8-.7A2.5 2.5 0 0 0 14.5 10z" />
            </svg>
          </div>
        );
      case "analytics":
        return (
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
        );
      case "adsense":
        return (
          <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
            </svg>
          </div>
        );
      case "maps":
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
          </div>
        );
    }
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
              onClick={() => showFeedback("System settings refreshed")}
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

          {/* Right Content Panel: System Settings */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">System Settings</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {integrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl border border-[#E9ECEF] bg-white hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
                  >
                    {/* Top Row: Icon + Title + Switch */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {renderIcon(item.type)}
                        <h3 className="text-xs font-bold text-[#1E293B]">{item.name}</h3>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleToggle(item.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                      </label>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-[#64748B] min-h-[32px] leading-relaxed">
                      {item.description}
                    </p>

                    {/* Bottom Row: View Integration Button */}
                    <div className="pt-1">
                      <button
                        onClick={() => showFeedback(`Integration settings for ${item.name}`)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[#1E293B] hover:bg-gray-50 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>View Integration</span>
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

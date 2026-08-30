"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  Wrench,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

interface SocialAuthItem {
  id: string;
  name: string;
  connected: boolean;
  description: string;
  buttonLabel: "View Integration" | "Connect Now";
  type: "facebook" | "twitter" | "linkedin" | "google";
}

export default function SocialAuthSettingsPage() {
  const [socials, setSocials] = useState<SocialAuthItem[]>([
    {
      id: "1",
      name: "Facebook",
      connected: true,
      description: "Connect with friends, family and share updates, photos, moments with people you know.",
      buttonLabel: "View Integration",
      type: "facebook",
    },
    {
      id: "2",
      name: "Twitter",
      connected: false,
      description: "Communicate and stay connected through the exchange of quick, frequent messages",
      buttonLabel: "View Integration",
      type: "twitter",
    },
    {
      id: "3",
      name: "Linkedin",
      connected: true,
      description: "Network with people and professional organizations in your industry.",
      buttonLabel: "Connect Now",
      type: "linkedin",
    },
    {
      id: "4",
      name: "Google",
      connected: true,
      description: "Google has many special features to help you find exactly what you're looking for.",
      buttonLabel: "View Integration",
      type: "google",
    },
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggle = (id: string) => {
    setSocials((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.connected;
          showFeedback(`${item.name} is now ${next ? "Connected" : "Disconnected"}`);
          return { ...item, connected: next };
        }
        return item;
      })
    );
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "facebook":
        return (
          <div className="w-10 h-10 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-xl">
            f
          </div>
        );
      case "twitter":
        return (
          <div className="w-10 h-10 rounded-lg bg-[#1DA1F2] text-white flex items-center justify-center">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
          </div>
        );
      case "linkedin":
        return (
          <div className="w-10 h-10 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-base">
            in
          </div>
        );
      case "google":
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-2xs flex items-center justify-center font-bold text-base">
            <span className="text-blue-500">G</span>
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
              onClick={() => showFeedback("Social authentication refreshed")}
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

          {/* Right Content Panel: Social Authentication */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Social Authentication</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {socials.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl border border-[#E9ECEF] bg-white hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
                  >
                    {/* Top Row: Icon + Name + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {renderIcon(item.type)}
                        <h3 className="text-xs font-bold text-[#1E293B]">{item.name}</h3>
                      </div>

                      {item.connected ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-[#28C76F] border border-[#28C76F]/40 bg-white">
                          Connected
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-[#64748B] border border-gray-200 bg-gray-50">
                          Not Connected
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-[#64748B] min-h-[32px] leading-relaxed">
                      {item.description}
                    </p>

                    {/* Bottom Row: Action Button + Switch Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => showFeedback(`Action for ${item.name}`)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[#1E293B] hover:bg-gray-50 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        {item.buttonLabel === "Connect Now" ? (
                          <LinkIcon className="w-3.5 h-3.5 text-[#64748B]" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5 text-[#64748B]" />
                        )}
                        <span>{item.buttonLabel}</span>
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.connected}
                          onChange={() => handleToggle(item.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                      </label>
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

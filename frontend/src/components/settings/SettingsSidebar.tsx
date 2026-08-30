"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Globe,
  Smartphone,
  Monitor,
  DollarSign,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function SettingsSidebar() {
  const pathname = usePathname();

  const isGeneralActive =
    pathname === "/settings" ||
    pathname === "/settings/profile" ||
    pathname === "/settings/security" ||
    pathname === "/settings/notifications" ||
    pathname === "/settings/connected-apps";

  const isWebsiteActive =
    pathname.startsWith("/settings/system") ||
    pathname.startsWith("/settings/company") ||
    pathname.startsWith("/settings/localization") ||
    pathname.startsWith("/settings/prefixes") ||
    pathname.startsWith("/settings/preference") ||
    pathname.startsWith("/settings/appearance") ||
    pathname.startsWith("/settings/social-auth") ||
    pathname.startsWith("/settings/social-authentication") ||
    pathname.startsWith("/settings/language");

  const isAppActive =
    pathname.startsWith("/settings/invoice-settings") ||
    pathname.startsWith("/settings/invoice-templates") ||
    pathname.startsWith("/settings/printer") ||
    pathname.startsWith("/settings/pos-settings") ||
    pathname.startsWith("/settings/signatures") ||
    pathname.startsWith("/settings/custom-fields");

  const isSystemActive =
    pathname.startsWith("/settings/email") ||
    pathname.startsWith("/settings/sms") ||
    pathname.startsWith("/settings/otp");

  const isFinancialActive =
    pathname.startsWith("/settings/payment-gateway") ||
    pathname.startsWith("/settings/payments") ||
    pathname.startsWith("/settings/bank-accounts") ||
    pathname.startsWith("/settings/tax-rates") ||
    pathname.startsWith("/settings/tax") ||
    pathname.startsWith("/settings/currencies") ||
    pathname.startsWith("/settings/currency");

  const [generalOpen, setGeneralOpen] = useState<boolean>(isGeneralActive);
  const [websiteOpen, setWebsiteOpen] = useState<boolean>(isWebsiteActive);
  const [appOpen, setAppOpen] = useState<boolean>(isAppActive);
  const [systemOpen, setSystemOpen] = useState<boolean>(isSystemActive);
  const [financialOpen, setFinancialOpen] = useState<boolean>(isFinancialActive || true);
  const [otherOpen, setOtherOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isGeneralActive) setGeneralOpen(true);
    if (isWebsiteActive) setWebsiteOpen(true);
    if (isAppActive) setAppOpen(true);
    if (isSystemActive) setSystemOpen(true);
    if (isFinancialActive) setFinancialOpen(true);
  }, [pathname, isGeneralActive, isWebsiteActive, isAppActive, isSystemActive, isFinancialActive]);

  // General items
  const isProfileActive = pathname === "/settings" || pathname === "/settings/profile";
  const isSecurityActive = pathname === "/settings/security";
  const isNotificationsActive = pathname === "/settings/notifications";
  const isConnectedAppsActive = pathname === "/settings/connected-apps";

  // Website items
  const isWebsiteSystemActive = pathname === "/settings/system";
  const isCompanyActive = pathname === "/settings/company";
  const isLocalizationActive = pathname === "/settings/localization";
  const isPrefixesActive = pathname === "/settings/prefixes";
  const isPreferenceActive = pathname === "/settings/preference";
  const isAppearanceActive = pathname === "/settings/appearance";
  const isSocialAuthActive = pathname === "/settings/social-auth" || pathname === "/settings/social-authentication";
  const isLanguageActive = pathname === "/settings/language";

  // App items
  const isInvoiceSettingsActive = pathname === "/settings/invoice-settings";
  const isInvoiceTemplatesActive = pathname === "/settings/invoice-templates";
  const isPrinterActive = pathname === "/settings/printer";
  const isPosSettingsActive = pathname === "/settings/pos-settings";
  const isSignaturesActive = pathname === "/settings/signatures";
  const isCustomFieldsActive = pathname === "/settings/custom-fields";

  // System items
  const isEmailActive = pathname === "/settings/email";
  const isSmsActive = pathname === "/settings/sms";
  const isOtpActive = pathname === "/settings/otp";

  // Financial items
  const isPaymentGatewayActive = pathname === "/settings/payment-gateway" || pathname === "/settings/payments";
  const isBankAccountsActive = pathname === "/settings/bank-accounts";
  const isTaxRatesActive = pathname === "/settings/tax-rates" || pathname === "/settings/tax";
  const isCurrenciesActive = pathname === "/settings/currencies" || pathname === "/settings/currency";

  return (
    <div className="w-full lg:w-64 bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-4 shrink-0 self-start">
      <h2 className="text-sm font-bold text-[#1E293B] mb-3 px-2">Settings</h2>

      <div className="space-y-1">
        {/* 1. General Settings */}
        <div>
          <button
            onClick={() => setGeneralOpen(!generalOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4 h-4 text-[#64748B]" />
              <span>General Settings</span>
            </div>
            {generalOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </button>

          {generalOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <Link
                href="/settings/profile"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isProfileActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Profile</span>
                {isProfileActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/security"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isSecurityActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Security</span>
                {isSecurityActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/notifications"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isNotificationsActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Notifications</span>
                {isNotificationsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/connected-apps"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isConnectedAppsActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Connected Apps</span>
                {isConnectedAppsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>
            </div>
          )}
        </div>

        {/* 2. Website Settings */}
        <div>
          <button
            onClick={() => setWebsiteOpen(!websiteOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Globe className="w-4 h-4 text-[#64748B]" />
              <span>Website Settings</span>
            </div>
            {websiteOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </button>

          {websiteOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <Link
                href="/settings/system"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isWebsiteSystemActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>System Settings</span>
                {isWebsiteSystemActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/company"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isCompanyActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Company Settings</span>
                {isCompanyActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/localization"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isLocalizationActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Localization</span>
                {isLocalizationActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/prefixes"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isPrefixesActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Prefixes</span>
                {isPrefixesActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/preference"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isPreferenceActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Preference</span>
                {isPreferenceActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/appearance"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isAppearanceActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Appearance</span>
                {isAppearanceActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/social-auth"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isSocialAuthActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Social Authentication</span>
                {isSocialAuthActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/language"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isLanguageActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Language</span>
                {isLanguageActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>
            </div>
          )}
        </div>

        {/* 3. App Settings */}
        <div>
          <button
            onClick={() => setAppOpen(!appOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-[#64748B]" />
              <span>App Settings</span>
            </div>
            {appOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </button>

          {appOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <Link
                href="/settings/invoice-settings"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isInvoiceSettingsActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Invoice Settings</span>
                {isInvoiceSettingsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/invoice-templates"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isInvoiceTemplatesActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Invoice Templates</span>
                {isInvoiceTemplatesActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/printer"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isPrinterActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Printer</span>
                {isPrinterActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/pos-settings"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isPosSettingsActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>POS</span>
                {isPosSettingsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/signatures"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isSignaturesActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Signatures</span>
                {isSignaturesActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/custom-fields"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isCustomFieldsActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Custom Fields</span>
                {isCustomFieldsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>
            </div>
          )}
        </div>

        {/* 4. System Settings */}
        <div>
          <button
            onClick={() => setSystemOpen(!systemOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Monitor className="w-4 h-4 text-[#64748B]" />
              <span>System Settings</span>
            </div>
            {systemOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </button>

          {systemOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <Link
                href="/settings/email"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isEmailActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Email</span>
                {isEmailActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/sms"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isSmsActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>SMS Gateway</span>
                {isSmsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/otp"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isOtpActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>OTP</span>
                {isOtpActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>
            </div>
          )}
        </div>

        {/* 5. Financial Settings */}
        <div>
          <button
            onClick={() => setFinancialOpen(!financialOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <DollarSign className="w-4 h-4 text-[#64748B]" />
              <span>Financial Settings</span>
            </div>
            {financialOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </button>

          {financialOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <Link
                href="/settings/payment-gateway"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isPaymentGatewayActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Payment Gateway</span>
                {isPaymentGatewayActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/bank-accounts"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isBankAccountsActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Bank Accounts</span>
                {isBankAccountsActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/tax-rates"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isTaxRatesActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Tax Rates</span>
                {isTaxRatesActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>

              <Link
                href="/settings/currencies"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isCurrenciesActive
                    ? "bg-[#FFF6EE] text-[#FE9F43] font-semibold"
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 font-normal"
                }`}
              >
                <span>Currencies</span>
                {isCurrenciesActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>}
              </Link>
            </div>
          )}
        </div>

        {/* 6. Other Settings */}
        <div>
          <button
            onClick={() => setOtherOpen(!otherOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Sliders className="w-4 h-4 text-[#64748B]" />
              <span>Other Settings</span>
            </div>
            {otherOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

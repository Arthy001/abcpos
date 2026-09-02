"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Eye,
  EyeOff,
  Shield,
  Warehouse,
  Store,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  warehouseName: string;
  storeName: string;
  avatar: string;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "3",
    name: "Michael Dawson",
    email: "michael@example.com",
    role: "Store Keeper",
    warehouseName: "Lavish Warehouse",
    storeName: "ElectroMart Main",
    avatar: "/assets/images/customer15.jpg",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "4",
    name: "Karen Flores",
    email: "karen@example.com",
    role: "Warehouse Supervisor",
    warehouseName: "Traditional Warehouse",
    storeName: "Apex Branch",
    avatar: "/assets/images/customer14.jpg",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "6",
    name: "Karen Galvan",
    email: "galvan@example.com",
    role: "Purchase Officer",
    warehouseName: "Lavish Warehouse",
    storeName: "ElectroMart Main",
    avatar: "/assets/images/customer16.jpg",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "2",
    name: "Jenny Ellis",
    email: "jenny@example.com",
    role: "Manager",
    warehouseName: "Traditional Warehouse",
    storeName: "Apex Branch",
    avatar: "/assets/images/customer12.jpg",
    color: "from-rose-500 to-pink-500",
  },
  {
    id: "5",
    name: "Leon Baxter",
    email: "leon@example.com",
    role: "Cashier",
    warehouseName: "Lavish Warehouse",
    storeName: "ElectroMart Main",
    avatar: "/assets/images/customer13.jpg",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "1",
    name: "Henry Bryant",
    email: "henry@example.com",
    role: "Admin (All)",
    warehouseName: "All Warehouses",
    storeName: "All Stores",
    avatar: "/assets/images/avatar-01.jpg",
    color: "from-slate-700 to-slate-900",
  },
];

export default function SignInPage() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount>(DEMO_ACCOUNTS[0]);
  const [password, setPassword] = useState<string>("12345678");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignIn = (e?: React.FormEvent, customAccount?: DemoAccount) => {
    if (e) e.preventDefault();
    const accountToUse = customAccount || selectedAccount;
    setIsLoading(true);

    try {
      useAuthStore.getState().setUser({
        id: accountToUse.id,
        name: accountToUse.name,
        email: accountToUse.email,
        role: accountToUse.role,
        warehouseName: accountToUse.warehouseName,
        storeName: accountToUse.storeName,
        avatar: accountToUse.avatar,
      });
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-gray-900 selection:bg-orange-100 selection:text-[#FE9F43]">
      {/* Left Column: Sign In Form & Fast Demo Account Selector */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 min-h-screen">
        <div className="w-full max-w-lg mx-auto space-y-6 my-auto">

          {/* Official Brand Logo */}
          <div className="flex items-center">
            <img
              src="/assets/images/abcposlogo.png"
              alt="ABCPOS Logo"
              className="h-10 sm:h-11 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/images/logo.svg";
              }}
            />
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sign In</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Select a demo user role or enter credentials to access ABCPOS.
            </p>
          </div>

          {/* Quick Demo Accounts Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-[#FE9F43] mr-1.5" />
                Quick Select Demo Account (คลิกเลือกบัญชีทดสอบ)
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedAccount.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setSelectedAccount(acc);
                      setPassword("12345678");
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-[#FE9F43] bg-orange-50/40 ring-2 ring-orange-200 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-xs truncate leading-tight">
                          {acc.name}
                        </p>
                        <span className="text-[10px] font-semibold text-[#FE9F43] block truncate">
                          {acc.role}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-gray-100/80 flex items-center justify-between text-[10px] text-gray-500">
                      <span className="truncate">{acc.warehouseName.replace(" Warehouse", "")}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-3 h-3 text-[#FE9F43] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selected User Card & Form */}
          <form onSubmit={(e) => handleSignIn(e)} className="space-y-4 pt-1">
            {/* Selected User Display Banner */}
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-2xs">
                  <img
                    src={selectedAccount.avatar}
                    alt={selectedAccount.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-gray-900 text-xs truncate">
                      {selectedAccount.name}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                      {selectedAccount.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono truncate">
                    {selectedAccount.email} • {selectedAccount.warehouseName}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                Ready
              </span>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-700">
                  Passcode / Password <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400 font-mono">Default: 12345678</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:border-transparent transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5 text-xs">
              <label className="flex items-center space-x-2 text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password recovery link sent to " + selectedAccount.email);
                }}
                className="text-[#FE9F43] hover:text-[#E88B32] font-semibold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#FE9F43] hover:bg-[#E88B32] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In as {selectedAccount.role}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Copyright */}
        <div className="text-center text-xs text-gray-400 pt-4">
          Copyright © 2026 DreamsPOS. All Rights Reserved.
        </div>
      </div>

      {/* Right Column: Hero Banner Image (matching DreamsPOS login banner) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-100 overflow-hidden">
        <img
          src="/assets/images/login-banner.jpg"
          alt="DreamsPOS Cashier"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}

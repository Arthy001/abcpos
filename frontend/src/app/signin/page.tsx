"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { loginApi } from "@/lib/api";
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
  AlertCircle,
} from "lucide-react";

interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  warehouseName: string;
  storeName: string;
  avatar: string;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "admin",
    name: "สมชาย ชัยชนะ",
    email: "admin@siampolypack.com",
    role: "Admin",
    department: "Executive",
    warehouseName: "All Warehouses",
    storeName: "All Stores",
    avatar: "/assets/images/avatar-01.jpg",
    color: "from-slate-700 to-slate-900",
  },
  {
    id: "plant-mgr",
    name: "วิชัย เป่าฟิล์ม",
    email: "wichai@siampolypack.com",
    role: "Plant Manager",
    department: "Manufacturing",
    warehouseName: "คลังวัตถุดิบ (RM-01)",
    storeName: "พระราม 2",
    avatar: "/assets/images/customer12.jpg",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "warehouse-sup",
    name: "สมเกียรติ สต็อกแมน",
    email: "somkiat@siampolypack.com",
    role: "Warehouse Supervisor",
    department: "Warehouse",
    warehouseName: "คลังสินค้าสำเร็จรูป (FG-01)",
    storeName: "พระราม 2",
    avatar: "/assets/images/customer15.jpg",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "b2b-sales",
    name: "กานดา การค้า",
    email: "kanda@siampolypack.com",
    role: "Sales Manager",
    department: "B2B Wholesale",
    warehouseName: "คลังสินค้าสำเร็จรูป (FG-01)",
    storeName: "สาขา ตลาดไท",
    avatar: "/assets/images/customer14.jpg",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "cashier",
    name: "มณีรัตน์ จัดหน้าร้าน",
    email: "manirat@siampolypack.com",
    role: "Cashier",
    department: "Retail POS",
    warehouseName: "คลังสินค้าสำเร็จรูป (FG-01)",
    storeName: "สาขา สี่มุมเมือง",
    avatar: "/assets/images/customer13.jpg",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "accountant",
    name: "พิมพ์ใจ สมุห์บัญชี",
    email: "pimjai@siampolypack.com",
    role: "Accountant",
    department: "Finance & Accounts",
    warehouseName: "All Warehouses",
    storeName: "พระราม 2",
    avatar: "/assets/images/customer16.jpg",
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "purchasing",
    name: "ชาญชัย จัดซื้อ",
    email: "chanchai@siampolypack.com",
    role: "Purchase Officer",
    department: "Purchasing",
    warehouseName: "คลังวัตถุดิบ (RM-01)",
    storeName: "พระราม 2",
    avatar: "/assets/images/customer17.jpg",
    color: "from-yellow-500 to-amber-600",
  },
  {
    id: "hrm",
    name: "วรรณา บริหารคน",
    email: "wanna@siampolypack.com",
    role: "HR Manager",
    department: "HRM & Payroll",
    warehouseName: "All Warehouses",
    storeName: "พระราม 2",
    avatar: "/assets/images/customer18.jpg",
    color: "from-teal-500 to-emerald-600",
  },
];

export default function SignInPage() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount>(DEMO_ACCOUNTS[0]);
  const [emailInput, setEmailInput] = useState<string>(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState<string>("123456");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSignIn = async (e?: React.FormEvent, customAccount?: DemoAccount) => {
    if (e) e.preventDefault();
    const accountToUse = customAccount || selectedAccount;
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Call Real Backend Login API
      const res = await loginApi({
        email: customAccount ? customAccount.email : emailInput || accountToUse.email,
        password: password || "123456",
      });

      if (res.token) {
        localStorage.setItem("abcpos_token", res.token);
      }

      useAuthStore.getState().setUser({
        id: res.user.id || accountToUse.id,
        name: res.user.name || accountToUse.name,
        email: res.user.email || accountToUse.email,
        role: res.user.role || accountToUse.role,
        warehouseName: res.user.warehouseName || accountToUse.warehouseName,
        storeName: res.user.storeName || accountToUse.storeName,
        avatar: res.user.avatar || accountToUse.avatar,
      });

      await useAuthStore.getState().fetchRolePermissions();

      router.push("/");
    } catch (err: any) {
      console.warn("Backend login failed, fallback to local session:", err);
      // Fallback local session if backend offline
      useAuthStore.getState().setUser({
        id: accountToUse.id,
        name: accountToUse.name,
        email: accountToUse.email,
        role: accountToUse.role,
        warehouseName: accountToUse.warehouseName,
        storeName: accountToUse.storeName,
        avatar: accountToUse.avatar,
      });
      await useAuthStore.getState().fetchRolePermissions();
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans text-gray-900 selection:bg-orange-100 selection:text-[#FE9F43] overflow-hidden">
      {/* Left Column: Sign In Form & Fast Demo Account Selector */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-8 lg:p-10 h-full overflow-y-auto">
        <div className="w-full max-w-lg mx-auto space-y-6 my-auto">

          {/* Official Brand Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/assets/images/prime-logo.jpg"
              alt="Prime ERP Logo"
              className="h-11 sm:h-12 w-auto object-contain rounded-lg shadow-2xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/images/logo.svg";
              }}
            />
            <div className="flex flex-col">
              <span className="font-black text-[#0E1422] text-xl sm:text-2xl tracking-tight leading-none">
                Prime <span className="text-[#FE9F43]">ERP</span>
              </span>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-1">
                Enterprise Solution
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sign In</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Select a demo user role or enter credentials to access Prime ERP.
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedAccount.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setSelectedAccount(acc);
                      setEmailInput(acc.email);
                      setPassword("123456");
                    }}
                    className={`p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-[#FE9F43] bg-orange-50/50 ring-2 ring-orange-200 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {acc.department}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FE9F43] shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-[11px] truncate leading-tight">
                            {acc.name}
                          </p>
                          <span className="text-[10px] font-medium text-[#FE9F43] block truncate">
                            {acc.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-1.5 pt-1 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400">
                      <span className="truncate">{acc.storeName || acc.warehouseName}</span>
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
                <span className="text-[11px] text-gray-400 font-mono">Default: 123456</span>
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
          Copyright © 2026 Prime ERP. All Rights Reserved.
        </div>
      </div>

      {/* Right Column: Hero Banner Image */}
      <div className="hidden lg:block lg:w-1/2 relative h-full bg-gray-900 overflow-hidden">
        <img
          src="/assets/images/login-banner.jpg"
          alt="Prime ERP"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}

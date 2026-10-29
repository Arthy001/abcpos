"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Store,
  ChevronDown,
  PlusCircle,
  Maximize,
  Mail,
  Bell,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Monitor,
  User,
  FileText,
  LogOut,
  Box,
  PackagePlus,
  ShoppingBag,
  ShoppingCart,
  FileSpreadsheet,
  RotateCcw,
  Users,
  Shield,
  UserCheck,
  Truck,
} from "lucide-react";

import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchSystemNotificationsApi, markNotificationAsReadApi, markAllNotificationsAsReadApi, SystemNotification } from "@/lib/api";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, onToggleSidebar }) => {
  const router = useRouter();
  const { topBarColor, isGradientTopBar } = useThemeStore();
  const { user, logout, isAdmin, canCreateProduct } = useAuthStore();
  const isDarkTopBar = topBarColor !== "#ffffff";

  const [mounted, setMounted] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [quickAddOpen, setQuickAddOpen] = useState<boolean>(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const userId = user?.id || "default-user";
    try {
      setLoadingNotifications(true);
      const res = await fetchSystemNotificationsApi(userId);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error("Notification load error:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadNotifications();
  }, [user?.id]);

  const handleToggleNotificationDropdown = () => {
    const nextState = !notificationDropdownOpen;
    setNotificationDropdownOpen(nextState);
    if (nextState) {
      loadNotifications();
    }
  };

  const handleNotificationClick = (n: SystemNotification) => {
    setNotificationDropdownOpen(false);
    if (!n.isRead) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationAsReadApi(n.id, user?.id || "default-user").catch((err) => {
        console.error("Failed to mark notification as read:", err);
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsAsReadApi(user?.id || "default-user");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setQuickAddOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    router.push("/signin");
  };

  return (
    <header
      style={{
        background: isGradientTopBar ? topBarColor : undefined,
        backgroundColor: !isGradientTopBar ? topBarColor : undefined,
      }}
      className={`h-16 border-b sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6 transition-colors duration-200 ${
        !isDarkTopBar ? "bg-white border-gray-100" : "border-white/10 text-white"
      }`}
    >
      {/* Left Section: A POS Logo, Circle Toggle Button (<< / >>), Search Bar */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
        {/* Brand Logo: ABCPOS */}
        <Link href="/" className="flex items-center space-x-2 mr-1 sm:mr-2 flex-shrink-0 group">
          <img
            src="/assets/images/abcposlogo.png"
            alt="ABCPOS Logo"
            className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/images/logo.svg";
            }}
          />
        </Link>

        {/* Circular Toggle Button (Orange << / >>) - Not hamburger */}
        <button
          onClick={onToggleSidebar}
          className="w-7 h-7 rounded-full bg-[#FE9F43] hover:bg-[#E88B32] text-white flex items-center justify-center shadow-xs transition-all active:scale-90 flex-shrink-0"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarOpen ? (
            <ChevronsLeft className="w-4 h-4" />
          ) : (
            <ChevronsRight className="w-4 h-4" />
          )}
        </button>

        {/* Search Bar with ⌘ K */}
        <div className="hidden md:flex items-center relative max-w-xs w-full ml-1">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-8 pr-12 py-1.5 bg-gray-50/80 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <div className="absolute right-2 top-1.5 flex items-center px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 font-mono shadow-2xs">
            ⌘ K
          </div>
        </div>
      </div>

      {/* Right Section: Store Pill, + Add New, POS Button, Utility Icons, User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Store Selector Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50/70 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold cursor-pointer hover:bg-emerald-100/60 transition-colors">
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          <span>{user?.storeName || "ElectroMart Main"}</span>
          <ChevronDown className="w-3 h-3 text-emerald-600 ml-0.5" />
        </div>

        {/* + Add New Button (Orange) & Quick Add Dropdown */}
        <div className="relative" ref={quickAddRef}>
          <button
            type="button"
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>

          {/* Quick Add Mega Menu Dropdown */}
          {quickAddOpen && (
            <div className="absolute right-0 sm:-right-20 top-full mt-2.5 w-[330px] sm:w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                {[
                  { label: "Category", href: "/categories", icon: Box, allowed: true },
                  { label: "Product", href: "/products/add", icon: PackagePlus, allowed: mounted ? canCreateProduct() : true },
                  { label: "Purchase", href: "/purchases", icon: ShoppingBag, allowed: true },
                  { label: "Sale", href: "/pos", icon: ShoppingCart, allowed: true },
                  { label: "Expense", href: "/finance/expenses", icon: FileText, allowed: true },
                  { label: "Quotation", href: "/quotations", icon: FileSpreadsheet, allowed: true },
                  { label: "Return", href: "/purchases/returns", icon: RotateCcw, allowed: true },
                  { label: "User", href: "/users", icon: User, allowed: mounted ? isAdmin() : true },
                  { label: "Customer", href: "/customers", icon: Users, allowed: true },
                  { label: "Biller", href: "/billers", icon: Shield, allowed: mounted ? (isAdmin() || user?.role?.toLowerCase() === "manager") : true },
                  { label: "Supplier", href: "/suppliers", icon: UserCheck, allowed: true },
                  { label: "Transfer", href: "/stock/transfer", icon: Truck, allowed: true },
                ].map((item) => {
                  const isAllowed = item.allowed !== false;
                  if (!isAllowed) {
                    return (
                      <div
                        key={item.label}
                        title="You do not have permission to access this action"
                        className="flex flex-col items-center justify-center p-2 rounded-xl opacity-35 cursor-not-allowed select-none text-center"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#F4F5F7] flex items-center justify-center text-gray-400 mb-1.5">
                          <item.icon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400 truncate max-w-full">
                          {item.label}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setQuickAddOpen(false)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-orange-50/50 transition-all group cursor-pointer text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#F4F5F7] group-hover:bg-[#FFF3E8] group-hover:scale-105 border border-transparent group-hover:border-[#FE9F43]/30 flex items-center justify-center text-gray-700 group-hover:text-[#FE9F43] transition-all shadow-2xs mb-1.5">
                        <item.icon className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 group-hover:text-gray-900 group-hover:font-semibold truncate max-w-full transition-colors">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* POS Button (Dark Navy) */}
        <Link
          href="/pos"
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Monitor className="w-3.5 h-3.5 text-orange-400" />
          <span>POS</span>
        </Link>

        {/* Language / US Flag */}
        <div className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer">
          <img
            src="/assets/images/english.svg"
            alt="English"
            className="w-5 h-5 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).innerText = "🇺🇸";
            }}
          />
        </div>

        {/* Fullscreen Icon */}
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 items-center justify-center transition-colors"
          title="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Email/Messages icon (hidden temporarily per user request) */}

        {/* Notifications Real Dropdown Center */}
        <div ref={notificationDropdownRef} className="relative">
          <button
            onClick={handleToggleNotificationDropdown}
            className="relative w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationDropdownOpen && (
            <div className="absolute right-0 sm:-right-12 mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-gray-900 text-sm">การแจ้งเตือนระบบ</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold">
                      {unreadCount} รายการใหม่
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] text-[#FE9F43] hover:underline font-semibold cursor-pointer"
                  >
                    อ่านทั้งหมด
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 py-1">
                {loadingNotifications ? (
                  <div className="py-8 text-center text-gray-400 flex flex-col items-center space-y-2">
                    <RotateCcw className="w-5 h-5 animate-spin text-[#FE9F43]" />
                    <span className="text-xs">กำลังโหลดการแจ้งเตือน...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 flex flex-col items-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <span className="text-xs font-medium">ไม่มีการแจ้งเตือนใหม่ในขณะนี้</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || "/dashboard"}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex items-start space-x-3 px-4 py-3 transition-colors group cursor-pointer block ${
                        !n.isRead
                          ? "bg-orange-50/20 hover:bg-orange-50/40"
                          : "hover:bg-gray-50/80 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 relative">
                        {n.type === "danger" && (
                          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                        {n.type === "warning" && (
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                        {n.type === "success" && (
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        {n.type === "info" && (
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <p
                              className={`truncate text-xs ${
                                !n.isRead
                                  ? "font-bold text-gray-900 group-hover:text-[#FE9F43]"
                                  : "font-medium text-gray-700"
                              }`}
                            >
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span
                                className="w-2 h-2 rounded-full bg-[#FE9F43] shrink-0"
                                title="ยังไม่ได้อ่าน"
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-1">{n.time}</span>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Footer Links */}
              <div className="pt-2.5 px-4 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <Link
                  href="/reports/products/quantity-alert"
                  onClick={() => setNotificationDropdownOpen(false)}
                  className="font-semibold text-gray-600 hover:text-[#FE9F43] transition-colors"
                >
                  รายงานสต็อกต่ำ
                </Link>
                <Link
                  href="/reports/products/expiry"
                  onClick={() => setNotificationDropdownOpen(false)}
                  className="font-semibold text-gray-600 hover:text-[#FE9F43] transition-colors"
                >
                  รายงานวันหมดอายุ
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* User Profile Avatar with Dropdown */}
        <div ref={userDropdownRef} className="relative pl-1">
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="relative cursor-pointer select-none flex items-center space-x-2"
          >
            <div className="relative">
              <img
                src={user.avatar || "/assets/images/avatar-01.jpg"}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-100 hover:ring-[#FE9F43] transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop";
                }}
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </div>
          </div>

          {/* User Profile Popup Menu (matching Image 1) */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 px-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              {/* Header Info */}
              <div className="flex items-center space-x-3 px-2 py-2 border-b border-gray-100 mb-1">
                <img
                  src={user.avatar || "/assets/images/avatar-01.jpg"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 text-xs leading-tight truncate">{user.name}</h4>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="text-[10px] font-semibold text-[#FE9F43] bg-orange-50 px-1.5 py-0.2 rounded">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 truncate mt-0.5 font-medium flex items-center">
                    <span className="text-gray-400 mr-1">📍</span>
                    {user.warehouseName || "All Warehouses"}
                  </p>
                  {user.storeName && (
                    <p className="text-[10px] text-gray-500 truncate mt-0.5 flex items-center">
                      <span className="text-gray-400 mr-1">🏪</span>
                      {user.storeName}
                    </p>
                  )}
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5">
                <Link
                  href="/settings/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#FE9F43] rounded-xl font-medium transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/reports/sales"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#FE9F43] rounded-xl font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Reports</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#FE9F43] rounded-xl font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Settings</span>
                </Link>
              </div>

              {/* Divider & Logout */}
              <div className="border-t border-gray-100 mt-1.5 pt-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

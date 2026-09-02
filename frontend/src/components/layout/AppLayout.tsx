"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Settings, ShieldAlert, ArrowLeft } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

function getModuleFromPath(path: string): string | null {
  if (!path) return null;
  if (path === "/" || path === "/admin") return "Dashboard";
  if (
    path.startsWith("/products") ||
    path.startsWith("/inventory") ||
    path.startsWith("/categories") ||
    path.startsWith("/sub-categories") ||
    path.startsWith("/brands") ||
    path.startsWith("/units") ||
    path.startsWith("/variant-attributes") ||
    path.startsWith("/warranties") ||
    path.startsWith("/barcode") ||
    path.startsWith("/qrcode")
  ) {
    return "Products & Inventory";
  }
  if (path.startsWith("/stock")) return "Stock Management";
  if (
    path.startsWith("/sales") ||
    path.startsWith("/pos") ||
    path.startsWith("/invoices") ||
    path.startsWith("/quotations")
  ) {
    return "Sales & POS";
  }
  if (path.startsWith("/promo")) return "Promo & Discounts";
  if (path.startsWith("/purchases")) return "Purchases";
  if (path.startsWith("/finance")) return "Finance & Accounts";
  if (
    path.startsWith("/customers") ||
    path.startsWith("/suppliers") ||
    path.startsWith("/stores") ||
    path.startsWith("/warehouses") ||
    path.startsWith("/billers")
  ) {
    return "Peoples (Customers/Suppliers)";
  }
  if (path.startsWith("/hrm")) return "HRM & Attendance";
  if (path.startsWith("/reports")) return "Reports & Analytics";
  if (
    path.startsWith("/users") ||
    path.startsWith("/roles-permissions") ||
    path.startsWith("/delete-account-requests") ||
    path.startsWith("/activity-logs")
  ) {
    return "User Management";
  }
  if (path.startsWith("/settings")) return "System Settings";
  return null;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toggleCustomizer, layoutMode, layoutWidth } = useThemeStore();
  const { user, isAdmin, hasModulePermission, fetchRolePermissions } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    fetchRolePermissions();

    // Check window size on initial load and resize
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const requiredModule = getModuleFromPath(pathname || "");
  const isDenied =
    mounted &&
    !isAdmin() &&
    requiredModule !== null &&
    !hasModulePermission(requiredModule, "view");

  // If layout mode is "mini", force collapsed sidebar
  const isMini = layoutMode === "mini" || (!sidebarOpen && !isMobile);
  const isWithoutHeader = layoutMode === "without-header";
  const isRtl = layoutMode === "rtl";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f2f2f2] flex flex-col antialiased relative"
    >
      {/* Top Navbar (hidden if without-header layout) */}
      {!isWithoutHeader && (
        <Header
          sidebarOpen={isMobile ? sidebarOpen : !isMini}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* Backdrop for Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-35 backdrop-blur-[2px] transition-opacity lg:hidden"
        />
      )}

      <div className="flex flex-1 relative bg-[#f2f2f2]">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isMobile ? sidebarOpen : !isMini}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 p-3 sm:p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#f2f2f2] w-full min-w-0 ${
            isMobile
              ? "ml-0 mr-0"
              : !isMini
              ? isRtl
                ? "mr-56"
                : "ml-56"
              : isRtl
              ? "mr-16"
              : "ml-16"
          }`}
        >
          <div className={`${layoutWidth === "boxed" ? "max-w-6xl mx-auto w-full" : "w-full min-w-0"}`}>
            {isDenied ? (
              <div className="min-h-[500px] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                    <ShieldAlert className="w-8 h-8 stroke-[1.75]" />
                  </div>
                  <span className="inline-block px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold tracking-wide uppercase mb-2">
                    403 Access Denied
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    สิทธิ์การเข้าถึงถูกจำกัด
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    คุณไม่มีสิทธิ์ในการเข้าถึงโมดูล{" "}
                    <span className="font-semibold text-gray-800">
                      &ldquo;{requiredModule}&rdquo;
                    </span>{" "}
                    ตามบทบาท{" "}
                    <span className="font-semibold text-[#FE9F43]">
                      ({user?.role || "Current Role"})
                    </span>{" "}
                    ที่กำหนดไว้ในระบบ
                  </p>
                  <p className="text-[11px] text-gray-400 mb-6">
                    หากต้องการใช้งานส่วนนี้ กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อขอเปิดสิทธิ์ในหน้า Roles &amp; Permissions
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>กลับสู่หน้าหลัก (Back to Home)</span>
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>

          {/* Bottom Copyright Footer */}
          <footer
            className={`mt-8 pt-4 border-t border-gray-300/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#646B72] ${
              layoutWidth === "boxed" ? "max-w-6xl mx-auto w-full" : "w-full"
            }`}
          >
            <p>2014 - 2026 © A POS. All Right Reserved</p>
            <p className="mt-1 sm:mt-0">
              Designed & Developed by <span className="font-semibold text-[#111827]">A POS</span>
            </p>
          </footer>
        </main>
      </div>

      {/* Floating Orange Settings Cog Button (Right screen edge) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-20 opacity-80 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleCustomizer}
          className="w-7 h-7 sm:w-8 sm:h-8 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-l-md sm:rounded-l-lg flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
          title="Theme Customizer"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin-slow" />
        </button>
      </div>

      {/* Slide-out Theme Customizer Drawer */}
      <ThemeCustomizer />
    </div>
  );
};

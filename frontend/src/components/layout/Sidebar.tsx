"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PlusCircle,
  AlertOctagon,
  TrendingDown,
  Layers,
  Tag,
  Scale,
  Sliders,
  ShieldCheck,
  Barcode,
  QrCode,
  Boxes,
  ArrowRightLeft,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Receipt,
  FileCheck,
  Ticket,
  Gift,
  Percent,
  ShoppingBag,
  DollarSign,
  Wallet,
  Building2,
  TrendingUp,
  Users,
  UserCheck,
  Truck,
  Store,
  Warehouse,
  Briefcase,
  Calendar,
  Clock,
  UserX,
  Smile,
  CircleDollarSign,
  BarChart3,
  PieChart,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Shield,
  CreditCard as PaymentIcon,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Undo2,
  History,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

interface SubMenuItem {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  hasSub?: boolean;
  subItems?: SubMenuItem[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const GROUP_MODULE_MAP: Record<string, string> = {
  "Main": "Dashboard",
  "Inventory": "Products & Inventory",
  "Stock": "Stock Management",
  "Sales": "Sales & POS",
  "Promo": "Promo & Discounts",
  "Purchases": "Purchases",
  "Finance & Accounts": "Finance & Accounts",
  "Peoples": "Peoples (Customers/Suppliers)",
  "HRM": "HRM & Attendance",
  "Reports": "Reports & Analytics",
  "User Management": "User Management",
  "Settings": "System Settings",
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();
  const { hasModulePermission, isAdmin, canCreateProduct, fetchRolePermissions } = useAuthStore();
  const [mounted, setMounted] = useState<boolean>(false);
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchRolePermissions();
  }, []);

  const toggleSubMenu = (menuName: string) => {
    setOpenSubMenus((prev) => {
      const next = { ...prev, [menuName]: !prev[menuName] };
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("sidebar_open_submenus", JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  const menuGroups: MenuGroup[] = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Super Admin", href: "/admin", icon: Shield },
      ],
    },
    {
      title: "Inventory",
      items: [
        { name: "Products", href: "/products", icon: Package },
        { name: "Create Product", href: "/products/add", icon: PlusCircle },
        { name: "Expired Products", href: "/inventory/expired", icon: AlertOctagon },
        { name: "Low Stocks", href: "/inventory/low-stock", icon: TrendingDown },
        { name: "Category", href: "/categories", icon: Layers },
        { name: "Sub Category", href: "/sub-categories", icon: Layers },
        { name: "Brands", href: "/brands", icon: Tag },
        { name: "Units", href: "/units", icon: Scale },
        { name: "Variant Attributes", href: "/variant-attributes", icon: Sliders },
        { name: "Warranties", href: "/warranties", icon: ShieldCheck },
        { name: "Print Barcode", href: "/barcode/print", icon: Barcode },
        { name: "Print QR Code", href: "/qrcode/print", icon: QrCode },
      ],
    },
    {
      title: "Stock",
      items: [
        { name: "Manage Stock", href: "/stock/manage", icon: Boxes },
        { name: "Stock Adjustment", href: "/stock/adjustment", icon: FileSpreadsheet },
        { name: "Stock Transfer", href: "/stock/transfer", icon: ArrowRightLeft },
      ],
    },
    {
      title: "Sales",
      items: [
        {
          name: "Sales",
          href: "/sales",
          icon: LayoutGrid,
          hasSub: true,
          subItems: [
            { name: "Online Orders", href: "/sales/online-orders" },
            { name: "POS Orders", href: "/sales/pos-orders" },
          ],
        },
        { name: "Invoices", href: "/invoices", icon: FileText },
        { name: "Sales Return", href: "/sales/returns", icon: Undo2 },
        { name: "Quotation", href: "/quotations", icon: FileCheck },
        {
          name: "POS",
          href: "/pos",
          icon: Monitor,
          hasSub: true,
          subItems: [
            { name: "POS 1", href: "/pos" },
            { name: "POS 2", href: "/pos?terminal=2" },
            { name: "POS 3", href: "/pos?terminal=3" },
            { name: "POS 4", href: "/pos?terminal=4" },
            { name: "POS 5", href: "/pos?terminal=5" },
            { name: "POS 6", href: "/pos?terminal=6" },
            { name: "POS 7", href: "/pos?terminal=7" },
            { name: "POS 8", href: "/pos?terminal=8" },
          ],
        },
      ],
    },
    {
      title: "Promo",
      items: [
        { name: "Coupons", href: "/promo/coupons", icon: Ticket },
        { name: "Gift Cards", href: "/promo/gift-cards", icon: Gift },
        {
          name: "Discount",
          href: "/promo/discounts",
          icon: Percent,
          hasSub: true,
          subItems: [
            { name: "Discount Plan", href: "/promo/discount-plans" },
            { name: "Discount", href: "/promo/discounts" },
          ],
        },
      ],
    },
    {
      title: "Purchases",
      items: [
        { name: "Purchases", href: "/purchases", icon: ShoppingBag },
        { name: "Purchase Order", href: "/purchases/orders", icon: FileText },
        { name: "Purchase Return", href: "/purchases/returns", icon: RotateCcw },
      ],
    },
    {
      title: "Finance & Accounts",
      items: [
        {
          name: "Expenses",
          href: "/finance/expenses",
          icon: DollarSign,
          hasSub: true,
          subItems: [
            { name: "Expenses", href: "/finance/expenses" },
            { name: "Expense Category", href: "/finance/expense-categories" },
          ],
        },
        {
          name: "Income",
          href: "/finance/income",
          icon: TrendingUp,
          hasSub: true,
          subItems: [
            { name: "Income", href: "/finance/income" },
            { name: "Income Category", href: "/finance/income-categories" },
          ],
        },
        { name: "Bank Accounts", href: "/finance/bank-accounts", icon: Building2 },
        { name: "Money Transfer", href: "/finance/money-transfer", icon: ArrowRightLeft },
        { name: "Balance Sheet", href: "/finance/balance-sheet", icon: FileText },
        { name: "Trial Balance", href: "/finance/trial-balance", icon: Scale },
        { name: "Cash Flow", href: "/finance/cash-flow", icon: Wallet },
        { name: "Account Statement", href: "/finance/account-statement", icon: FileSpreadsheet },
      ],
    },
    {
      title: "Peoples",
      items: [
        { name: "Customers", href: "/customers", icon: Users },
        { name: "Suppliers", href: "/suppliers", icon: UserCheck },
        { name: "Stores", href: "/stores", icon: Store },
        { name: "Warehouses", href: "/warehouses", icon: Warehouse },
        { name: "Billers", href: "/billers", icon: UserCheck },
      ],
    },
    {
      title: "HRM",
      items: [
        { name: "Employees", href: "/hrm/employees", icon: Briefcase },
        { name: "Departments", href: "/hrm/departments", icon: Building2 },
        { name: "Designations", href: "/hrm/designations", icon: Layers },
        {
          name: "Attendance",
          href: "/hrm/attendance",
          icon: Calendar,
          hasSub: true,
          subItems: [
            { name: "Employee", href: "/hrm/attendance/employee" },
            { name: "Admin", href: "/hrm/attendance/admin" },
          ],
        },
        {
          name: "Leaves",
          href: "/hrm/leaves",
          icon: UserX,
          hasSub: true,
          subItems: [
            { name: "Admin Leaves", href: "/hrm/leaves/admin" },
            { name: "Employee Leaves", href: "/hrm/leaves/employee" },
            { name: "Leave Type", href: "/hrm/leaves/types" },
          ],
        },
        { name: "Holidays", href: "/hrm/holidays", icon: Smile },
        {
          name: "Payroll",
          href: "/hrm/payroll",
          icon: CircleDollarSign,
          hasSub: true,
          subItems: [
            { name: "Employee Salary", href: "/hrm/payroll/salary" },
            { name: "Payslip", href: "/hrm/payroll/payslip" },
          ],
        },
      ],
    },
    {
      title: "Reports",
      items: [
        {
          name: "Sales Report",
          href: "/reports/sales",
          icon: BarChart3,
          hasSub: true,
          subItems: [
            { name: "Sales Report", href: "/reports/sales" },
            { name: "Best Seller", href: "/reports/sales/best-seller" },
          ],
        },
        { name: "Purchase Report", href: "/reports/purchases", icon: BarChart3 },
        {
          name: "Inventory Report",
          href: "/reports/inventory",
          icon: PieChart,
          hasSub: true,
          subItems: [
            { name: "Inventory Report", href: "/reports/inventory" },
            { name: "Stock History", href: "/reports/inventory/stock-history" },
            { name: "Sold Stock", href: "/reports/inventory/sold-stock" },
          ],
        },
        {
          name: "Product Report",
          href: "/reports/products",
          icon: Package,
          hasSub: true,
          subItems: [
            { name: "Product Report", href: "/reports/products" },
            { name: "Product Expiry Report", href: "/reports/products/expiry" },
            { name: "Product Quantity Alert", href: "/reports/products/quantity-alert" },
          ],
        },
        { name: "Invoice Report", href: "/reports/invoices", icon: FileText },
        {
          name: "Supplier Report",
          href: "/reports/suppliers",
          icon: Truck,
          hasSub: true,
          subItems: [
            { name: "Supplier Report", href: "/reports/suppliers" },
            { name: "Supplier Due Report", href: "/reports/suppliers/due" },
          ],
        },
        {
          name: "Customer Report",
          href: "/reports/customers",
          icon: UserCheck,
          hasSub: true,
          subItems: [
            { name: "Customer Report", href: "/reports/customers" },
            { name: "Customer Due Report", href: "/reports/customers/due" },
          ],
        },
        { name: "Expense Report", href: "/reports/expenses", icon: Receipt },
        { name: "Income Report", href: "/reports/income", icon: TrendingUp },
        {
          name: "Tax Report",
          href: "/reports/tax",
          icon: Percent,
          hasSub: true,
          subItems: [
            { name: "Purchase Tax", href: "/reports/tax" },
            { name: "Sales Tax", href: "/reports/tax/sales" },
          ],
        },
        { name: "Profit & Loss", href: "/reports/profit-loss", icon: BarChart3 },
        { name: "Annual Report", href: "/reports/annual", icon: Calendar },
      ],
    },
    {
      title: "User Management",
      items: [
        { name: "Users", href: "/users", icon: Users },
        { name: "Roles & Permissions", href: "/roles-permissions", icon: ShieldCheck },
        { name: "Delete Account Request", href: "/delete-account-requests", icon: UserX },
        { name: "Activity Logs", href: "/activity-logs", icon: History },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          name: "General Settings",
          href: "/settings",
          icon: Settings,
          hasSub: true,
          subItems: [
            { name: "Profile", href: "/settings/profile" },
            { name: "Security", href: "/settings/security" },
            { name: "Notifications", href: "/settings/notifications" },
            { name: "Connected Apps", href: "/settings/connected-apps" },
          ],
        },
        {
          name: "Website Settings",
          href: "/settings/system",
          icon: Globe,
          hasSub: true,
          subItems: [
            { name: "System Settings", href: "/settings/system" },
            { name: "Company Settings", href: "/settings/company" },
            { name: "Localization", href: "/settings/localization" },
            { name: "Prefixes", href: "/settings/prefixes" },
            { name: "Preference", href: "/settings/preference" },
            { name: "Appearance", href: "/settings/appearance" },
            { name: "Social Authentication", href: "/settings/social-auth" },
            { name: "Language", href: "/settings/language" },
          ],
        },
        {
          name: "App Settings",
          href: "/settings/invoice-settings",
          icon: Smartphone,
          hasSub: true,
          subItems: [
            { name: "Invoice Settings", href: "/settings/invoice-settings" },
            { name: "Invoice Templates", href: "/settings/invoice-templates" },
            { name: "Printer", href: "/settings/printer" },
            { name: "POS", href: "/settings/pos-settings" },
            { name: "Signatures", href: "/settings/signatures" },
            { name: "Custom Fields", href: "/settings/custom-fields" },
          ],
        },
        {
          name: "System Settings",
          href: "/settings/email",
          icon: Monitor,
          hasSub: true,
          subItems: [
            { name: "Email", href: "/settings/email" },
            { name: "SMS Gateway", href: "/settings/sms" },
            { name: "OTP", href: "/settings/otp" },
          ],
        },
        {
          name: "Financial Settings",
          href: "/settings/payment-gateway",
          icon: DollarSign,
          hasSub: true,
          subItems: [
            { name: "Payment Gateway", href: "/settings/payment-gateway" },
            { name: "Bank Accounts", href: "/settings/bank-accounts" },
            { name: "Tax Rates", href: "/settings/tax-rates" },
            { name: "Currencies", href: "/settings/currencies" },
          ],
        },
        { name: "Help & Docs", href: "/help", icon: HelpCircle },
      ],
    },
  ];

  // Auto expand submenu for active route & restore saved open submenus
  useEffect(() => {
    if (typeof window !== "undefined") {
      let savedOpen: { [key: string]: boolean } = {};
      try {
        const raw = sessionStorage.getItem("sidebar_open_submenus");
        if (raw) savedOpen = JSON.parse(raw);
      } catch (e) {}

      // Check if current pathname is inside any submenu
      menuGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (item.hasSub && item.subItems) {
            const hasActiveChild = item.subItems.some((sub) => pathname === sub.href);
            if (hasActiveChild) {
              savedOpen[item.name] = true;
            }
          }
        });
      });

      setOpenSubMenus(savedOpen);
      try {
        sessionStorage.setItem("sidebar_open_submenus", JSON.stringify(savedOpen));
      } catch (e) {}
    }
  }, [pathname]);

  // Restore scroll position and scroll active item into view
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sidebarRef.current) {
        // 1. Try restoring saved scroll position
        const savedScroll = sessionStorage.getItem("sidebar_scroll_top");
        if (savedScroll !== null) {
          sidebarRef.current.scrollTop = Number(savedScroll);
        }

        // 2. Ensure active element is scrolled into view if it was off-screen
        const activeElement = sidebarRef.current.querySelector<HTMLElement>('[data-active="true"]');
        if (activeElement) {
          activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleScroll = () => {
    if (sidebarRef.current && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("sidebar_scroll_top", String(sidebarRef.current.scrollTop));
      } catch (e) {}
    }
  };

  const handleLinkClick = () => {
    if (sidebarRef.current && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("sidebar_scroll_top", String(sidebarRef.current.scrollTop));
      } catch (e) {}
    }
  };

  return (
    <aside
      ref={sidebarRef}
      onScroll={handleScroll}
      className={`fixed top-16 left-0 bottom-0 z-30 bg-white border-r border-gray-100 transition-all duration-300 overflow-y-auto ${
        isOpen ? "w-56" : "w-16"
      }`}
    >
      <div className={`py-4 space-y-4 ${isOpen ? "px-3" : "px-1.5"}`}>
        {menuGroups.map((group, gIdx) => {
          const moduleName = GROUP_MODULE_MAP[group.title];
          if (mounted && !isAdmin() && moduleName) {
            if (!hasModulePermission(moduleName, "view")) {
              return null;
            }
          }

          const visibleItems = group.items.filter((item) => {
            if (!mounted) return true;
            if (item.name === "Super Admin" && !isAdmin()) return false;
            if (item.name === "Create Product" && !canCreateProduct()) return false;
            if (item.name === "Roles & Permissions" && !isAdmin()) return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {isOpen && (
                <p className="px-3 text-[11px] font-bold text-gray-800 tracking-tight mb-1.5">
                  {group.title}
                </p>
              )}

              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                const Icon = item.icon;
                const isItemActive =
                  pathname === item.href ||
                  (item.subItems && item.subItems.some((sub) => pathname === sub.href)) ||
                  (item.href === "/products" && pathname?.startsWith("/products/edit"));
                const isSubMenuOpen = !!openSubMenus[item.name];

                if (item.hasSub && item.subItems && isOpen) {
                  return (
                    <div key={item.name} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => toggleSubMenu(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                          isItemActive
                            ? "bg-[#FFF5ED] text-[#FE9F43] font-bold"
                            : isSubMenuOpen
                            ? "bg-gray-50 text-gray-900 font-semibold"
                            : "text-[#374151] hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 ${
                              isItemActive ? "text-[#FE9F43]" : "text-gray-500"
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isSubMenuOpen ? (
                          <ChevronDown className={`w-3.5 h-3.5 ${isItemActive ? "text-[#FE9F43]" : "text-gray-400"}`} />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>

                      {/* Expandable Sub-items list with bullets matching screenshot */}
                      {isSubMenuOpen && (
                        <div className="pl-6 pr-1 space-y-1 pt-1">
                          {item.subItems.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={handleLinkClick}
                                data-active={isSubActive ? "true" : "false"}
                                className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-normal transition-all ${
                                  isSubActive
                                    ? "text-[#FE9F43] font-bold"
                                    : "text-[#4B5563] hover:text-[#111827] hover:bg-gray-50"
                                }`}
                              >
                                <span className="text-gray-400 text-sm leading-none">•</span>
                                <span className="truncate">{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    data-active={isItemActive ? "true" : "false"}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                      isItemActive
                        ? "bg-[#FFF5ED] text-[#FE9F43] font-bold"
                        : "text-[#374151] hover:bg-gray-50 hover:text-gray-900"
                    } ${!isOpen ? "justify-center px-0 py-2.5" : ""}`}
                    title={!isOpen ? item.name : undefined}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isItemActive ? "text-[#FE9F43]" : "text-gray-500"
                        }`}
                      />
                      {isOpen && <span className="truncate">{item.name}</span>}
                    </div>

                    {isOpen && item.hasSub && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </aside>
  );
};

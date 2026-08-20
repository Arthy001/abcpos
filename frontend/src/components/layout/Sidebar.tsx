"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Settings,
  Shield,
  CreditCard as PaymentIcon,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Monitor,
  Undo2,
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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({
    Sales: false,
    POS: true, // Opened POS in screenshot
  });

  const toggleSubMenu = (menuName: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
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
        { name: "Expenses", href: "/finance/expenses", icon: DollarSign },
        { name: "Income", href: "/finance/income", icon: TrendingUp },
        { name: "Bank Accounts", href: "/finance/bank-accounts", icon: Building2 },
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
      ],
    },
    {
      title: "HRM",
      items: [
        { name: "Employees", href: "/hrm/employees", icon: Briefcase },
        { name: "Departments", href: "/hrm/departments", icon: Building2 },
        { name: "Designations", href: "/hrm/designations", icon: Layers },
        { name: "Shift & Schedule", href: "/hrm/shifts", icon: Clock },
        { name: "Attendance", href: "/hrm/attendance", icon: Calendar },
        { name: "Leaves", href: "/hrm/leaves", icon: UserX },
        { name: "Holidays", href: "/hrm/holidays", icon: Smile },
        { name: "Payroll", href: "/hrm/payroll", icon: CircleDollarSign },
      ],
    },
    {
      title: "Reports",
      items: [
        { name: "Sales Report", href: "/reports/sales", icon: BarChart3 },
        { name: "Purchase Report", href: "/reports/purchases", icon: BarChart3 },
        { name: "Inventory Report", href: "/reports/inventory", icon: PieChart },
        { name: "Invoice Report", href: "/reports/invoices", icon: FileText },
        { name: "Tax Report", href: "/reports/tax", icon: Percent },
        { name: "Profit & Loss", href: "/reports/profit-loss", icon: BarChart3 },
      ],
    },
    {
      title: "Settings",
      items: [
        { name: "General Settings", href: "/settings", icon: Settings },
        { name: "Security", href: "/settings/security", icon: Shield },
        { name: "Payment Gateways", href: "/settings/payments", icon: PaymentIcon },
        { name: "Tax Rates", href: "/settings/tax", icon: Percent },
        { name: "Help & Docs", href: "/help", icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 bg-white border-r border-gray-100 transition-all duration-300 overflow-y-auto ${
        isOpen ? "w-56" : "w-16"
      }`}
    >
      <div className={`py-4 space-y-4 ${isOpen ? "px-3" : "px-1.5"}`}>
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {isOpen && (
              <p className="px-3 text-[11px] font-bold text-gray-800 tracking-tight mb-1.5">
                {group.title}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isItemActive =
                  pathname === item.href ||
                  (item.subItems && item.subItems.some((sub) => pathname === sub.href));
                const isSubMenuOpen = !!openSubMenus[item.name];

                if (item.hasSub && item.subItems && isOpen) {
                  return (
                    <div key={item.name} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => toggleSubMenu(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                          isItemActive || isSubMenuOpen
                            ? "bg-[#FFF5ED] text-[#FE9F43] font-bold"
                            : "text-[#374151] hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 ${
                              isItemActive || isSubMenuOpen ? "text-[#FE9F43]" : "text-gray-500"
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isSubMenuOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-[#FE9F43]" />
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
        ))}
      </div>
    </aside>
  );
};

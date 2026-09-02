import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  warehouseName?: string;
  storeName?: string;
  avatar?: string;
  warehouseIds?: string[];
  assignedWarehouses?: {
    id: string;
    warehouseId: string;
    warehouseName?: string;
  }[];
}

export const DEFAULT_USER: AuthUser = {
  id: "1",
  name: "Henry Bryant",
  email: "henry@example.com",
  role: "Admin",
  warehouseName: "All Warehouses",
  storeName: "All Stores",
  avatar: "/assets/images/avatar-01.jpg",
};

export interface PermissionItem {
  module: string;
  all?: boolean;
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
}

interface AuthState {
  user: AuthUser;
  rolePermissions: Record<string, PermissionItem[]>;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: () => boolean;
  canManageWarehouse: (warehouseName: string) => boolean;
  fetchRolePermissions: () => Promise<void>;
  hasModulePermission: (moduleName: string, action: "view" | "create" | "edit" | "delete") => boolean;
  canCreateProduct: () => boolean;
  canEditProduct: () => boolean;
  canDeleteProduct: () => boolean;
}

const DEFAULT_ROLE_FALLBACKS: Record<
  string,
  Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>
> = {
  manager: {
    "Dashboard": { view: true, create: true, edit: true, delete: false },
    "Products & Inventory": { view: true, create: true, edit: true, delete: false },
    "Stock Management": { view: true, create: true, edit: true, delete: false },
    "Sales & POS": { view: true, create: true, edit: true, delete: false },
    "Promo & Discounts": { view: true, create: true, edit: true, delete: false },
    "Purchases": { view: true, create: true, edit: true, delete: false },
    "Finance & Accounts": { view: true, create: true, edit: true, delete: false },
    "Peoples (Customers/Suppliers)": { view: true, create: true, edit: true, delete: false },
    "HRM & Attendance": { view: true, create: true, edit: true, delete: false },
    "Reports & Analytics": { view: true, create: true, edit: true, delete: false },
    "User Management": { view: true, create: false, edit: false, delete: false },
    "System Settings": { view: true, create: false, edit: false, delete: false },
  },
  "store keeper": {
    "Dashboard": { view: true, create: false, edit: false, delete: false },
    "Products & Inventory": { view: true, create: false, edit: false, delete: false },
    "Stock Management": { view: true, create: true, edit: true, delete: false },
    "Purchases": { view: true, create: true, edit: true, delete: false },
    "Peoples (Customers/Suppliers)": { view: true, create: false, edit: false, delete: false },
    "Reports & Analytics": { view: true, create: false, edit: false, delete: false },
  },
  cashier: {
    "Dashboard": { view: true, create: false, edit: false, delete: false },
    "Sales & POS": { view: true, create: true, edit: true, delete: false },
    "Products & Inventory": { view: true, create: false, edit: false, delete: false },
    "Peoples (Customers/Suppliers)": { view: true, create: true, edit: false, delete: false },
  },
  "warehouse supervisor": {
    "Dashboard": { view: true, create: false, edit: false, delete: false },
    "Products & Inventory": { view: true, create: true, edit: true, delete: false },
    "Stock Management": { view: true, create: true, edit: true, delete: true },
    "Purchases": { view: true, create: true, edit: true, delete: false },
    "Peoples (Customers/Suppliers)": { view: true, create: false, edit: false, delete: false },
    "Reports & Analytics": { view: true, create: false, edit: false, delete: false },
  },
  "purchase officer": {
    "Dashboard": { view: true, create: false, edit: false, delete: false },
    "Products & Inventory": { view: true, create: false, edit: false, delete: false },
    "Purchases": { view: true, create: true, edit: true, delete: true },
    "Peoples (Customers/Suppliers)": { view: true, create: true, edit: true, delete: false },
    "Reports & Analytics": { view: true, create: false, edit: false, delete: false },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      rolePermissions: {},

      setUser: (user: AuthUser) => set({ user }),

      logout: () => set({ user: DEFAULT_USER }),

      isAdmin: () => {
        const { user } = get();
        return (
          user.role?.toLowerCase() === "admin" ||
          user.role?.toLowerCase() === "super admin" ||
          user.role?.toLowerCase().includes("admin")
        );
      },

      canManageWarehouse: (targetWarehouse: string) => {
        const { user, isAdmin } = get();
        if (isAdmin()) return true;
        if (!user.warehouseName || user.warehouseName.includes("All")) return true;
        if (user.warehouseName.toLowerCase().trim() === targetWarehouse.toLowerCase().trim()) return true;
        if (Array.isArray(user.assignedWarehouses)) {
          return user.assignedWarehouses.some(
            (aw) =>
              aw.warehouseId === targetWarehouse ||
              (aw.warehouseName && aw.warehouseName.toLowerCase().trim() === targetWarehouse.toLowerCase().trim())
          );
        }
        return false;
      },

      fetchRolePermissions: async () => {
        try {
          const res = await fetch("/api/roles", { cache: "no-store" });
          if (!res.ok) return;
          const json = await res.json();
          const roles = json.data || [];
          const map: Record<string, PermissionItem[]> = {};
          for (const r of roles) {
            if (r.name && r.permissions) {
              try {
                const parsed =
                  typeof r.permissions === "string"
                    ? JSON.parse(r.permissions)
                    : r.permissions;
                if (Array.isArray(parsed)) {
                  map[r.name.toLowerCase().trim()] = parsed;
                }
              } catch {}
            }
          }
          set({ rolePermissions: map });

          // Also sync active user warehouse assignments from DB if possible
          const currentUser = get().user;
          if (currentUser?.email) {
            try {
              const uRes = await fetch(`/api/users?search=${encodeURIComponent(currentUser.email)}`, { cache: "no-store" });
              if (uRes.ok) {
                const uJson = await uRes.json();
                const matched = uJson.data?.find((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
                if (matched) {
                  set({
                    user: {
                      ...currentUser,
                      name: matched.name,
                      role: matched.role,
                      warehouseName: matched.warehouseName || "All Warehouses",
                      storeName: matched.storeName || "All Stores",
                      avatar: matched.avatar || currentUser.avatar,
                      assignedWarehouses: matched.assignedWarehouses || [],
                      warehouseIds: matched.assignedWarehouses?.map((aw: any) => aw.warehouseId) || [],
                    },
                  });
                }
              }
            } catch {}
          }
        } catch (err) {
          console.error("fetchRolePermissions error:", err);
        }
      },

      hasModulePermission: (moduleName: string, action: "view" | "create" | "edit" | "delete") => {
        const { user, isAdmin, rolePermissions } = get();
        if (isAdmin()) return true;
        if (!user?.role) return false;

        const normalizedRole = user.role.toLowerCase().trim();
        const matchedKey = Object.keys(rolePermissions).find(
          (k) => k.toLowerCase().trim() === normalizedRole
        );

        if (matchedKey && rolePermissions[matchedKey]) {
          const matrix = rolePermissions[matchedKey];
          const mod = matrix.find(
            (m) => m.module?.toLowerCase().trim() === moduleName.toLowerCase().trim()
          );
          if (mod) {
            return Boolean(mod.all || mod[action]);
          }
        }

        // Fallback default if not yet customized in DB
        const fallbackRole = DEFAULT_ROLE_FALLBACKS[normalizedRole];
        if (fallbackRole) {
          const modKey = Object.keys(fallbackRole).find(
            (k) => k.toLowerCase().trim() === moduleName.toLowerCase().trim()
          );
          if (modKey && fallbackRole[modKey]) {
            return Boolean(fallbackRole[modKey][action]);
          }
        }

        return false;
      },

      canCreateProduct: () => {
        const { isAdmin, hasModulePermission } = get();
        if (isAdmin()) return true;
        return hasModulePermission("Products & Inventory", "create");
      },

      canEditProduct: () => {
        const { isAdmin, hasModulePermission } = get();
        if (isAdmin()) return true;
        return hasModulePermission("Products & Inventory", "edit");
      },

      canDeleteProduct: () => {
        const { isAdmin, hasModulePermission } = get();
        if (isAdmin()) return true;
        return hasModulePermission("Products & Inventory", "delete");
      },
    }),
    {
      name: "abcpos-auth-storage",
    }
  )
);

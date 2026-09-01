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
}

export const DEFAULT_USER: AuthUser = {
  id: "1",
  name: "Henry Bryant",
  email: "henry@example.com",
  role: "Admin",
  warehouseName: "Lavish Warehouse",
  storeName: "ElectroMart Main",
  avatar: "/assets/images/avatar-01.jpg",
};

interface AuthState {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: () => boolean;
  canManageWarehouse: (warehouseName: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,

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
        return (
          user.warehouseName.toLowerCase().trim() ===
          targetWarehouse.toLowerCase().trim()
        );
      },
    }),
    {
      name: "abcpos-auth-storage",
    }
  )
);

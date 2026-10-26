import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SystemModule, BusinessPresetType } from "@/types";
import { getSystemModulesApi, toggleSystemModuleApi, applyBusinessPresetApi } from "@/lib/api";

interface ModuleState {
  modules: SystemModule[];
  loading: boolean;
  error: string | null;
  fetchModules: () => Promise<void>;
  toggleModule: (code: string, isEnabled?: boolean) => Promise<boolean>;
  applyPreset: (preset: BusinessPresetType) => Promise<boolean>;
  isModuleEnabled: (code: string) => boolean;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      modules: [],
      loading: false,
      error: null,

      fetchModules: async () => {
        set({ loading: true, error: null });
        try {
          const modules = await getSystemModulesApi();
          set({ modules, loading: false });
        } catch (err: any) {
          set({ error: err.message || "Failed to load modules", loading: false });
        }
      },

      toggleModule: async (code: string, isEnabled?: boolean) => {
        try {
          const updated = await toggleSystemModuleApi(code, isEnabled);
          set((state) => ({
            modules: state.modules.map((m) => (m.code === code ? updated : m)),
          }));
          return true;
        } catch (err: any) {
          return false;
        }
      },

      applyPreset: async (preset: BusinessPresetType) => {
        try {
          const res = await applyBusinessPresetApi(preset);
          set({ modules: res.modules });
          return true;
        } catch (err: any) {
          return false;
        }
      },

      isModuleEnabled: (code: string) => {
        const { modules } = get();
        if (!modules || modules.length === 0) return true; // Default show until loaded
        const mod = modules.find((m) => m.code === code);
        return mod ? mod.isEnabled : true;
      },
    }),
    {
      name: "a-pos-system-modules",
    }
  )
);

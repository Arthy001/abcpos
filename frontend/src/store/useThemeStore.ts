import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LayoutMode = "default" | "mini" | "two-column" | "horizontal" | "detached" | "without-header" | "rtl";
export type LayoutWidth = "fluid" | "boxed";

interface ThemeState {
  isCustomizerOpen: boolean;
  layoutMode: LayoutMode;
  layoutWidth: LayoutWidth;
  topBarColor: string;
  isGradientTopBar: boolean;
  
  // Actions
  toggleCustomizer: () => void;
  openCustomizer: () => void;
  closeCustomizer: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setLayoutWidth: (width: LayoutWidth) => void;
  setTopBarColor: (color: string, isGradient?: boolean) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isCustomizerOpen: false,
      layoutMode: "default",
      layoutWidth: "fluid",
      topBarColor: "#ffffff",
      isGradientTopBar: false,

      toggleCustomizer: () => set((state) => ({ isCustomizerOpen: !state.isCustomizerOpen })),
      openCustomizer: () => set({ isCustomizerOpen: true }),
      closeCustomizer: () => set({ isCustomizerOpen: false }),
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setLayoutWidth: (width) => set({ layoutWidth: width }),
      setTopBarColor: (color, isGradient = false) => set({ topBarColor: color, isGradientTopBar: isGradient }),
      resetTheme: () =>
        set({
          layoutMode: "default",
          layoutWidth: "fluid",
          topBarColor: "#ffffff",
          isGradientTopBar: false,
        }),
    }),
    {
      name: "a-pos-theme-storage",
    }
  )
);

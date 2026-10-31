import { create } from "zustand";
import { getLocalizationSettingsApi, updateLocalizationSettingsApi } from "@/lib/api";
import { LocalizationSettings } from "@/lib/api";

interface CurrencyState {
  currencySymbol: string;
  currencyPosition: "Before Amount" | "After Amount" | string;
  decimalSeparator: string;
  thousandSeparator: string;
  decimals: number;
  loading: boolean;
  fetchCurrencySettings: () => Promise<void>;
  updateCurrencySymbol: (symbol: string) => Promise<void>;
  formatMoney: (amount: number | string | undefined | null, overrideDecimals?: number) => string;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currencySymbol: "฿",
  currencyPosition: "Before Amount",
  decimalSeparator: ".",
  thousandSeparator: ",",
  decimals: 2,
  loading: false,

  fetchCurrencySettings: async () => {
    try {
      set({ loading: true });
      const settings = await getLocalizationSettingsApi();
      if (settings) {
        set({
          currencySymbol: settings.currencySymbol || "฿",
          currencyPosition: settings.currencyPosition || "Before Amount",
          decimalSeparator: settings.decimalSeparator || ".",
          thousandSeparator: settings.thousandSeparator || ",",
          decimals: typeof settings.decimals === "number" ? settings.decimals : 2,
        });
      }
    } catch (err) {
      console.error("Failed to load currency settings:", err);
    } finally {
      set({ loading: false });
    }
  },

  updateCurrencySymbol: async (symbol: string) => {
    try {
      set({ currencySymbol: symbol });
      await updateLocalizationSettingsApi({ currencySymbol: symbol });
    } catch (err) {
      console.error("Failed to update currency symbol:", err);
    }
  },

  formatMoney: (amount: number | string | undefined | null, overrideDecimals?: number) => {
    const num = Number(amount) || 0;
    const { currencySymbol, currencyPosition, decimals, thousandSeparator, decimalSeparator } = get();
    const dCount = overrideDecimals !== undefined ? overrideDecimals : (decimals !== undefined ? decimals : 2);

    // Format number with decimals
    const parts = num.toFixed(dCount).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator || ",");
    const formattedNum = parts.length > 1 && dCount > 0
      ? parts.join(decimalSeparator || ".")
      : parts[0];

    if (currencyPosition === "After Amount") {
      return `${formattedNum} ${currencySymbol}`;
    }
    return `${currencySymbol}${formattedNum}`;
  },
}));

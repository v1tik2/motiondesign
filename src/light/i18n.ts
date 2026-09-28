import { createContext, useContext } from "react";

export type Lang = "uk" | "en";

export const STR = {
  uk: {
    hook: "Який шанс вибити ніж у CS2?",
    hookMark: "ніж",
    hookSize: 124,
    open: "Відкрити",
    oddsLabel: "Шанс з одного кейсу",
    rareCaption: "ніж або рукавички",
    decimal: ",",
    avg: "В середньому",
    of: "з",
    keys: "лише на ключі",
    or: "Або…",
    twist: "Або будь-який ніж. Безкоштовно.",
    twistMark: "Безкоштовно.",
    tabs: ["Ножі", "Рукавички", "Гвинтівки"],
    equip: "Екіпірувати",
    equipped: "Екіпіровано",
    outro: "Грай з будь-якими скінами безкоштовно",
    outroMark: "безкоштовно",
  },
  en: {
    hook: "What are the odds of unboxing a knife in CS2?",
    hookMark: "knife",
    hookSize: 104,
    open: "Open",
    oddsLabel: "Odds per case",
    rareCaption: "knife or gloves",
    decimal: ".",
    avg: "On average",
    of: "in",
    keys: "on keys alone",
    or: "Or…",
    twist: "Or get any knife. For free.",
    twistMark: "free.",
    tabs: ["Knives", "Gloves", "Rifles"],
    equip: "Equip",
    equipped: "Equipped",
    outro: "Play with any skins for free",
    outroMark: "free",
  },
} as const;

export const LangContext = createContext<Lang>("uk");
export const useT = () => STR[useContext(LangContext)];

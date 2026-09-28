// Everything brand-specific lives here so it can be swapped without touching scenes.
export const BRAND = {
  name: "CSHUNTER",
  domain: "CSHUNTER.COM",
  // Drop the real logo into public/logo.png and set this to "logo.png".
  // While null, a built-in crosshair mark is drawn instead.
  logoFile: "logo.png" as string | null,
  modes: ["DM", "DUELS", "BHOP", "SURF", "AWP", "ARENA", "KZ", "CLUTCH", "RETAKE", "2V2", "5V5"],
};

// Valve's officially disclosed case odds (unchanged from CS:GO to CS2).
export const ODDS = [
  { key: "milspec", label: "Mil-Spec", pct: 79.92 },
  { key: "restricted", label: "Restricted", pct: 15.98 },
  { key: "classified", label: "Classified", pct: 3.2 },
  { key: "covert", label: "Covert", pct: 0.64 },
  { key: "rare", label: "★ Knife / Gloves", pct: 0.26 },
] as const;

export const KEY_PRICE_USD = 2.49;
export const CASES_PER_KNIFE = 385; // 1 / 0.0026

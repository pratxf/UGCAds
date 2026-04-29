/**
 * Credits are stored as integer tenths in the DB to avoid float precision bugs.
 * 10 in DB = 1 credit displayed.
 * Display values in COSTS / PLANS are whole credits.
 */

export const CREDIT_UNITS = 10;

/** Convert display credits → DB integer tenths. */
export function toUnits(displayCredits: number): number {
  return Math.round(displayCredits * CREDIT_UNITS);
}

/** Convert DB integer tenths → display credits number. */
export function fromUnits(units: number): number {
  return units / CREDIT_UNITS;
}

/** Format for UI. Strips trailing .0 */
export function formatCredits(units: number): string {
  const n = fromUnits(units);
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

/** Costs per generation type, in DISPLAY credits */
export const COSTS = {
  UGC_AD_SD: 20,        // 720p
  UGC_AD_HD: 25,        // 1080p
  PRODUCT_AD_SD: 20,    // 720p
  PRODUCT_AD_HD: 25,    // 1080p
  MOCKUP: 1,            // Product Photoshoot (alias)
  PRODUCT_PHOTOSHOOT: 1,
  TRYON: 5,             // AI Try-On
} as const;

/** Costs in DB units (tenths) */
export const COSTS_UNITS = {
  UGC_AD_SD: toUnits(COSTS.UGC_AD_SD),
  UGC_AD_HD: toUnits(COSTS.UGC_AD_HD),
  PRODUCT_AD_SD: toUnits(COSTS.PRODUCT_AD_SD),
  PRODUCT_AD_HD: toUnits(COSTS.PRODUCT_AD_HD),
  MOCKUP: toUnits(COSTS.MOCKUP),
  PRODUCT_PHOTOSHOOT: toUnits(COSTS.PRODUCT_PHOTOSHOOT),
  TRYON: toUnits(COSTS.TRYON),
  // Backwards-compat aliases (default to HD)
  UGC_AD: toUnits(COSTS.UGC_AD_HD),
  PRODUCT_AD: toUnits(COSTS.PRODUCT_AD_HD),
} as const;

/** Subscription plans (display credits per month) */
export const PLAN_CREDITS = {
  BASIC: 100,
  CREATOR: 300,
  AGENCY: 500,
} as const;

/** Top-up packs */
export const TOPUP_PACKS = [
  { credits: 50, priceUsd: 30 },
  { credits: 100, priceUsd: 55 },
  { credits: 250, priceUsd: 125 },
] as const;

/** Default credits granted on signup */
export const SIGNUP_CREDITS = 30;
export const SIGNUP_CREDITS_UNITS = toUnits(SIGNUP_CREDITS);

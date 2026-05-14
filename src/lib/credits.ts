/**
 * Credits are stored as plain display values in the DB.
 * 1 in DB = 1 credit displayed.
 */

export const CREDIT_UNITS = 1;

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
  UGC_AD_5S: 15,
  UGC_AD_10S: 20,
  UGC_AD_15S: 25,
  UGC_AD_20S: 30,
  PRODUCT_AD_5S: 15,
  PRODUCT_AD_10S: 20,
  PRODUCT_AD_15S: 25,
  // Backwards-compat names for older quality-based records.
  UGC_AD_SD: 15,
  UGC_AD_HD: 20,
  PRODUCT_AD_SD: 15,
  PRODUCT_AD_HD: 20,
  MOCKUP: 1,
  PRODUCT_PHOTOSHOOT: 1,
  TRYON: 5,
} as const;

/** Costs in DB units (tenths) */
export const COSTS_UNITS = {
  UGC_AD_5S: toUnits(COSTS.UGC_AD_5S),
  UGC_AD_10S: toUnits(COSTS.UGC_AD_10S),
  UGC_AD_15S: toUnits(COSTS.UGC_AD_15S),
  UGC_AD_20S: toUnits(COSTS.UGC_AD_20S),
  PRODUCT_AD_5S: toUnits(COSTS.PRODUCT_AD_5S),
  PRODUCT_AD_10S: toUnits(COSTS.PRODUCT_AD_10S),
  PRODUCT_AD_15S: toUnits(COSTS.PRODUCT_AD_15S),
  UGC_AD_SD: toUnits(COSTS.UGC_AD_SD),
  UGC_AD_HD: toUnits(COSTS.UGC_AD_HD),
  PRODUCT_AD_SD: toUnits(COSTS.PRODUCT_AD_SD),
  PRODUCT_AD_HD: toUnits(COSTS.PRODUCT_AD_HD),
  MOCKUP: toUnits(COSTS.MOCKUP),
  PRODUCT_PHOTOSHOOT: toUnits(COSTS.PRODUCT_PHOTOSHOOT),
  TRYON: toUnits(COSTS.TRYON),
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

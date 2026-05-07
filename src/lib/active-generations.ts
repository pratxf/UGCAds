export type ActiveGenerationType = "Video Ad" | "UGC Ad" | "Product Ad" | "Product Photoshoot" | "AI Try-On";

export type ActiveGeneration = {
  id: string;
  type: ActiveGenerationType;
  status: string;
  finalVideoUrl?: string | null;
  errorMessage?: string | null;
  createdAt: number;
};

export const ACTIVE_GENERATIONS_KEY = "ugcads.activeGenerations";
export const ACTIVE_GENERATIONS_EVENT = "ugcads:active-generations-changed";

export function readActiveGenerations(): ActiveGeneration[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ACTIVE_GENERATIONS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeActiveGenerations(items: ActiveGeneration[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ACTIVE_GENERATIONS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(ACTIVE_GENERATIONS_EVENT));
}

export function addActiveGeneration(item: Omit<ActiveGeneration, "createdAt">) {
  const items = readActiveGenerations().filter((existing) => existing.id !== item.id);
  writeActiveGenerations([{ ...item, createdAt: Date.now() }, ...items].slice(0, 8));
}

export function updateActiveGeneration(id: string, patch: Partial<ActiveGeneration>) {
  const items = readActiveGenerations().map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
  writeActiveGenerations(items);
}

export function removeActiveGeneration(id: string) {
  writeActiveGenerations(readActiveGenerations().filter((item) => item.id !== id));
}


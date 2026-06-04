export const SCROLL_STORAGE_KEY = "just-dom-router-scroll";

export interface ScrollPosition {
  x: number;
  y: number;
}

export function getScrollKey(
  pathname: string,
  search: URLSearchParams,
): string {
  const q = search.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function readScrollPositions(
  storage: Storage,
): Record<string, ScrollPosition> {
  try {
    const raw = storage.getItem(SCROLL_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }
    return parsed as Record<string, ScrollPosition>;
  } catch {
    return {};
  }
}

export function saveScrollPosition(
  storage: Storage,
  key: string,
  win: Window,
): void {
  const map = readScrollPositions(storage);
  map[key] = { x: win.scrollX, y: win.scrollY };
  storage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(map));
}

export function restoreScrollPosition(
  storage: Storage,
  key: string,
  win: Window,
): boolean {
  const map = readScrollPositions(storage);
  const pos = map[key];
  if (!pos) {
    return false;
  }
  win.scrollTo(pos.x, pos.y);
  return true;
}

export function scrollWindowToTop(win: Window): void {
  win.scrollTo(0, 0);
}

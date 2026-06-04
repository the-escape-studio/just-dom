import {
  getScrollKey,
  readScrollPositions,
  restoreScrollPosition,
  saveScrollPosition,
  SCROLL_STORAGE_KEY,
  scrollWindowToTop,
} from "./scroll";

describe("getScrollKey", () => {
  it("uses pathname only when search is empty", () => {
    expect(getScrollKey("/users", new URLSearchParams())).toBe("/users");
  });

  it("appends query string when search has params", () => {
    expect(getScrollKey("/users", new URLSearchParams("tab=1"))).toBe(
      "/users?tab=1",
    );
  });
});

describe("scroll storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("saves and restores scroll position", () => {
    Object.defineProperty(window, "scrollX", { value: 10, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
    const scrollTo = jest.fn();
    Object.defineProperty(window, "scrollTo", {
      value: scrollTo,
      configurable: true,
    });

    saveScrollPosition(sessionStorage, "/feed", window);
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });

    expect(restoreScrollPosition(sessionStorage, "/feed", window)).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith(10, 200);
    expect(readScrollPositions(sessionStorage)["/feed"]).toEqual({
      x: 10,
      y: 200,
    });
  });

  it("returns false when no saved position exists", () => {
    expect(restoreScrollPosition(sessionStorage, "/missing", window)).toBe(
      false,
    );
  });

  it("stores under SCROLL_STORAGE_KEY", () => {
    saveScrollPosition(sessionStorage, "/", window);
    expect(sessionStorage.getItem(SCROLL_STORAGE_KEY)).toContain('"/"');
  });
});

describe("scrollWindowToTop", () => {
  it("scrolls window to origin", () => {
    const scrollTo = jest.fn();
    Object.defineProperty(window, "scrollTo", {
      value: scrollTo,
      configurable: true,
    });
    scrollWindowToTop(window);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});

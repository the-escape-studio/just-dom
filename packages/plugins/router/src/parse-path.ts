/**
 * Parse navigation targets for both browser paths and hash-style links (`#/…`).
 */
export function parsePathFromTo(to: string): {
  pathname: string;
  search: string;
} {
  if (to.startsWith("#")) {
    const inner = to.slice(1);
    const q = inner.indexOf("?");
    if (q === -1) {
      const p = inner || "/";
      return {
        pathname: p.startsWith("/") ? p : `/${p}`,
        search: "",
      };
    }
    const pathPart = inner.slice(0, q) || "/";
    const searchPart = inner.slice(q + 1);
    return {
      pathname: pathPart.startsWith("/") ? pathPart : `/${pathPart}`,
      search: searchPart,
    };
  }

  try {
    const url = new URL(to, window.location.href);
    return {
      pathname: url.pathname,
      search: url.search.replace(/^\?/, ""),
    };
  } catch {
    return { pathname: "/", search: "" };
  }
}

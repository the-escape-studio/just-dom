import { matchRouteTree, pathnameToSegments } from "./match";
import type { RouteDefinition } from "./types";

const stubElement = (): HTMLDivElement => document.createElement("div");

describe("pathnameToSegments", () => {
  it("splits paths", () => {
    expect(pathnameToSegments("/users/1")).toEqual(["users", "1"]);
  });

  it("treats root as empty segments", () => {
    expect(pathnameToSegments("/")).toEqual([]);
    expect(pathnameToSegments("")).toEqual([]);
  });
});

describe("matchRouteTree", () => {
  const routes: readonly RouteDefinition[] = [
    {
      children: [
        { index: true, element: stubElement },
        { path: "about", element: stubElement },
        {
          path: "users/:id",
          element: stubElement,
        },
        { path: "*", element: stubElement },
      ],
    },
  ];

  it("matches index route", () => {
    const hit = matchRouteTree([], routes);
    expect(hit).not.toBeNull();
    expect(hit!.chain[hit!.chain.length - 1]?.index).toBe(true);
  });

  it("matches static segment", () => {
    const hit = matchRouteTree(["about"], routes);
    expect(hit).not.toBeNull();
    expect(hit!.params).toEqual({});
  });

  it("captures dynamic params", () => {
    const hit = matchRouteTree(["users", "42"], routes);
    expect(hit).not.toBeNull();
    expect(hit!.params.id).toBe("42");
  });

  it("matches splat", () => {
    const hit = matchRouteTree(["missing", "path"], routes);
    expect(hit).not.toBeNull();
    expect(hit!.params["*"]).toBe("missing/path");
  });
});

describe("matchRouteTree with layout", () => {
  it("nests through layout branches", () => {
    const routesWithLayout: readonly RouteDefinition[] = [
      {
        layout: ({ outlet }) => {
          const w = document.createElement("div");
          w.appendChild(outlet);
          return w;
        },
        children: [
          {
            path: "docs",
            layout: ({ outlet }) => {
              const w = document.createElement("section");
              w.appendChild(outlet);
              return w;
            },
            children: [{ path: ":slug", element: stubElement }],
          },
        ],
      },
    ];
    const hit = matchRouteTree(["docs", "intro"], routesWithLayout);
    expect(hit).not.toBeNull();
    expect(hit!.params.slug).toBe("intro");
    expect(hit!.chain.length).toBe(3);
  });
});

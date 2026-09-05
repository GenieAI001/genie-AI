import { createContext, useContext, useEffect, useState, type ReactNode, type MouseEvent } from "react";

/**
 * A hand-rolled router instead of pulling in a routing library.
 *
 * This app only has 4 routes, so a real router dependency isn't worth the
 * extra install surface — this is ~40 lines and covers exactly what's
 * needed: path matching with one `:param`, pushState navigation, and a
 * `<Link>` that doesn't reload the page.
 */

const RouterContext = createContext<{ path: string; navigate: (to: string) => void } | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(to: string) {
    window.history.pushState(null, "", to);
    setPath(to);
  }

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within a RouterProvider");
  return ctx;
}

export function useLocation(): [string, (to: string) => void] {
  const { path, navigate } = useRouter();
  return [path, navigate];
}

/** Matches `pattern` (e.g. "/scholarships/:id/edit") against the current path. */
function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const actual = pathParts[i];
    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(actual);
    } else if (p !== actual) {
      return null;
    }
  }
  return params;
}

export function useParams<T = Record<string, string>>(): Partial<T> {
  const { path } = useRouter();
  // Each Route component sets this on match via RouteParamsContext below.
  return useContext(RouteParamsContext) as Partial<T>;
}

const RouteParamsContext = createContext<Record<string, string>>({});

export function Route({ path: pattern, component: Component }: { path?: string; component: () => JSX.Element }) {
  const { path } = useRouter();
  // No `path` prop = fallback route, always renders (used as the last child of <Switch>).
  const params = pattern === undefined ? {} : matchPath(pattern, path);
  if (!params) return null;
  return (
    <RouteParamsContext.Provider value={params}>
      <Component />
    </RouteParamsContext.Provider>
  );
}

/** Renders the first matching child Route, or the fallback if none match. */
export function Switch({ children }: { children: ReactNode }) {
  const { path } = useRouter();
  const items = Array.isArray(children) ? children : [children];

  for (const child of items) {
    if (!child || typeof child !== "object" || !("props" in child)) continue;
    const pattern = (child as { props: { path?: string } }).props.path;
    if (pattern === undefined) continue; // fallback route with no `path`
    if (matchPath(pattern, path)) return child as JSX.Element;
  }

  // No pattern matched — render the last child if it has no `path` (fallback).
  const last = items[items.length - 1] as { props?: { path?: string } } | undefined;
  if (last && last.props?.path === undefined) return last as JSX.Element;
  return null;
}

export function Link({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const { navigate } = useRouter();
  function handleClick(e: MouseEvent) {
    e.preventDefault();
    navigate(href);
  }
  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

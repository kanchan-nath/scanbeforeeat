/**
 * Navigation utility for active route matching.
 * Tolerant to trailing slashes (e.g. from Next.js trailingSlash: true static export)
 * and sub-path navigations.
 */
export function isRouteActive(pathname: string | null | undefined, href: string): boolean {
  if (!pathname) return false;
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const cleanHref = href.replace(/\/+$/, "") || "/";
  if (cleanHref === "/") return cleanPath === "/";
  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
}

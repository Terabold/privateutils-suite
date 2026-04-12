import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * RedirectHandler — Enforces a single source of truth for URLs.
 * 
 * Performance/SEO optimization:
 * 1. Removes trailing slashes (except for home).
 * 2. This prevents "Duplicate without user-selected canonical" errors in GSC.
 * 3. Works in tandem with server-side _redirects.
 */
const RedirectHandler = () => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Trailing Slash Enforcement
    if (pathname !== "/" && pathname.endsWith("/")) {
      const cleanPath = pathname.slice(0, -1);
      console.log(`[SEO] Enforcing canonical URL: Redirecting to ${cleanPath}`);
      navigate(`${cleanPath}${search}${hash}`, { replace: true });
    }

    // 2. WWW to Non-WWW (Client-side fallback)
    if (window.location.hostname.startsWith("www.")) {
      const cleanHost = window.location.hostname.replace(/^www\./, "");
      console.log(`[SEO] Enforcing non-www canonical: Redirecting to ${cleanHost}`);
      window.location.replace(
        `${window.location.protocol}//${cleanHost}${window.location.pathname}${window.location.search}${window.location.hash}`
      );
    }
  }, [pathname, search, hash, navigate]);

  return null;
};

export default RedirectHandler;

"use client";

import React, { useState, useEffect, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandPageLoader } from "./BrandPageLoader";

export const NavigationLoader: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Turn off loading once pathname or searchParams change
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept click on <a> and <Link> elements
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      // Ignore external links, downloads, new tabs, anchor jumps, or javascript:
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        targetAttr === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // If clicking the current path, do not show loader
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      // Check if it's internal route
      if (href.startsWith("/")) {
        setIsNavigating(true);

        // Safety timeout so loader doesn't get stuck indefinitely
        setTimeout(() => {
          setIsNavigating(false);
        }, 5000);
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, []);

  if (!isNavigating) return null;

  return <BrandPageLoader message="Navigating..." fullScreen={true} />;
};

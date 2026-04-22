import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSubcategoryById } from "../data/loadDecks";

const THEME_CLASSES = [
  "theme-neutral",
  "theme-animals",
  "theme-geography",
  "theme-sports",
  "theme-science",
  "theme-cinema",
  "theme-mixed",
] as const;

function resolveThemeClass(pathname: string): (typeof THEME_CLASSES)[number] {
  if (pathname === "/" || pathname === "/scores") {
    return "theme-neutral";
  }
  if (pathname.startsWith("/category/")) {
    const id = pathname.split("/").filter(Boolean)[1];
    if (
      id === "animals" ||
      id === "geography" ||
      id === "sports" ||
      id === "science" ||
      id === "cinema" ||
      id === "mixed"
    ) {
      return `theme-${id}` as (typeof THEME_CLASSES)[number];
    }
    return "theme-neutral";
  }
  if (pathname.startsWith("/play/")) {
    const subId = pathname.split("/").filter(Boolean)[1];
    if (subId) {
      const resolved = getSubcategoryById(subId);
      const cid = resolved?.category.id;
      if (
        cid === "animals" ||
        cid === "geography" ||
        cid === "sports" ||
        cid === "science" ||
        cid === "cinema" ||
        cid === "mixed"
      ) {
        return `theme-${cid}` as (typeof THEME_CLASSES)[number];
      }
    }
  }
  return "theme-neutral";
}

export function CategoryThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  useEffect(() => {
    const next = resolveThemeClass(location.pathname);
    document.body.classList.remove(...THEME_CLASSES);
    document.body.classList.add(next);
    return () => {
      document.body.classList.remove(...THEME_CLASSES);
    };
  }, [location.pathname]);

  return <>{children}</>;
}

import { useEffect, useState } from "react";

const matches = (query: string) => typeof window !== "undefined" && window.matchMedia(query).matches;

/**
 * Tracks a CSS media query from React. Used by the Studio Paper pages for the
 * few layout decisions that need markup to know the breakpoint (for example,
 * whether the docs sidebar groups start expanded or collapsed).
 */
export const useMediaQuery = (query: string) => {
  const [isMatch, setIsMatch] = useState(() => matches(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setIsMatch(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return isMatch;
};

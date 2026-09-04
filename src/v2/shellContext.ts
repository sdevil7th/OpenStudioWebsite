import { createContext, useContext, useEffect, type ReactNode } from "react";

/**
 * Lets a page hand the shell a block to render inside the footer's gradient,
 * directly above the link columns. A page that ends on a dark call-to-action
 * used to paint its own gradient right against the footer's, and the two
 * angled ramps met in a visible seam — one element, one gradient fixes that.
 */
export const FooterLeadContext = createContext<(node: ReactNode | null) => void>(() => undefined);

/** Pass a memoised node: the effect re-runs whenever its identity changes. */
export const useFooterLead = (node: ReactNode | null) => {
  const setLead = useContext(FooterLeadContext);

  useEffect(() => {
    setLead(node);
    return () => setLead(null);
  }, [node, setLead]);
};

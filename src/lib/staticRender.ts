import { createContext } from "react";
import type { ReactNode } from "react";
import type { PageSeoProps } from "@/components/PageSeo";
import type { DocContent } from "@/features/docs/types";

/** Build-only context. The normal browser tree always uses the null default. */
export interface StaticRenderState {
  seo?: PageSeoProps;
  docContent?: DocContent;
  footerLead?: ReactNode;
}
export const StaticRenderContext = createContext<StaticRenderState | null>(null);

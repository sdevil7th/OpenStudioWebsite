import { useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import PrivacyChoices from "./PrivacyChoices";

/** Keep consent outside the route root, which is hidden during lazy startup. */
export default function PrivacyChoicesPortal() {
  const host = document.getElementById("openstudio-privacy");
  useLayoutEffect(() => {
    if (!host) return;
    host.querySelector("[data-privacy-prerender]")?.remove();
    host.hidden = false;
    host.removeAttribute("inert");
  }, [host]);
  return host ? createPortal(<PrivacyChoices />, host) : <PrivacyChoices />;
}

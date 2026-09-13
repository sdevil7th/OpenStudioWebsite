import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  PRIVACY_CHOICES_EVENT,
  readAnalyticsConsent,
  setAnalyticsConsent,
  subscribeToAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analyticsConsent";

const PrivacyChoices = () => {
  const choice = useSyncExternalStore(subscribeToAnalyticsConsent, readAnalyticsConsent, () => null);
  const [requested, setRequested] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const open = choice === null || requested;

  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setRequested(true);
      heading.current?.focus({ preventScroll: true });
    };
    window.addEventListener(PRIVACY_CHOICES_EVENT, show);
    return () => window.removeEventListener(PRIVACY_CHOICES_EVENT, show);
  }, []);

  useEffect(() => {
    if (requested) heading.current?.focus({ preventScroll: true });
  }, [requested]);

  const close = () => {
    setRequested(false);
    if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    returnFocus.current = null;
  };
  const choose = (nextChoice: Exclude<AnalyticsConsent, null>) => {
    setAnalyticsConsent(nextChoice);
    close();
  };

  if (!open) return null;

  // Dialogs and their overlays use z-50 and must cover the entire banner.
  return (
    <section
      aria-label="Website privacy choices"
      data-lenis-prevent
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-h-[80dvh] max-w-3xl overflow-y-auto rounded-2xl border border-white/20 bg-[#171717] p-5 text-sm text-white shadow-2xl sm:p-6"
      onKeyDown={(event) => {
        if (event.key === "Escape" && choice) close();
      }}
    >
      <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        Website analytics
      </h2>
      <p className="mt-2 leading-6 text-white/80">
        With your permission, Google Analytics measures visits and downloads, and Microsoft Clarity records website interactions for heatmaps and session replays. These tools are used on this website, not inside the OpenStudio desktop app. Rejecting them does not affect downloads or app features.
      </p>
      <p className="mt-2 leading-6 text-white/80">
        Change your choice anytime using “Privacy choices” in the footer. <Link to="/privacy" className="underline underline-offset-4">Read the privacy policy</Link>.
      </p>
      {choice && <p className="mt-2 text-white/70">Current choice: {choice === "accepted" ? "analytics allowed" : "analytics rejected"}.</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("rejected")} className="min-h-11 rounded-lg border border-white/40 px-4 py-2 font-medium hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          Reject analytics
        </button>
        <button type="button" onClick={() => choose("accepted")} className="min-h-11 rounded-lg border border-white/40 px-4 py-2 font-medium hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          Accept analytics
        </button>
        {choice && (
          <button type="button" onClick={close} className="min-h-11 rounded-lg px-4 py-2 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            Keep current choice
          </button>
        )}
      </div>
    </section>
  );
};

export default PrivacyChoices;

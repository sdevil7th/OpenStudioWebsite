import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";

import { SITE_NAME, SITE_URL } from "@/constants/site";
import { OPENSTUDIO_MARK, REPO, SHOTS } from "@/data/siteContent";

/**
 * Development-only source for `public/assets/openstudio/branding/og-image.png`.
 * `npm run generate-og` screenshots `#og-card` at 1200 × 630, so everything here
 * is static: no release fetch, no responsive sources, no animation.
 *
 * The composition mirrors the Studio Paper home hero — paper gradient, indigo
 * eyebrow, Space Grotesk headline, and the dark `sp-frame` holding the app —
 * with the frame bleeding off the right edge.
 */

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

/* The shot is 3838 × 2088; rendering it wider than the frame and pinning it
   top-left crops to the track headers and the arrangement lanes, the way
   `.sp-home-session` crops the live session on the home page. */
const SHOT_WIDTH = 1300;
const FRAME_INNER = { width: 660, height: 357 };

const PLATFORMS = ["Windows", "macOS", "Linux"];

const OgCardPage = () => {
  useEffect(() => {
    const prev = {
      background: document.body.style.background,
      display: document.body.style.display,
      justifyContent: document.body.style.justifyContent,
      alignItems: document.body.style.alignItems,
      minHeight: document.body.style.minHeight,
      padding: document.body.style.padding,
      margin: document.body.style.margin,
    };
    document.body.style.background = "#e6eaf4";
    document.body.style.display = "flex";
    document.body.style.justifyContent = "center";
    document.body.style.alignItems = "center";
    document.body.style.minHeight = "100vh";
    document.body.style.padding = "0";
    document.body.style.margin = "0";
    return () => {
      Object.assign(document.body.style, prev);
    };
  }, []);

  return (
    // `sp-root` carries the Studio Paper tokens and type; the inline styles
    // undo its page-level layout (full-height flex column) for a fixed card.
    <div
      id="og-card"
      className="sp-root relative overflow-hidden"
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        minHeight: 0,
        display: "block",
        flexShrink: 0,
        background: "var(--sp-paper)",
      }}
    >
      {/* Accent wash — indigo top-left, teal bottom-left */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(660px 460px at -6% -12%, rgba(80, 0, 255, 0.12), transparent 70%), radial-gradient(520px 420px at 4% 108%, rgba(0, 177, 143, 0.14), transparent 70%)",
        }}
      />

      {/* The app, in the dark frame, bleeding off the right edge */}
      <div
        className="sp-frame absolute"
        style={{
          left: "676px",
          top: "127px",
          padding: "10px",
          borderRadius: "18px",
          boxShadow: "0 30px 70px rgba(21, 23, 28, 0.22)",
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{ width: `${FRAME_INNER.width}px`, height: `${FRAME_INNER.height}px`, borderRadius: "12px" }}
        >
          <img
            src={SHOTS.heroTimeline}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="absolute left-0 top-0 max-w-none"
            style={{ width: `${SHOT_WIDTH}px` }}
          />
        </div>
      </div>

      {/* Copy column */}
      <div
        className="absolute flex flex-col justify-between"
        style={{ left: "56px", top: "52px", width: "620px", height: `${CARD_HEIGHT - 104}px` }}
      >
        {/* Brand lockup */}
        <div className="flex items-center gap-[11px]">
          <img src={OPENSTUDIO_MARK} width={38} height={38} alt="" aria-hidden="true" className="block" />
          <span className="[font:700_26px/1_'Space_Grotesk',_sans-serif] tracking-[-0.02em]">{SITE_NAME}</span>
        </div>

        <div>
          <div className="sp-eyebrow mb-[16px] text-[11.5px]">
            <ShieldCheck aria-hidden="true" size={15} strokeWidth={1.8} />
            Free · Open source · AGPLv3
          </div>
          <h1 className="[font:700_42px/1.04_'Space_Grotesk',_sans-serif] tracking-[-0.038em] mb-[16px]">
            Record, edit, mix, and generate. <span className="block">One free DAW.</span>
          </h1>
          <p className="sp-lede text-[16.5px] leading-[1.55] m-0 max-w-[560px]">
            Multitrack recording, MIDI, a full mixer, VST3/CLAP/LV2 hosting, graphical pitch editing, local AI
            generation and stem separation, and a Neural Amp Modeler guitar rig.
          </p>
        </div>

        {/* Platforms + where to find it */}
        <div>
          <div className="flex items-center gap-[8px] mb-[18px]">
            {PLATFORMS.map((platform) => (
              <span
                key={platform}
                className="[font:400_12px/1_'JetBrains_Mono',_ui-monospace,_monospace] text-[var(--sp-mono-muted)]"
                style={{ border: "1px solid var(--sp-hairline)", borderRadius: "4px", padding: "8px 11px" }}
              >
                {platform}
              </span>
            ))}
          </div>
          <div
            className="sp-mono flex items-center gap-[10px] text-[12px] leading-[1.4]"
            style={{ borderTop: "1px solid var(--sp-hairline)", paddingTop: "16px" }}
          >
            <span className="text-[var(--sp-accent)]">{SITE_URL.replace("https://", "")}</span>
            <span aria-hidden="true">·</span>
            <span>{REPO.url.replace("https://", "")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OgCardPage;

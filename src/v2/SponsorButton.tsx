import type { CSSProperties } from "react";

/** GitHub Sponsors button for the maintainer, as GitHub embeds it. */
export const SPONSOR_URL = "https://github.com/sponsors/sdevil7th";

export const SponsorButton = ({ style }: { style?: CSSProperties }) => (
  <iframe
    height="32"
    loading="lazy"
    src={`${SPONSOR_URL}/button`}
    style={{ border: 0, borderRadius: 6, display: "block", colorScheme: "light", ...style }}
    title="Sponsor sdevil7th"
    width="114"
  />
);

import { Heart } from "lucide-react";

/** A local button avoids loading a second React application inside a GitHub iframe. */
export const SPONSOR_URL = "https://github.com/sponsors/sdevil7th";

export const SponsorButton = ({ className = "" }: { className?: string }) => (
  <a
    href={SPONSOR_URL}
    aria-label="Sponsor sdevil7th on GitHub"
    className={`inline-flex h-8 w-[114px] items-center justify-center gap-1.5 rounded-[6px] border border-[#d1d9e0] bg-[#f6f8fa] font-sans text-xs font-semibold text-[#25292e] shadow-sm hover:bg-[#eff2f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6146ff] ${className}`}
  >
    <Heart aria-hidden="true" size={16} stroke="#bf3989" />
    Sponsor
  </a>
);

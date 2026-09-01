import type { ComponentType, CSSProperties, ReactNode } from "react";
import { ArrowRight, ShieldCheck, TriangleAlert, type LucideProps } from "lucide-react";
import { Link } from "react-router-dom";

export const ICON_GRADIENT_ID = "sp-icon-grad";

/**
 * One shared indigo→teal gradient for icon strokes. `userSpaceOnUse` with the
 * 24×24 icon viewBox keeps the ramp geometry-independent, so straight-line
 * icons paint correctly (objectBoundingBox degenerates on axis-aligned lines).
 */
export const IconGradientDefs = () => (
  <svg aria-hidden="true" focusable="false" height="0" style={{ position: "absolute" }} width="0">
    <defs>
      <linearGradient gradientUnits="userSpaceOnUse" id={ICON_GRADIENT_ID} x1="0" x2="24" y1="0" y2="24">
        <stop offset="0" stopColor="#5000ff" />
        <stop offset="1" stopColor="#00b18f" />
      </linearGradient>
    </defs>
  </svg>
);

interface GradIconProps extends LucideProps {
  icon: ComponentType<LucideProps>;
}

/** Lucide icon stroked with the shared indigo→teal gradient. */
export const GradIcon = ({ icon: Icon, ...props }: GradIconProps) => (
  <Icon aria-hidden="true" stroke={`url(#${ICON_GRADIENT_ID})`} strokeWidth={1.7} {...props} />
);

interface EyebrowProps {
  children: ReactNode;
  icon?: ComponentType<LucideProps>;
  tone?: "accent" | "teal" | "warn" | "good";
  className?: string;
}

export const Eyebrow = ({ children, icon: Icon, tone = "accent", className = "" }: EyebrowProps) => (
  <div className={`sp-eyebrow${tone !== "accent" ? ` sp-eyebrow--${tone}` : ""} ${className}`.trim()}>
    {Icon ? <Icon aria-hidden="true" size={14} strokeWidth={1.8} /> : null}
    {children}
  </div>
);

export const Kicker = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div className="sp-kicker" style={style}>
    {children}
  </div>
);

interface CtaProps {
  children: ReactNode;
  to?: string;
  href?: string;
  icon?: ComponentType<LucideProps>;
  variant?: "primary" | "sm" | "outline" | "ghost-dark" | "paper";
  className?: string;
}

/** Gradient CTA / outline button rendered as a router link or anchor. */
export const Cta = ({ children, to, href, icon: Icon, variant = "primary", className = "" }: CtaProps) => {
  const variantClass =
    variant === "sm"
      ? "sp-btn sp-btn--sm"
      : variant === "outline"
        ? "sp-btn sp-btn--outline"
        : variant === "ghost-dark"
          ? "sp-btn sp-btn--ghost-dark"
          : variant === "paper"
            ? "sp-btn sp-btn--paper"
            : "sp-btn";
  const content = (
    <>
      {Icon ? <Icon aria-hidden="true" size={variant === "sm" ? 16 : 16} strokeWidth={1.8} /> : null}
      {children}
    </>
  );
  const classes = `${variantClass} ${className}`.trim();

  if (to) {
    return (
      <Link className={classes} to={to}>
        {content}
      </Link>
    );
  }

  return (
    <a className={classes} href={href} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
      {content}
    </a>
  );
};

interface ArrowLinkProps {
  children: ReactNode;
  to?: string;
  href?: string;
  tone?: "accent" | "teal" | "plain";
  className?: string;
}

/** Underlined text link with a trailing arrow. */
export const ArrowLink = ({ children, to, href, tone = "accent", className = "" }: ArrowLinkProps) => {
  const classes = `sp-link${tone === "teal" ? " sp-link--teal" : tone === "plain" ? " sp-link--plain" : ""} ${className}`.trim();
  const content = (
    <>
      {children}
      <ArrowRight aria-hidden="true" size={13} strokeWidth={2} />
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to}>
        {content}
      </Link>
    );
  }

  return (
    <a className={classes} href={href} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
      {content}
    </a>
  );
};

/** Dark indigo→teal gradient frame around a product screenshot. */
export const Frame = ({
  alt,
  src,
  hero = false,
  className = "",
}: {
  alt: string;
  src: string;
  hero?: boolean;
  className?: string;
}) => (
  <div className={`sp-frame${hero ? " sp-frame--hero" : ""} ${className}`.trim()}>
    <img alt={alt} loading={hero ? "eager" : "lazy"} src={src} />
  </div>
);

export const WarnCallout = ({ children, label }: { children: ReactNode; label: string }) => (
  <div className="sp-callout-warn">
    <div className="sp-callout-label" style={{ color: "var(--sp-warn)" }}>
      <TriangleAlert aria-hidden="true" size={13} strokeWidth={1.8} />
      {label}
    </div>
    <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
      {children}
    </p>
  </div>
);

export const HonestCallout = ({ children }: { children: ReactNode }) => (
  <div className="sp-callout-honest">
    <div className="sp-callout-label" style={{ color: "var(--sp-mono-muted)" }}>
      <ShieldCheck aria-hidden="true" size={13} strokeWidth={1.8} />
      Plainly, so you can decide
    </div>
    <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
      {children}
    </p>
  </div>
);

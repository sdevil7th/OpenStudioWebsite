import { useEffect } from "react";

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
    document.body.style.background = "#000";
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
    <div
      id="og-card"
      style={{ width: "1200px", height: "630px", flexShrink: 0 }}
      className="relative overflow-hidden bg-[#0e0e0e]"
    >
      {/* Background - hero timeline screenshot */}
      <img
        src="/assets/openstudio/screenshots/hero-timeline.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        decoding="async"
      />

      {/* Obsidian overlay - horizontal fade */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(14,14,14,0.96) 0%, rgba(14,14,14,0.38) 100%)",
        }}
      />
      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-80"
      />

      {/* Ambient glow — purple top-left */}
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
      />
      {/* Ambient glow — green bottom-right */}
      <div
        aria-hidden="true"
        className="absolute -bottom-40 right-20 h-80 w-80 rounded-full bg-secondary/10 blur-[100px]"
      />

      {/* Signal slat decoration — right edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 flex w-28 items-stretch gap-3.5 p-4 opacity-20"
      >
        <div className="w-1 bg-white/20" />
        <div className="w-1 bg-white/20" />
        <div className="w-1 self-center bg-secondary" style={{ height: "66%", boxShadow: "0 0 18px rgba(74,225,118,0.85)" }} />
        <div className="w-1 bg-white/20" />
        <div className="w-1 bg-white/20" />
      </div>

      {/* Main content */}
      <div className="relative z-20 flex h-full flex-col justify-between p-16">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          {/* Logo + wordmark */}
          <div className="flex items-center gap-5">
            <div style={{ width: "78px", height: "78px", flexShrink: 0 }}>
              <img src="/assets/openstudio/branding/openstudio-mark-216.webp" width="78" height="78" alt="OpenStudio" />
            </div>
            <span className="font-headline font-bold tracking-tighter text-foreground" style={{ fontSize: "62px", lineHeight: 1 }}>
              OpenStudio
            </span>
          </div>

          {/* Badge */}
          <div
            className="rounded-full border border-white/20 px-5 py-2"
            style={{ background: "rgba(30,32,44,0.72)", backdropFilter: "blur(20px)" }}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
              Open Source / AI-Native
            </span>
          </div>
        </div>

        {/* ── Main typography ── */}
        <div style={{ maxWidth: "720px" }}>
          {/* Eyebrow */}
          <div className="mb-3 flex items-center gap-3">
            <span className="h-[2px] w-8 bg-primary" />
            <span className="font-mono text-sm uppercase tracking-widest text-primary/70">
              Craft sound faster
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mb-6 font-headline font-bold text-foreground"
            style={{ fontSize: "68px", lineHeight: 0.95, letterSpacing: "-0.03em" }}
          >
            Open-Source,
            <br />
            <span className="italic text-primary">AI-Native</span> DAW
          </h1>

          {/* Subtext glass card */}
          <div
            className="rounded-xl border-l-4 border-primary/50 p-5"
            style={{
              maxWidth: "560px",
              background: "rgba(28,30,42,0.68)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="font-body text-[17px] font-light leading-relaxed text-muted-foreground">
              Precision engineering meets neural synthesis, with{" "}
              <span className="font-mono text-secondary">AI stem separation</span>, ultra-transparent
              pitch editing, MIDI instruments, and plugin hosting for the modern producer.
            </p>
          </div>
        </div>

        {/* ── Footer row ── */}
        <div className="flex items-end justify-between">
          {/* Stats */}
          <div className="flex gap-10">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Spectral Engine
              </span>
              <span className="font-display text-xl tracking-tighter text-foreground">
                192<span className="text-primary">kHz</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Release
              </span>
              <span className="font-display text-xl tracking-tighter text-secondary">PUBLIC</span>
            </div>
          </div>

          {/* Platform + GitHub */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Available on
              </div>
              <div className="flex items-center gap-4 font-mono text-sm text-foreground/50">
                <span>Windows</span>
                <span>macOS</span>
                <span>Linux</span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/15" />

            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                Open-Source
              </span>
              <span className="font-headline text-[17px] font-semibold text-foreground">
                github.com/sdevil7th/openstudio
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OgCardPage;

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: () => void;
}

/** Optional artwork fails locally; route failures offer a full reload of stale chunks. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <section className="mx-auto min-h-[70svh] max-w-3xl px-5 py-24" role="alert">
        <h1 className="text-3xl font-semibold">This page could not load</h1>
        <p className="mt-4 leading-7">Check your connection and reload to try again.</p>
        <button className="sp-btn mt-6" onClick={() => window.location.reload()} type="button">
          Reload page
        </button>
      </section>
    );
  }
}

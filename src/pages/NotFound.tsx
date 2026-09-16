import { Link, useLocation } from "react-router-dom";
import PageSeo from "@/components/PageSeo";

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <section className="sp-container min-h-[75svh] py-24 text-center">
      <PageSeo description="The requested OpenStudio page could not be found." path={pathname} robots="noindex, nofollow" title="Page not found | OpenStudio" />
      <p className="sp-kicker">404</p>
      <h1 className="sp-h1">Page not found</h1>
      <p className="sp-body mx-auto max-w-xl">This link may have moved. Explore the documentation or return to the homepage.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link className="sp-btn" to="/">Return home</Link>
        <Link className="sp-btn sp-btn--outline" to="/docs">Documentation</Link>
      </div>
    </section>
  );
}

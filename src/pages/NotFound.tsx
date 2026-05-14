import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const NotFound = () => (
  <main
    className="flex min-h-screen items-center px-4 pb-16 pt-28 md:px-6 md:pt-32 route-appear"
    id="main-content"
  >
    <div className="mx-auto max-w-3xl border border-white/10 p-8 text-center md:p-12">
      <p className="signal-label mb-4">404</p>
      <h1 className="text-4xl font-semibold text-white md:text-5xl">That route is outside the current release scaffold.</h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
        The page you requested is not part of the current OpenStudio marketing release. Use the feature or download routes below to get back into the live scaffold.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Return home
          </Link>
        </Button>
        <Button asChild>
          <Link
            onClick={() =>
              trackEvent("primary_cta_clicked", {
                cta_name: "go_to_download",
                destination_path: "/download",
                source: "not_found_page",
              })
            }
            to="/download"
          >
            <Download className="h-4 w-4" />
            Go to download
          </Link>
        </Button>
      </div>
    </div>
  </main>
);

export default NotFound;

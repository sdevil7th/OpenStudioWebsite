import { motion } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <motion.main
    className="flex min-h-screen items-center px-4 pb-16 pt-28 md:px-6 md:pt-32"
    id="main-content"
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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
          <Link to="/download">
            <Download className="h-4 w-4" />
            Go to download
          </Link>
        </Button>
      </div>
    </div>
  </motion.main>
);

export default NotFound;

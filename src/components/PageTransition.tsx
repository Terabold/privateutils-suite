import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

interface PageTransitionProps {
  children: ReactNode;
}

// SSR guard: framer-motion's motion.div accesses `document` during renderToString,
// which throws "document is not defined". React 18 catches this at the nearest Suspense
// boundary and shows the fallback instead of the real page content, causing AdSense rejection.
// On the server, we render a plain passthrough div instead.
const isServer = typeof window === "undefined";

const PageTransition = ({ children }: PageTransitionProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (isServer || prefersReducedMotion) {
    return <div className="page-motion-wrapper">{children}</div>;
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="page-motion-wrapper"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

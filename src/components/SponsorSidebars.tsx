import React from "react";
import AdPlaceholder from "./AdPlaceholder";
import { cn } from "@/lib/utils";

interface SponsorSidebarsProps {
  position: "left" | "right";
  className?: string;
}

/**
 * Standardized Sponsor Sidebar component for the Privacy Tools Suite.
 * Fixes positioning issues where sidebars were either too close to central elements
 * or being clipped by the viewport edge.
 */
const SponsorSidebars = ({ position, className }: SponsorSidebarsProps) => {
  return (
    <aside 
      className={cn(
        "hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 duration-1000 animate-in fade-in",
        // LEFT SIDEBAR: Added mr-12 to move it LEFT (further away from the central content)
        position === "left" 
            ? "slide-in-from-left-8 mr-12" 
            // RIGHT SIDEBAR: Added mr-12 to move it LEFT (further away from the viewport edge/clipping)
            : "slide-in-from-right-8 mr-12",
        className
      )}
    >
       <AdPlaceholder 
         format="rectangle" 
         className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50 shadow-2xl lg:shadow-primary/5" 
       />
       <AdPlaceholder 
         format="rectangle" 
         className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50 shadow-2xl lg:shadow-primary/5" 
       />
       <AdPlaceholder 
         format="rectangle" 
         className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50 shadow-2xl lg:shadow-primary/5" 
       />
    </aside>
  );
};

export default SponsorSidebars;

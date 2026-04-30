import React from "react";
import AdBox from "./AdBox";
import { cn } from "@/lib/utils";

interface SponsorSidebarsProps {
  position: "left" | "right";
  className?: string;
}

/**
 * Standardized Sponsor Sidebar component for the Privacy Tools Suite.
 * Fixes positioning issues where sidebars were causing horizontal clipping on 1080p.
 * Visible on 1536px screens (standard high-res laptops) and larger since ad stack is now shorter.
 */
const SponsorSidebars = ({ position, className }: SponsorSidebarsProps) => {
  return (
    <aside
      className={cn(
        "hidden min-[1536px]:flex flex-col gap-4 sticky top-[24px] h-fit self-start w-[300px] shrink-0 duration-1000 animate-in fade-in",
        position === "left"
          ? "slide-in-from-left-8 ml-8 mr-12"
          : "slide-in-from-right-8 ml-12 mr-8",
        className
      )}
    >
      {/* Premium Sidebar Ad (300x600) */}
      <div className="min-h-[600px] w-full">
        <AdBox adFormat="vertical" width={300} height={600} label="300x600 AD" />
      </div>
    </aside>
  );
};

export default SponsorSidebars;


import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface AdPlaceholderProps {
  format: "banner" | "header_banner" | "rectangle" | "vertical";
  className?: string;
}

export const AdPlaceholder = ({ format, className }: AdPlaceholderProps) => {
  const dimensions = {
    banner: "w-full max-w-[728px] h-[90px]",
    header_banner: "w-full lg:max-w-[1000px] h-[90px] lg:h-[120px]",
    rectangle: "w-[300px] h-[250px]",
    vertical: "w-[160px] h-[600px]",
  };

  return (
    <div className="flex flex-col gap-1.5 group/ad">
      <div className="flex items-center justify-between px-2 opacity-30 group-hover/ad:opacity-60 transition-opacity">
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Sponsored</span>
        <Info className="h-2 w-2 text-muted-foreground" />
      </div>
      <div
        className={cn(
          dimensions[format],
          "glass-morphism rounded-2xl shadow-sm overflow-hidden relative border-dashed border-2 border-primary/5 hover:border-primary/20 transition-all duration-500",
          className
        )}
      >
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
      </div>
    </div>
  );
};

export default AdPlaceholder;

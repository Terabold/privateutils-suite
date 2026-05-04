import React from "react";
import { cn } from "@/lib/utils";
import { categoryConfig } from "@/config/categories";
import { ChevronRight, History, Star } from "lucide-react";

interface TableOfContentsProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  className?: string;
}

const TableOfContents = ({ 
  selectedCategory, 
  setSelectedCategory,
  className 
}: TableOfContentsProps) => {
  const categories = Object.keys(categoryConfig).filter(k => k !== "All");

  const NavButton = ({ 
    label, 
    id, 
    icon: Icon, 
    color 
  }: { 
    label: string, 
    id: string | null, 
    icon: any, 
    color: string 
  }) => (
    <button
      onClick={() => setSelectedCategory(id)}
      className={cn(
        "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-500 w-full mb-2 relative overflow-hidden",
        selectedCategory === id 
          ? "bg-white/90 dark:bg-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] border-t border-white/40 dark:border-white/20 scale-[1.03] z-20" 
          : "hover:bg-zinc-200/60 dark:hover:bg-white/10 border border-black/[0.03] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] active:scale-95 z-10"
      )}
    >
      {/* Background Glow for Active/Hover State */}
      <div 
        className={cn(
          "absolute inset-0 opacity-0 blur-2xl transition-opacity duration-700",
          selectedCategory === id ? "opacity-10 animate-pulse" : "group-hover:opacity-5"
        )}
        style={{ backgroundColor: color }}
      />
      
      <div className="flex items-center gap-3 relative z-10">
        <div 
          className={cn(
            "p-2 rounded-lg transition-all duration-500 relative",
            selectedCategory === id 
              ? "shadow-[0_0_20px_-5px_var(--btn-glow)] scale-110" 
              : "opacity-60 group-hover:opacity-100 group-hover:scale-105"
          )}
          style={{ 
            backgroundColor: selectedCategory === id ? color : "transparent",
            color: selectedCategory === id ? "white" : color,
            "--btn-glow": color
          } as React.CSSProperties}
        >
          <Icon className="h-4 w-4" />
          {selectedCategory === id && (
             <div className="absolute inset-0 rounded-lg animate-ping opacity-20" style={{ backgroundColor: color }} />
          )}
        </div>
        <span className={cn(
          "text-[12px] font-black tracking-tight uppercase italic transition-all duration-500",
          selectedCategory === id 
            ? "text-foreground translate-x-1" 
            : "opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5"
        )}>{label}</span>
      </div>
      
      {selectedCategory === id ? (
        <div className="h-1.5 w-1.5 rounded-full relative z-10 mr-1" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
      ) : (
        <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-4 group-hover:opacity-30 group-hover:translate-x-0 transition-all duration-500" />
      )}
    </button>
  );

  return (
    <aside className={cn(
      "hidden xl:flex flex-col sticky top-0 h-screen w-72 shrink-0 px-4 py-8 select-none border-r border-border/5 bg-zinc-50/10 dark:bg-zinc-950/10 backdrop-blur-3xl z-[30] scrollbar-hide",
      className
    )}>
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-scroll::-webkit-scrollbar { display: none; }
        .sidebar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div className="flex flex-col h-full overflow-y-auto px-4 sidebar-scroll pt-2">
        <div className="flex flex-col">
          <div className="px-3 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-6 bg-primary rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/70">Jump to</span>
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground leading-none">Browse <span className="opacity-40">Tools</span></h2>
          </div>
          
          <div className="flex flex-col">
            <NavButton 
              label="History" 
              id="History" 
              icon={History} 
              color="hsl(var(--primary))" 
            />
            <NavButton 
              label="Favorites" 
              id="Favorites" 
              icon={Star} 
              color="#fbbf24" 
            />

            {categories.map((cat) => {
              const config = categoryConfig[cat];
              return (
                <NavButton
                  key={cat}
                  label={cat}
                  id={cat}
                  icon={config.icon}
                  color={`hsl(${config.hsl})`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TableOfContents;

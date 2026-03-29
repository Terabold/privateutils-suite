import { Moon, Sun, Search, X, Video, ImageIcon, Music, ShieldCheck, Wrench, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategory?: string | null;
  setSelectedCategory?: (category: string | null) => void;
  categories?: string[];
}

const categoryIcons: Record<string, any> = {
  "Video Studio": Video,
  "Image Studio": ImageIcon,
  "Audio Lab": Music,
  "Privacy Belt": ShieldCheck,
  "Utility Belt": Wrench,
};

const Navbar = ({ 
  darkMode, 
  onToggleDark,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = []
}: NavbarProps) => {
  const isSearchActive = !!setSearchQuery;

  return (
    <header className="sticky top-0 z-50 border-b glass-morphism h-24 md:h-28 transition-all duration-300">
      <div className="container mx-auto flex h-full items-center justify-between px-4 lg:px-8 gap-4 md:gap-12">
        
        {/* Logo Section (Strictly Centered & Scaled) */}
        <div className="flex items-center gap-2 group cursor-pointer select-none shrink-0 min-w-[140px] md:min-w-[200px]">
          <div className="h-2 w-6 md:w-10 bg-primary rounded-full group-hover:w-14 transition-all duration-500" />
          <span className="text-xl md:text-2xl font-black tracking-tight text-foreground font-display uppercase italic">
            Local<span className="text-primary not-italic">Tools</span>
          </span>
        </div>
        
        {/* Global Commanding Search (Mathematically Balanced UI) */}
        {isSearchActive && (
          <div className="hidden md:flex flex-col grow max-w-2xl gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder="Instant Studio Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-11 pr-10 text-sm font-medium bg-zinc-950/40 border-primary/5 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
             </div>
             
             {/* Integrated Categories (Slimer Tactile Pills) */}
             <div className="flex flex-wrap items-center gap-2 justify-center">
                <button
                  onClick={() => setSelectedCategory?.(null)}
                  className={`px-5 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center gap-2 border border-transparent ${
                    selectedCategory === null ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  All
                </button>
                {categories.map((category) => {
                  const Icon = categoryIcons[category] || Sparkles;
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory?.(category)}
                      className={`px-5 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center gap-2 border border-transparent ${
                        isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {category.split(' ')[0]}
                    </button>
                  );
                })}
             </div>
          </div>
        )}

        {/* Action Belt (Enlarged & Centered) */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0 md:min-w-[100px] justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleDark} 
            aria-label="Toggle dark mode" 
            className="rounded-2xl hover:bg-primary/10 transition-colors h-10 w-10 md:h-14 md:w-14 border border-transparent hover:border-primary/10"
          >
            {darkMode ? <Sun className="h-5 w-5 md:h-8 md:w-8 text-primary" /> : <Moon className="h-5 w-5 md:h-8 md:w-8" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Extension Bar (Visible only when mobile and search active) */}
      {isSearchActive && (
        <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              className="h-8 pl-9 pr-8 text-xs bg-zinc-950/40 border-primary/5 rounded-2xl focus-visible:ring-primary/10"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

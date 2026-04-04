import { useState } from "react";
import { Moon, Sun, Search, X, Video, ImageIcon, Music, ShieldCheck, Wrench, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategory?: string | null;
  setSelectedCategory?: (category: string | null) => void;
  categories?: string[];
}

const categoryThemes: Record<string, { color: string, icon: any }> = {
  "Video Studio": { color: "221.2 83.2% 53.3%", icon: Video },
  "Image Studio": { color: "24.6 95% 53.1%", icon: ImageIcon },
  "Privacy Belt": { color: "280 85% 60%", icon: ShieldCheck },
  "Audio Lab": { color: "142.1 76.2% 36.3%", icon: Music },
  "Utility Belt": { color: "38 92% 50%", icon: Wrench },
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
  const isHomePage = !!setSearchQuery;
  const navigate = useNavigate();
  const location = useLocation();
  const [toolSearchQuery, setToolSearchQuery] = useState("");

  const handleToolSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (toolSearchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(toolSearchQuery.trim())}`);
    }
  };

  const handleQuickSearch = (value: string) => {
    setToolSearchQuery(value);
  };

  return (
    <header className="sticky top-0 z-50 border-b glass-morphism transition-all duration-300 py-3">
      <div className="container mx-auto max-w-[1400px] flex h-[72px] items-center justify-between px-4 lg:px-8 gap-4 md:gap-12">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer select-none shrink-0 no-underline">
          <div className="h-1.5 w-10 bg-primary/10 rounded-full relative overflow-hidden transition-all duration-500 group-hover:bg-primary/20">
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-700" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground font-display uppercase italic transition-all duration-300 group-hover:text-shadow-glow">
            Local<span className="text-primary not-italic">Tools</span>
          </span>
        </Link>

        {/* Search + Categories */}
        <div className="hidden md:flex flex-col grow max-w-2xl gap-3">
          <form onSubmit={handleToolSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Instant Studio Search..."
              value={isHomePage ? searchQuery : toolSearchQuery}
              onChange={(e) => {
                if (isHomePage && setSearchQuery) {
                  setSearchQuery(e.target.value);
                } else {
                  handleQuickSearch(e.target.value);
                }
              }}
              className="h-9 pl-11 pr-10 text-sm font-medium bg-zinc-900/60 dark:bg-card/40 border-primary/5 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
            />
            {(isHomePage ? searchQuery : toolSearchQuery) && (
              <button
                type="button"
                onClick={() => {
                  if (isHomePage && setSearchQuery) {
                    setSearchQuery("");
                  } else {
                    setToolSearchQuery("");
                  }
                }}
                className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Category pills — always visible */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <button
              onClick={() => {
                if (isHomePage) {
                  setSelectedCategory?.(null);
                } else {
                  navigate("/");
                }
              }}
              style={{ 
                "--glow-color": "hsl(250 85% 60% / 0.4)",
                "--border-glow": "hsl(250 85% 60% / 0.2)"
              } as React.CSSProperties}
              className={`px-5 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 flex items-center gap-2 border ${
                isHomePage && selectedCategory === null 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105 border-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 dark:bg-white/5 border-transparent hover:border-[var(--border-glow)] hover:shadow-[0_0_20px_var(--glow-color)]"
                }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              All
            </button>
            {(isHomePage ? categories : Object.keys(categoryThemes)).map((category) => {
              const theme = categoryThemes[category] || { color: "250 85% 60%", icon: Sparkles };
              const Icon = theme.icon;
              const isActive = isHomePage && selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => {
                    if (isHomePage) {
                      setSelectedCategory?.(category);
                    } else {
                      navigate(`/?category=${encodeURIComponent(category)}`);
                    }
                  }}
                  style={{ 
                    "--glow-color": `hsl(${theme.color} / 0.4)`,
                    "--border-glow": `hsl(${theme.color} / 0.2)`
                  } as React.CSSProperties}
                  className={`px-5 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 flex items-center gap-2 border ${
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105 border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 dark:bg-white/5 border-transparent hover:border-[var(--border-glow)] hover:shadow-[0_0_20px_var(--glow-color)]"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {category.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 md:min-w-[140px] justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="rounded-2xl hover:bg-primary/10 transition-all h-14 w-14 border border-transparent hover:border-primary/20 bg-primary/5 shadow-inner"
          >
            {darkMode ? <Sun className="h-7 w-7 text-primary shadow-glow" /> : <Moon className="h-7 w-7" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-300">
        <form onSubmit={handleToolSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={isHomePage ? searchQuery : toolSearchQuery}
            onChange={(e) => {
              if (isHomePage && setSearchQuery) {
                setSearchQuery(e.target.value);
              } else {
                handleQuickSearch(e.target.value);
              }
            }}
            className="h-8 pl-9 pr-8 text-xs bg-zinc-900/60 dark:bg-card/40 border-primary/5 rounded-2xl focus-visible:ring-primary/10"
          />
        </form>
      </div>
    </header>
  );
};

export default Navbar;

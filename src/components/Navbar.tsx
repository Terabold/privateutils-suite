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

const categoryIcons: Record<string, any> = {
  "Video Studio": Video,
  "Image Studio": ImageIcon,
  "Privacy Belt": ShieldCheck,
  "Audio Lab": Music,
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
          <div className="h-2 w-8 bg-primary rounded-full group-hover:w-14 transition-all duration-500" />
          <span className="text-xl font-black tracking-tight text-foreground font-display uppercase italic text-hover-glow transition-all duration-300">
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
              className="h-9 pl-11 pr-10 text-sm font-medium bg-zinc-950/40 border-primary/5 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-inner"
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
              className={`px-5 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center gap-2 border border-transparent ${isHomePage && selectedCategory === null ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:text-foreground hover:bg-primary/5 hover-glow"
                }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              All
            </button>
            {(isHomePage ? categories : Object.keys(categoryIcons)).map((category) => {
              const Icon = categoryIcons[category] || Sparkles;
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
                  className={`px-5 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center gap-2 border border-transparent ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:text-foreground hover:bg-primary/5 hover-glow"
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
            className="h-8 pl-9 pr-8 text-xs bg-zinc-950/40 border-primary/5 rounded-2xl focus-visible:ring-primary/10"
          />
        </form>
      </div>
    </header>
  );
};

export default Navbar;

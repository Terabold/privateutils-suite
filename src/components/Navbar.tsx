import { useState, useEffect, useMemo, useRef } from "react";
import { Moon, Sun, Search, X, Video, ImageIcon, Music, ShieldCheck, Wrench, Sparkles, Command, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { categoryConfig } from "@/config/categories";
import { tools } from "@/components/ToolsGrid";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategory?: string | null;
  setSelectedCategory?: (category: string | null) => void;
  categories?: string[];
  activeSection?: string | null;
}

const Navbar = ({
  darkMode,
  onToggleDark,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  activeSection
}: NavbarProps) => {
  const isHomePage = !!setSearchQuery;
  const navigate = useNavigate();
  const location = useLocation();
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Identify current category for tool pages
  const currentCategory = useMemo(() => {
    if (isHomePage) return selectedCategory;
    const tool = tools.find(t => t.to === location.pathname);
    return tool?.category || null;
  }, [location.pathname, isHomePage, selectedCategory]);

  // Determine Logo and Accent colors
  const activeTheme = useMemo(() => {
    if (activeSection) {
      const sectionName = Object.keys(categoryConfig).find(
        key => key.replace(/\s+/g, '-').toLowerCase() === activeSection
      );
      if (sectionName) return categoryConfig[sectionName];
    }
    if (currentCategory) {
      return categoryConfig[currentCategory];
    }
    return categoryConfig["All"];
  }, [activeSection, currentCategory]);

  const handleToolSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (toolSearchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(toolSearchQuery.trim())}`);
      setShowSearchOverlay(false);
    }
  };

  const filteredSearchResults = useMemo(() => {
    const q = (isHomePage ? searchQuery : toolSearchQuery) || "";
    if (q.length < 2) return [];
    return tools.filter(t => 
      t.title.toLowerCase().includes(q.toLowerCase()) || 
      t.description.toLowerCase().includes(q.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
    ).slice(0, 6);
  }, [searchQuery, toolSearchQuery, isHomePage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchOverlay(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic Browser Tab Title Management
  useEffect(() => {
    if (isHomePage) {
      if (selectedCategory) {
        document.title = `${selectedCategory} | PrivateUtils`;
      } else if (searchQuery) {
        document.title = `Search: ${searchQuery} | PrivateUtils`;
      } else {
        document.title = "PrivateUtils | Studio";
      }
    } else {
      const tool = tools.find(t => t.to === location.pathname);
      if (tool) {
        document.title = `${tool.title} | PrivateUtils`;
      } else {
        document.title = "PrivateUtils | Studio";
      }
    }
  }, [location.pathname, isHomePage, selectedCategory, searchQuery]);

  return (
    <header className="sticky top-0 z-[100] border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all duration-500 py-4">
      <div className="container mx-auto max-w-[1500px] flex h-[80px] items-center justify-between px-4 lg:px-8 gap-4 md:gap-12">

        {/* Logo */}
        <Link 
          to="/" 
          className="group flex items-center justify-start gap-3 cursor-pointer select-none no-underline outline-none shrink-0 md:min-w-[240px]"
        >
          {/* Hardware-Stabilized Icon Box */}
          <div 
            className="h-11 w-11 rounded-lg flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:scale-105 shrink-0 overflow-hidden"
            style={{ backgroundColor: `hsl(${activeTheme?.hsl || 'var(--primary)'})` }}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-[55%] h-[55%] pointer-events-none" 
            >
              <path d="M5 4h9a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-4v6H5V4zm5 7h4a2 2 0 0 0 0-4h-4v4z" />
            </svg>
          </div>
          {/* Pixel-Perfect Text Anchor */}
          <div className="flex h-11 items-center gap-1">
            <span className="text-[28px] font-black tracking-tighter text-foreground font-display uppercase italic transition-all duration-300 group-hover:text-shadow-glow flex items-center leading-none">
              Private<span className="not-italic logo-text-transition" style={{ color: `hsl(${activeTheme?.hsl || 'var(--primary)'})` }}>Utils</span>
            </span>
          </div>
        </Link>

        {/* Search + Categories */}
        <div className="hidden md:flex flex-col grow max-w-2xl gap-3 relative">
          <div ref={searchRef} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Instant Magic Search... (Alt + S)"
              value={isHomePage ? searchQuery : toolSearchQuery}
              onFocus={() => setShowSearchOverlay(true)}
              onChange={(e) => {
                if (isHomePage && setSearchQuery) {
                  setSearchQuery(e.target.value);
                } else {
                  setToolSearchQuery(e.target.value);
                }
                setShowSearchOverlay(true);
              }}
              className="h-11 pl-11 pr-10 text-sm font-semibold bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-transparent text-muted-foreground placeholder:text-muted-foreground/40 rounded-2xl focus-visible:ring-primary/20 transition-all shadow-sm"
            />
            {showSearchOverlay && filteredSearchResults.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-[110]">
                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {filteredSearchResults.map(tool => (
                    <Link
                      key={tool.to}
                      to={tool.to}
                      onClick={() => setShowSearchOverlay(false)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all text-left group/result border border-transparent hover:border-white/5 no-underline"
                    >
                      <div 
                        className="h-9 w-9 rounded-full flex items-center justify-center group-hover/result:scale-110 transition-transform shadow-sm flex-shrink-0"
                        style={{ backgroundColor: `hsl(${categoryConfig[tool.category]?.hsl} / 0.15)`, color: `hsl(${categoryConfig[tool.category]?.hsl})` }}
                      >
                        <div className="h-5 w-5 flex items-center justify-center">
                          {tool.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground tracking-tight">{tool.title}</p>
                        <p className="text-xs text-muted-foreground truncate font-medium italic">{tool.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/result:text-foreground transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {Object.keys(categoryConfig).filter(k => k !== "All").map((category) => {
              const theme = categoryConfig[category];
              const Icon = theme.icon;
              const isActive = (isHomePage && selectedCategory === category) || (!isHomePage && currentCategory === category);
              const categoryTools = tools.filter(t => t.category === category);

              return (
                <DropdownMenu key={category}>
                  <DropdownMenuTrigger asChild>
                    <button
                      style={{
                        "--glow-color": `hsl(${theme.hsl} / 0.4)`,
                        "--border-glow": `hsl(${theme.hsl} / 0.2)`,
                        backgroundColor: isActive ? `hsl(${theme.hsl})` : undefined
                      } as React.CSSProperties}
                      className={`px-6 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-500 flex items-center gap-2.5 border ${isActive
                          ? "text-white shadow-lg scale-105 border-white/20"
                          : "text-muted-foreground hover:text-foreground bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-transparent hover:border-[var(--border-glow)] hover:shadow-[0_0_20px_var(--glow-color)] shadow-sm"
                        }`}
                    >
                      <Icon className="h-3.5 w-3.5 transition-colors" style={{ color: isActive ? 'white' : `hsl(${theme.hsl})` }} />
                      {category.split(' ')[0]}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="center" 
                    className="w-56 bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl p-2 z-[110]"
                  >
                    <div className="px-3 py-2 flex items-center gap-3">
                      <theme.icon className="h-4 w-4" style={{ color: `hsl(${theme.hsl})` }} />
                      <span className="text-base font-bold font-display tracking-tight" style={{ color: `hsl(${theme.hsl})` }}>
                        {category}
                      </span>
                    </div>
                    <DropdownMenuSeparator className="bg-white/5" />
                    {categoryTools.map(tool => (
                      <DropdownMenuItem 
                        key={tool.to}
                        asChild
                        className="rounded-xl cursor-pointer p-2 focus:bg-muted/50 focus:text-foreground group/item"
                      >
                        <Link
                          to={tool.to}
                          className="flex items-center gap-3 w-full no-underline"
                          style={{ ["--hover-text" as any]: `hsl(${theme.hsl})` } as React.CSSProperties}
                        >
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-all shadow-sm"
                            style={{ backgroundColor: `hsl(${theme.hsl} / 0.1)`, color: `hsl(${theme.hsl})` }}
                          >
                            <div className="h-4.5 w-4.5 flex items-center justify-center">
                              {tool.icon}
                            </div>
                          </div>
                          <span 
                            className="text-sm font-bold transition-colors text-foreground group-hover/item:text-[var(--hover-text)]"
                          >
                            {tool.title}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                setToolSearchQuery(e.target.value);
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

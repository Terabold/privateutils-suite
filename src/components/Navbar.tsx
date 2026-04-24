import { useState, useEffect, useMemo, useRef } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Moon, Sun, Search, X, Video, ImageIcon, Music, ShieldCheck, Wrench, Sparkles, Command, ChevronRight, Terminal, Type, Zap, Coffee, BookOpen, HelpCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { categoryConfig } from "@/config/categories";
import { tools, Tool } from "@/components/ToolsGrid";
import { searchTools } from "@/lib/search";
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
  darkMode: propDarkMode,
  onToggleDark: propOnToggleDark,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  activeSection
}: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode: hookDarkMode, toggleDark: hookToggleDark } = useDarkMode();

  const darkMode = propDarkMode !== undefined ? propDarkMode : hookDarkMode;
  const onToggleDark = propOnToggleDark || hookToggleDark;

  const isHomePage = location.pathname === "/" || !!setSearchQuery;
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Identify current category for tool pages
  const currentCategory = useMemo(() => {
    if (isHomePage) return selectedCategory;
    const normalizedPath = location.pathname.replace(/\/$/, "");
    const tool = tools.find(t => t.to === normalizedPath || t.to === location.pathname);
    return tool?.category || null;
  }, [location.pathname, isHomePage, selectedCategory]);

  // Determine Logo and Accent colors
  const activeTheme = useMemo(() => {
    if (activeSection) {
      // Map specialized content sections to existing themes
      if (activeSection === "privacy-manifesto") return categoryConfig["Privacy Belt"];
      if (activeSection === "hero" || activeSection === "benefits" || activeSection === "search-results") return categoryConfig["All"];

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

    // Using fuzzy search for better discovery and typo tolerance
    return searchTools(tools as Tool[], q).slice(0, 6);
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

  // Dynamic Browser Tab Title and Metadata Management
  // Removed redundant SEO logic - now handled by SEOHead.tsx component

  return (
    <header className="global-navbar sticky top-0 z-[100] w-full transition-theme shadow-lg shadow-black/20 overflow-visible">
      {/* 0. Authority Ribbon - Professional SaaS Tier (Desktop Only) */}
      <div className="hidden lg:flex w-full bg-zinc-950/80 backdrop-blur-md border-b border-white/5 py-1.5 px-8">
        <div className="container mx-auto max-w-[1500px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors no-underline">The Mission</Link>
            <Link to="/technical-architecture" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors no-underline">Engine Architecture</Link>
            <Link to="/security-architecture" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors no-underline">Security Protocols</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/faq" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors no-underline">Technical FAQ</Link>
            <Link to="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors no-underline">Contact Support</Link>
          </div>
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-xl border-b border-white/5 py-1.5 w-full">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1500px] flex flex-col gap-2">

          {/* Tier 1: Brand & Absolute Center Actions */}
          <div className="flex items-center justify-between gap-4 lg:gap-12 w-full h-[50px] lg:h-[65px] relative">

            {/* Left: Branding & Mobile Resource Trigger */}
            <div className="flex items-center gap-2 lg:gap-3 justify-start min-w-0">
              <div className="lg:hidden flex items-center gap-1.5">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Engineering Hub Menu"
                      className="rounded-xl bg-primary/5 hover:bg-primary/10 border border-white/5 h-9 w-9 shadow-inner"
                    >
                      <BookOpen className="h-4 w-4 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 bg-zinc-950/95 backdrop-blur-2xl border-white/10 rounded-2xl p-2 z-[110]"
                  >
                    <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60 italic">Engineering Hub</div>
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10">
                      <Link to="/insights" className="flex items-center gap-3 w-full p-2 no-underline text-foreground">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider italic">Dev Journal</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10">
                      <Link to="/technical-architecture" className="flex items-center gap-3 w-full p-2 no-underline text-foreground">
                        <Terminal className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider italic">Architecture</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10">
                      <Link to="/about" className="flex items-center gap-3 w-full p-2 no-underline text-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider italic">The Mission</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10">
                      <Link to="/contact" className="flex items-center gap-3 w-full p-2 no-underline text-foreground">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider italic">Contact Support</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link
                to="/"
                className="group flex items-center justify-start gap-2 cursor-pointer select-none no-underline outline-none shrink-0"
              >
                <div
                  className="h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center text-white shadow-2xl transition-theme group-hover:scale-105 shrink-0 overflow-hidden"
                  style={{ backgroundColor: `hsl(${activeTheme?.hsl || 'var(--primary)'})` }}
                >
                  <svg viewBox="0 0 512 512" fill="currentColor" className="w-[70%] h-[70%] pointer-events-none drop-shadow-lg">
                    <path d="M256,32 C172.96,62.33 93.36,65.88 48,64 C48,229.41 81.33,338.99 256,480 C430.67,338.99 464,229.41 464,64 C418.64,65.88 339.04,62.33 256,32 Z" />
                    <g stroke="white" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" fill="none">
                      <polyline points="170,186 90,256 170,326" />
                      <polyline points="342,186 422,256 342,326" />
                      <line x1="286" y1="160" x2="226" y2="352" />
                    </g>
                  </svg>
                </div>
                <div className="flex h-9 md:h-10 items-center gap-2">
                  <span className="text-[14px] md:text-[22px] font-black tracking-tighter text-foreground font-display uppercase italic transition-theme flex items-center leading-none">
                    Private<span className="not-italic logo-text-transition" style={{ color: `hsl(${activeTheme?.hsl || 'var(--primary)'})` }}>Utils</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Search Overlay (Fluid 1200px Expansion) */}
            <div className="hidden lg:flex flex-1 items-center justify-center max-w-[1200px] px-4">
              <div ref={searchRef} className="relative group w-full">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="text"
                  id="navbar-search"
                  name="navbar-search"
                  aria-label="Search tools"
                  placeholder="Search for artifacts..."
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
                  className="h-11 w-full pl-11 pr-10 text-sm font-semibold bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-white/5 text-muted-foreground placeholder:text-muted-foreground/40 rounded-xl focus-visible:ring-primary/20 transition-theme shadow-sm"
                />
                <AnimatePresence>
                  {showSearchOverlay && filteredSearchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-12 left-0 right-0 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[110]"
                    >
                      <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {filteredSearchResults.map(tool => (
                          <Link
                            key={tool.to}
                            to={tool.to}
                            onClick={() => setShowSearchOverlay(false)}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-theme text-left group/result border border-transparent hover:border-white/5 no-underline"
                          >
                            <div
                              className={`h-9 w-9 rounded-xl flex items-center justify-center group-hover/result:scale-110 transition-transform shadow-lg shadow-black/10 flex-shrink-0 bg-gradient-to-br ${categoryConfig[tool.category]?.gradient || "from-primary to-accent"}`}
                            >
                              <div className="h-5 w-5 flex items-center justify-center text-white">
                                {tool.icon}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground tracking-tight">{tool.title}</p>
                              <p className="text-xs text-muted-foreground truncate font-medium italic">{tool.description}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/result:text-foreground transition-theme" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Actions (Standard Technical Sizing) */}
            <div className="flex items-center gap-2 lg:gap-3 justify-end shrink-0">
              <a
                href="https://ko-fi.com/privateutils"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 lg:px-4 h-9 lg:h-10 rounded-xl bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-[0.15em] shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all outline-none"
                title="Support the Project"
              >
                <Coffee className="h-4 w-4 lg:animate-pulse" />
                <span className="hidden sm:inline">Support</span>
              </a>

              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleDark}
                aria-label="Toggle dark mode"
                className="rounded-xl hover:bg-primary/10 transition-theme h-9 w-9 lg:h-10 lg:w-10 border border-white/5 bg-primary/5 shadow-inner"
              >
                {darkMode ? <Sun className="h-4.5 w-4.5 lg:h-5 lg:w-5 text-primary shadow-glow" /> : <Moon className="h-4.5 w-4.5 lg:h-5 lg:w-5" />}
              </Button>
            </div>
          </div>

          {/* Tier 2: Utility Row (Category Visibility for Tool Pages) */}
          <div className="flex flex-col gap-2 pb-1.5 transition-all overflow-visible">
            {/* Mobile-Only Search Bar */}
            <div className="lg:hidden relative group w-full max-w-sm mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="text"
                id="mobile-navbar-search"
                name="mobile-navbar-search"
                aria-label="Search tools"
                placeholder="Search tools..."
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
                className="h-9 w-full pl-10 pr-10 text-xs font-semibold bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-white/5 transition-theme rounded-xl"
              />
            </div>

            {/* Category Central Hub (Optimized for Mobile Visibility) */}
            <div className="relative w-full flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-1 lg:gap-1.5 px-2 py-1 transition-all max-w-[95vw]">
                {Object.keys(categoryConfig).filter(k => k !== "All").map((category) => {
                  const theme = categoryConfig[category];
                  const Icon = theme.icon;
                  const isActive = (isHomePage && selectedCategory === category) || (!isHomePage && currentCategory === category);
                  const categoryTools = tools.filter(t => t.category === category);

                  return (
                    <DropdownMenu key={category} modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          style={{
                            "--glow-color": `hsl(${theme.hsl} / 0.4)`,
                            "--border-glow": `hsl(${theme.hsl} / 0.2)`,
                            backgroundColor: isActive ? `hsl(${theme.hsl})` : undefined
                          } as React.CSSProperties}
                          className={`px-2 lg:px-3 py-1 rounded-lg font-black text-[8px] lg:text-[10px] uppercase tracking-tighter transition-all flex items-center gap-1 border whitespace-nowrap transition-theme h-6.5 lg:h-8 ${isActive
                            ? "text-white shadow-md scale-105 border-white/20"
                            : "text-muted-foreground hover:text-foreground bg-zinc-100 dark:bg-white/5 border-white/5 hover:border-[var(--border-glow)] hover:shadow-[0_0_15px_var(--glow-color)] shadow-sm"
                            }`}
                          onClick={() => {
                            if (isHomePage && setSelectedCategory) {
                              setSelectedCategory(category);
                            }
                          }}
                        >
                          <Icon className="h-[clamp(9px,1.5vw,14px)] w-[clamp(9px,1.5vw,14px)]" style={{ color: isActive ? 'white' : `hsl(${theme.hsl})` }} />
                          <span className="leading-none">{category}</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-[320px] bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl p-2 z-[110]">
                        <div className="px-3 py-2 flex items-center gap-3">
                          <theme.icon className="h-4 w-4" style={{ color: `hsl(${theme.hsl})` }} />
                          <span className="text-base font-bold font-display tracking-tight" style={{ color: `hsl(${theme.hsl})` }}>{category}</span>
                        </div>
                        <DropdownMenuSeparator className="bg-white/5" />
                        {categoryTools.map(tool => (
                          <DropdownMenuItem key={tool.to} asChild className="rounded-xl cursor-pointer p-2 focus:bg-muted/50 focus:text-foreground group/item">
                            <Link to={tool.to} className="flex items-center gap-3 w-full no-underline">
                              <div className="h-8 w-8 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-theme shadow-sm" style={{ backgroundColor: `hsl(${theme.hsl} / 0.1)`, color: `hsl(${theme.hsl})` }}>
                                <div className="h-4 w-4 flex items-center justify-center">{tool.icon}</div>
                              </div>
                              <span className="text-[13px] font-bold uppercase italic text-foreground truncate pr-2">{tool.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

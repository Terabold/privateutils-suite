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
import { overlayMotion } from "@/lib/motion";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


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
    <>
    <header className="global-navbar sticky top-0 z-[100] w-full lg:w-[280px] lg:h-screen lg:flex-shrink-0 transition-theme shadow-lg shadow-black/10 lg:shadow-none border-b lg:border-b-0 lg:border-r border-border/50 bg-background/[0.82] lg:bg-background/95 backdrop-blur-xl flex flex-col overflow-visible">
      {/* Sidebar Branding - Top Section */}
      <div className="p-4 lg:p-5 flex items-center lg:items-start justify-between gap-4">
        <Link
          to="/"
          className="group flex items-center justify-start gap-3 cursor-pointer select-none no-underline outline-none shrink-0"
        >
          <div
            className="h-9 w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center text-white shadow-2xl transition-theme group-hover:scale-105 shrink-0 overflow-hidden"
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
          <div className="flex flex-col">
            <span className="text-[18px] lg:text-[22px] font-black tracking-tighter text-foreground font-display uppercase italic transition-theme flex items-center leading-none">
              Private<span className="not-italic logo-text-transition" style={{ color: `hsl(${activeTheme?.hsl || 'var(--primary)'})` }}>Utils</span>
            </span>
            <span className="hidden lg:block text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">Browser-Native Forge</span>
          </div>
        </Link>
        
        {/* Mobile Actions - Dark Mode & Article Links Dropdown */}
        <div className="flex lg:hidden items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDark}
            className="rounded-xl h-9 w-9 border border-border/50 bg-primary/5 hover:bg-primary/10 transition-all shadow-sm"
          >
            {darkMode ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border/50 bg-muted/30 hover:bg-primary/10">
                <BookOpen className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-950/95 backdrop-blur-2xl border-white/10 rounded-2xl p-2 z-[110]">
              <div className="px-2 py-1 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">Navigation Hub</span>
              </div>
              <DropdownMenuItem asChild className="rounded-xl"><Link to="/about" className="flex items-center p-2 no-underline text-foreground"><span className="text-[11px] font-bold uppercase">About</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl"><Link to="/technical-architecture" className="flex items-center p-2 no-underline text-foreground"><span className="text-[11px] font-bold uppercase">Architecture</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl"><Link to="/security-architecture" className="flex items-center p-2 no-underline text-foreground"><span className="text-[11px] font-bold uppercase">Security</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl"><Link to="/faq" className="flex items-center p-2 no-underline text-foreground"><span className="text-[11px] font-bold uppercase">FAQ</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl"><Link to="/insights" className="flex items-center p-2 no-underline text-foreground"><span className="text-[11px] font-bold uppercase">Insights</span></Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl"><Link to="/contact" className="flex items-center p-2 no-underline text-foreground"><span className="text-[11px] font-bold uppercase">Contact</span></Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Sidebar Content - Dynamic flex scaling on desktop, scrolls if screen is very short */}
      <div className="flex-grow flex flex-col gap-4 lg:gap-3 px-3 lg:px-5 overflow-y-auto custom-scrollbar pb-0 lg:pb-4">
        
        {/* Search Section */}
        <div ref={searchRef} className="relative group w-full shrink-0">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            type="text"
            id="sidebar-search"
            name="sidebar-search"
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
            className="premium-control h-11 lg:h-11 w-full pl-11 pr-4 text-sm font-semibold text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
          />
          <AnimatePresence>
            {showSearchOverlay && filteredSearchResults.length > 0 && (
              <motion.div 
                variants={overlayMotion}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-[calc(100%+8px)] left-0 right-0 premium-surface bg-card/95 rounded-2xl overflow-hidden z-[110] shadow-2xl border border-white/5"
              >
                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {filteredSearchResults.map(tool => (
                    <Link
                      key={tool.to}
                      to={tool.to}
                      onClick={() => setShowSearchOverlay(false)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-theme text-left group/result no-underline focus-premium"
                    >
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center group-hover/result:scale-105 transition-theme bg-gradient-to-br ${categoryConfig[tool.category]?.gradient || "from-primary to-accent"}`}
                      >
                        <div className="h-4 w-4 flex items-center justify-center text-white">
                          {tool.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-foreground tracking-tight truncate">{tool.title}</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories Section - Flex-1 to fill space, but min-h ensures it doesn't squish into oblivion on tiny screens */}
        <div className="flex flex-col gap-2 lg:gap-2 flex-1 min-h-0 lg:min-h-[340px]">
          <div className="hidden lg:flex items-center gap-2 px-2 mb-0 shrink-0">
            <div className="h-1 w-4 bg-primary rounded-full opacity-50" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Categories</span>
          </div>
          <div className="flex flex-row lg:flex-col flex-wrap lg:flex-nowrap justify-center lg:justify-start flex-1 gap-1.5 lg:gap-1 pb-2 lg:pb-0 px-1">
            {Object.keys(categoryConfig).filter(k => k !== "All").map((category) => {
              const theme = categoryConfig[category];
              const Icon = theme.icon;
              const isActive = (isHomePage && selectedCategory === category) || (!isHomePage && currentCategory === category);
              const categoryTools = tools.filter(t => t.category === category);

              const handleCategoryClick = (e: React.MouseEvent) => {
                if (location.pathname === "/") {
                  e.preventDefault();
                  const targetId = category.replace(/\s+/g, '-').toLowerCase();
                  const scrollContainer = document.getElementById("app-main-scroll");
                  const targetElement = document.getElementById(targetId);
                  if (scrollContainer && targetElement) {
                    const containerRect = scrollContainer.getBoundingClientRect();
                    const targetRect = targetElement.getBoundingClientRect();
                    // Offset 40px for some breathing room at the top
                    const targetPosition = targetRect.top + scrollContainer.scrollTop - containerRect.top - 40;
                    scrollContainer.scrollTo({ top: targetPosition, behavior: "smooth" });
                  }
                  // Do not filter the grid, only scroll
                }
              };

              const ButtonContent = (
                <button
                  onClick={handleCategoryClick}
                  style={{
                    "--glow-color": `hsl(${theme.hsl} / 0.2)`,
                    "--border-glow": `hsl(${theme.hsl} / 0.1)`,
                    backgroundColor: isActive ? `hsl(${theme.hsl} / 0.1)` : undefined,
                    borderColor: isActive ? `hsl(${theme.hsl} / 0.3)` : undefined,
                    color: isActive ? `hsl(${theme.hsl})` : undefined
                  } as React.CSSProperties}
                  className={`group/nav-btn w-auto lg:w-full px-4 py-2.5 lg:px-5 lg:py-2.5 rounded-xl text-[11px] lg:text-[13px] font-black uppercase tracking-tight flex items-center justify-between border border-transparent transition-all hover:bg-zinc-100 dark:hover:bg-white/5 active:scale-[0.98] shrink-0 whitespace-nowrap lg:whitespace-normal ${
                    isActive ? "shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 lg:gap-3">
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 transition-transform group-hover/nav-btn:scale-110" style={{ color: `hsl(${theme.hsl})` }} />
                    <span className="leading-none">{category}</span>
                  </div>
                  <ChevronRight className={`hidden lg:block h-4 w-4 opacity-40 transition-transform ${isActive ? "rotate-90" : ""}`} />
                </button>
              );

              if (location.pathname === "/") {
                return <div key={category} className="w-auto lg:w-full">{ButtonContent}</div>;
              }

              return (
                <DropdownMenu key={category} modal={false}>
                  <DropdownMenuTrigger asChild>
                    {ButtonContent}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side={isMobile ? "bottom" : "right"} align={isMobile ? "center" : "start"} className="w-[280px] bg-card/98 backdrop-blur-2xl border-white/10 rounded-2xl p-2 z-[110] lg:ml-2">
                    <div className="px-3 py-2 flex items-center gap-3">
                      <theme.icon className="h-4 w-4" style={{ color: `hsl(${theme.hsl})` }} />
                      <span className="text-base font-bold font-display tracking-tight" style={{ color: `hsl(${theme.hsl})` }}>{category}</span>
                    </div>
                    <DropdownMenuSeparator className="bg-white/5" />
                    {categoryTools.map(tool => (
                      <DropdownMenuItem key={tool.to} asChild className="rounded-xl cursor-pointer p-2 focus:bg-muted/50 group/item">
                        <Link to={tool.to} className="flex items-center gap-3 w-full no-underline">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-theme" style={{ backgroundColor: `hsl(${theme.hsl} / 0.1)`, color: `hsl(${theme.hsl})` }}>
                            <div className="h-4 w-4 flex items-center justify-center">{tool.icon}</div>
                          </div>
                          <span className="text-[13px] font-bold uppercase italic text-foreground truncate">{tool.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>
        </div>

        {/* Resources & Links - Sidebar Desktop Integrated */}
        <div className="hidden lg:flex pt-4 border-t border-border/50 flex-col gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onToggleDark}
            className="w-full h-11 lg:h-10 rounded-xl border border-border/50 bg-muted/30 hover:bg-primary/10 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {darkMode ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4" />}
            <span className="text-xs font-black uppercase tracking-widest">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>

          <div className="grid grid-cols-2 gap-1.5 text-left">
            <Link to="/about" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors no-underline px-2 py-1.5 lg:py-1 bg-transparent rounded-lg hover:bg-muted/30">About</Link>
            <Link to="/technical-architecture" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors no-underline px-2 py-1.5 lg:py-1 bg-transparent rounded-lg hover:bg-muted/30">Architecture</Link>
            <Link to="/security-architecture" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors no-underline px-2 py-1.5 lg:py-1 bg-transparent rounded-lg hover:bg-muted/30">Security</Link>
            <Link to="/faq" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors no-underline px-2 py-1.5 lg:py-1 bg-transparent rounded-lg hover:bg-muted/30">FAQ</Link>
            <Link to="/insights" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors no-underline px-2 py-1.5 lg:py-1 bg-transparent rounded-lg hover:bg-muted/30">Insights</Link>
            <Link to="/contact" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors no-underline px-2 py-1.5 lg:py-1 bg-transparent rounded-lg hover:bg-muted/30">Contact</Link>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;

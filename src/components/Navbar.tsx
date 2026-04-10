import { useState, useEffect, useMemo, useRef } from "react";
import { Moon, Sun, Search, X, Video, ImageIcon, Music, ShieldCheck, Wrench, Sparkles, Command, ChevronRight, Terminal, Type, Zap } from "lucide-react";
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

  // Dynamic Browser Tab Title and Metadata Management
  useEffect(() => {
    let title = "Client-Sided Coding & Media Tools — 100% Private, In-Browser Utility Suite (Zero Uploads)";
    let description = "A professional collection of client-side developer and media tools. Process video, images, and sensitive data entirely in your browser. No server uploads, no tracking, 100% private.";
    let ogImage = "/og-image.png";

    if (isHomePage) {
      if (selectedCategory) {
        title = `${selectedCategory} | PrivateUtils`;
      } else if (searchQuery) {
        title = `Search: ${searchQuery} | PrivateUtils`;
      }
    } else {
      // @ts-ignore - Indexing tools via current path
      const tool = tools.find(t => t.to === location.pathname);
      if (tool) {
        // @ts-ignore
        title = tool.seoTitle || `${tool.title} | PrivateUtils`;
        // @ts-ignore
        description = tool.seoDescription || tool.description;
      }
    }

    // Apply Title
    document.title = title;

    // Update Canonical URL
    const canonicalUrl = `https://privateutils.com${location.pathname === '/' ? '' : location.pathname}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonicalUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("href", canonicalUrl);
      document.head.appendChild(canonicalLink);
    }

    // Update Meta Tags (Standard)
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", description);

    // Update OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    // Update OpenGraph Image
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute("content", ogImage);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    // Update Twitter Tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", title);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", description);

    const twImg = document.querySelector('meta[name="twitter:image"]');
    if (twImg) twImg.setAttribute("content", ogImage);

  }, [location.pathname, isHomePage, selectedCategory, searchQuery]);

  return (
    <header className="sticky top-0 z-[100] border-b border-white/5 bg-background/80 backdrop-blur-xl py-1 w-full transition-theme shadow-lg shadow-black/20 overflow-visible">
      <div className="container mx-auto px-[clamp(8px,3vw,16px)] lg:px-8 flex flex-wrap lg:flex-nowrap h-auto lg:h-[90px] items-center justify-between gap-y-3 lg:gap-x-8 max-w-[1500px] w-full transition-theme lg:py-0">

        {/* 1. Logo Row - Persistent Logic */}
        <div className="flex w-full lg:w-auto items-center justify-between gap-[clamp(4px,2vw,16px)] shrink-0">
          <Link
            to="/"
            className="group flex items-center justify-start gap-3 cursor-pointer select-none no-underline outline-none"
          >
          <div
            className="h-[clamp(30px,8vw,36px)] w-[clamp(30px,8vw,36px)] md:h-10 md:w-10 rounded-lg flex items-center justify-center text-white shadow-2xl transition-theme group-hover:scale-105 shrink-0 overflow-hidden"
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
            <div className="flex h-9 md:h-10 items-center gap-[clamp(4px,1vw,8px)]">
              <span className="text-[clamp(14px,5vw,22px)] md:text-[24px] font-black tracking-tighter text-foreground font-display uppercase italic transition-theme group-hover:text-shadow-glow flex items-center leading-none">
                Private<span className="not-italic logo-text-transition" style={{ color: `hsl(${activeTheme?.hsl || 'var(--primary)'})` }}>Utils</span>
              </span>
              <div className="hidden min-[380px]:flex px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 group/wip relative">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">WIP</span>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 px-3 py-2 bg-popover text-popover-foreground text-[10px] font-black rounded-lg opacity-0 group-hover/wip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-white/10 z-[120] uppercase tracking-wider italic">
                  Work In Progress • Deployment in progress
                </div>
              </div>
            </div>
          </Link>

          {/* Persistent Theme Toggle (Locked next to logo on mobile/tablet, shifted on desktop manually via flex) */}
          <div className="lg:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              aria-label="Toggle dark mode"
              className="rounded-2xl hover:bg-primary/10 transition-all h-[clamp(36px,10vw,44px)] w-[clamp(36px,10vw,44px)] border border-transparent bg-primary/5 shadow-inner"
            >
              {darkMode ? <Sun className="h-[clamp(18px,5vw,24px)] w-[clamp(18px,5vw,24px)] text-primary shadow-glow" /> : <Moon className="h-[clamp(18px,5vw,24px)] w-[clamp(18px,5vw,24px)]" />}
            </Button>
          </div>
        </div>

        {/* 2. Unified Search + Categories Column (Fluid and Centered) */}
        <div className="flex flex-col flex-1 w-full lg:max-w-4xl mx-auto gap-1.5 relative transition-theme items-center lg:items-center h-full justify-center">
          <div ref={searchRef} className="relative group mx-auto w-full max-w-lg lg:max-w-xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              id="navbar-search"
              name="navbar-search"
              aria-label="Search tools"
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
              className="h-9 md:h-10 pl-11 pr-10 text-sm font-semibold bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-transparent text-muted-foreground placeholder:text-muted-foreground/40 rounded-xl focus-visible:ring-primary/20 transition-theme shadow-sm"
            />
            {showSearchOverlay && filteredSearchResults.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-[110]">
                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {filteredSearchResults.map(tool => (
                    <Link
                      key={tool.to}
                      to={tool.to}
                      onClick={() => setShowSearchOverlay(false)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-theme text-left group/result border border-transparent hover:border-white/5 no-underline"
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
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/result:text-foreground transition-theme" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Category pills - DYNAMIC Scaling (Paddings and Font size shrink with viewport) */}
          <div className="w-full overflow-x-auto no-scrollbar scroll-smooth mask-fade-right">
            <div className="flex flex-nowrap items-center gap-[clamp(2px,0.8vw,8px)] mx-auto w-max px-[clamp(2px,2vw,32px)] py-1.5">
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
                        className={`px-[clamp(6px,1.2vw,20px)] py-1 md:py-1.5 rounded-xl font-bold md:font-semibold text-[clamp(8px,0.9vw,13px)] transition-all flex items-center gap-[clamp(2px,0.8vw,8px)] border whitespace-nowrap shrink transition-theme ${isActive
                          ? "text-white shadow-lg scale-105 border-white/20"
                          : "text-muted-foreground hover:text-foreground bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-transparent hover:border-[var(--border-glow)] hover:shadow-[0_0_20px_var(--glow-color)] shadow-sm"
                          }`}
                      >
                        <Icon className="h-[clamp(12px,1.2vw,14px)] w-[clamp(12px,1.2vw,14px)] transition-colors" style={{ color: isActive ? 'white' : `hsl(${theme.hsl})` }} />
                        {category.split(' ')[0]}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="w-[280px] md:w-[320px] bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl p-2 z-[110]"
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
                              className="h-8 w-8 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-theme shadow-sm"
                              style={{ backgroundColor: `hsl(${theme.hsl} / 0.1)`, color: `hsl(${theme.hsl})` }}
                            >
                              <div className="h-4.5 w-4.5 flex items-center justify-center">
                                {tool.icon}
                              </div>
                            </div>
                            <span
                              className="text-sm font-bold transition-colors text-foreground group-hover/item:text-[var(--hover-text)] truncate whitespace-nowrap"
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
        </div>

        {/* 4. Actions (Desktop only Row 1 Right) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="rounded-2xl hover:bg-primary/10 transition-theme h-14 w-14 border border-transparent hover:border-primary/20 bg-primary/5 shadow-inner"
          >
            {darkMode ? <Sun className="h-7 w-7 text-primary shadow-glow" /> : <Moon className="h-7 w-7" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

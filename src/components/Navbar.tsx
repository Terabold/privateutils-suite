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
    <header className="sticky top-0 z-[100] border-b border-white/5 bg-background/80 backdrop-blur-xl py-4 w-full transition-theme shadow-lg shadow-black/20 overflow-visible">
      <div className="container mx-auto px-4 lg:px-8 flex flex-wrap lg:flex-nowrap h-auto lg:h-[115px] items-center justify-between lg:justify-start gap-y-4 lg:gap-x-12 max-w-[1500px] w-full transition-theme py-2 lg:py-0">

        {/* 1. Logo Row - Persistent Logic */}
        <div className="flex w-full lg:w-auto items-center justify-between lg:justify-start gap-6 lg:shrink-0 lg:min-w-[240px]">
          <Link
            to="/"
            className="group flex items-center justify-start gap-3 cursor-pointer select-none no-underline outline-none"
          >
            <div
              className="h-10 w-10 md:h-11 md:w-11 rounded-lg flex items-center justify-center text-white shadow-2xl transition-theme group-hover:scale-105 shrink-0 overflow-hidden"
              style={{ backgroundColor: `hsl(${activeTheme?.hsl || 'var(--primary)'})` }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[55%] h-[55%] pointer-events-none">
                <path d="M5 4h9a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-4v6H5V4zm5 7h4a2 2 0 0 0 0-4h-4v4z" />
              </svg>
            </div>
            <div className="flex h-10 md:h-11 items-center gap-2">
              <span className="text-[24px] md:text-[28px] font-black tracking-tighter text-foreground font-display uppercase italic transition-theme group-hover:text-shadow-glow flex items-center leading-none">
                Private<span className="not-italic logo-text-transition" style={{ color: `hsl(${activeTheme?.hsl || 'var(--primary)'})` }}>Utils</span>
              </span>
              <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group/wip relative">
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
              className="rounded-2xl hover:bg-primary/10 transition-all h-11 w-11 border border-transparent bg-primary/5 shadow-inner"
            >
              {darkMode ? <Sun className="h-6 w-6 text-primary shadow-glow" /> : <Moon className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* 2. Unified Search + Categories Column (Fluid and Centered) */}
        <div className="flex flex-col flex-1 w-full lg:max-w-2xl mx-auto gap-3 relative transition-theme items-center lg:items-stretch">
          <div ref={searchRef} className="relative group mx-auto lg:mx-0 w-full max-w-lg lg:max-w-none">
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
              className="h-10 md:h-11 pl-11 pr-10 text-sm font-semibold bg-zinc-100 dark:bg-white/5 border-zinc-200/50 dark:border-transparent text-muted-foreground placeholder:text-muted-foreground/40 rounded-2xl focus-visible:ring-primary/20 transition-theme shadow-sm"
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
          <div className="w-full overflow-x-auto no-scrollbar py-4 -my-4">
            <div className="flex flex-nowrap items-center gap-[clamp(4px,1vw,8px)] justify-center w-max min-w-full px-2 md:px-4 py-2">
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
                        className={`px-[clamp(6px,1.2vw,24px)] py-1.5 md:py-2.5 rounded-2xl font-bold md:font-semibold text-[clamp(8px,1vw,14px)] transition-all flex items-center gap-[clamp(2px,0.8vw,10px)] border whitespace-nowrap shrink transition-theme ${isActive
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
                              className="h-8 w-8 rounded-full flex items-center justify-center group-hover/item:scale-110 transition-theme shadow-sm"
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
        </div>

        {/* 4. Actions (Desktop only Row 1 Right) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 lg:min-w-[140px] justify-end">
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

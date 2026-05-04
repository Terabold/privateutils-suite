import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDarkMode } from "@/hooks/useDarkMode";
import { categoryConfig } from "@/config/categories";
import { useRecentTools } from "@/hooks/useRecentTools";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, History, Star, Zap, Lock, Play, Pause, HelpCircle, Coffee, ShieldAlert, Scale, ArrowRight, MessageSquare, BookOpen, Video, Music, ImageIcon, Shield, Code, Type, LayoutGrid, Layout } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import ToolsGrid, { tools } from "@/components/ToolsGrid";
import Footer from "@/components/Footer";
import StickyAnchorAd from "@/components/StickyAnchorAd";
// import TableOfContents from "../components/TableOfContents";
import { motion } from "framer-motion";
import { revealContainer, revealItem } from "@/lib/motion";

interface IndexProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

import { toast } from "sonner";

const Index = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}: IndexProps) => {
  const { recentTools, favoriteTools } = useRecentTools();
  const recentToolsData = useMemo(() => recentTools.map(r => tools.find(t => t.to === r)).filter(Boolean), [recentTools]);
  const favoriteToolsData = useMemo(() => favoriteTools.map(r => tools.find(t => t.to === r)).filter(Boolean), [favoriteTools]);
  const { darkMode, toggleDark } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const scrollContainer = document.getElementById("app-main-scroll");
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        root: scrollContainer,
        threshold: 0, 
        rootMargin: "-40% 0px -55% 0px" // Narrow detection band in the upper-middle
      }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const handleNavClick = (id: string) => {
    const scrollContainer = document.getElementById("app-main-scroll");
    if (!scrollContainer) return;

    let targetElement: HTMLElement | null = null;

    if (id === "History") {
      if (recentToolsData.length === 0) {
        toast.info("You haven't used any tools yet.", {
          description: "Come back here after you use a tool.",
          position: "bottom-right",
          duration: 3000
        });
        return;
      }
      targetElement = document.getElementById("recently-used");
    } else if (id === "Favorites") {
      if (favoriteToolsData.length === 0) {
        toast.info("No favorites saved yet.", {
          description: "Star a tool to save it here.",
          position: "bottom-right",
          duration: 3000
        });
        return;
      }
      targetElement = document.getElementById("favorites-section");
    } else {
      const targetId = id.replace(/\s+/g, '-').toLowerCase();
      targetElement = document.getElementById(targetId);
    }

    if (targetElement) {
      const offset = 100; // Fixed offset to leave room below navbar
      
      // Calculate position relative to the scroll container
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const targetPosition = targetRect.top + scrollContainer.scrollTop - containerRect.top - offset;
      
      scrollContainer.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  };

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    navigate("/", { replace: true });
  }, [navigate, setSearchQuery, setSelectedCategory]);

  const activeNavId = useMemo(() => {
    if (activeSection === "recently-used") return "History";
    if (activeSection === "favorites-section") return "Favorites";
    // Map back from kebab-case id to category title
    return Object.keys(categoryConfig).find(
      cat => cat.replace(/\s+/g, '-').toLowerCase() === activeSection
    ) || null;
  }, [activeSection]);

  return (
    <div className="w-full font-sans selection:bg-primary/20 relative">
      <div className="w-full relative">
        <main className="flex-grow grow min-w-0 transition-all duration-300">
          <div className="container mx-auto max-w-[1240px] px-6 pt-2 pb-6 lg:pt-4 lg:pb-10 overflow-visible">

          <motion.section
            id="hero"
            variants={revealContainer}
            initial="hidden"
            animate="visible"
            className="mb-8 mt-8 md:mb-14 md:mt-14 relative flex flex-col items-center text-center group/hero"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10 group-hover/hero:bg-primary/20 transition-all duration-1000" />

            <motion.h1
              variants={revealItem}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tighter text-foreground font-display mb-4 md:mb-6 leading-[0.85] uppercase italic drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] group-hover/hero:drop-shadow-[0_0_60px_rgba(var(--primary-rgb),0.4)] transition-all duration-700 cursor-default"
            >
              Free tools that <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">never see your files.</span>
            </motion.h1>

            <motion.p
              variants={revealItem}
              className="mx-auto max-w-2xl text-sm md:text-base lg:text-xl text-muted-foreground leading-relaxed font-medium opacity-60 group-hover/hero:opacity-100 group-hover/hero:text-foreground transition-all duration-500 drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]"
            >
              Everything runs in your browser.
              <span className="block mt-1">No uploads. No accounts. No tracking.</span>
            </motion.p>
          </motion.section>

          <div className="grow min-w-0 w-full">

            <div className="mb-20">
            </div>

            {recentToolsData.length > 0 && !searchQuery && !selectedCategory && (
              <section id="recently-used" className="mb-24">
                <div className="flex items-center gap-4 mb-10 px-2 group/section">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/20 group-hover/section:scale-110 transition-transform duration-500">
                    <History className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-8 bg-primary rounded-full opacity-50" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Recent</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent pr-4 leading-tight">
                      Recently <span className="opacity-80 font-display">Used</span>
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {recentToolsData.slice(0, 3).map((tool: any, idx) => (
                    <motion.div
                      key={tool.to}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                    >
                      <ToolCard {...tool} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {favoriteToolsData.length > 0 && !searchQuery && !selectedCategory && (
              <section id="favorites-section" className="mb-24">
                <div className="flex items-center gap-4 mb-10 px-2 group/section">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/20 group-hover/section:scale-110 transition-transform duration-500">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-8 bg-amber-500 rounded-full opacity-50" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/60">Saved</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent pr-4 leading-tight">
                      Your <span className="opacity-80 font-display">Favorites</span>
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {favoriteToolsData.map((tool: any, idx) => (
                    <motion.div
                      key={tool.to}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                    >
                      <ToolCard {...tool} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <div id="tools-grid-anchor">
              <ToolsGrid 
                searchQuery={searchQuery} 
                selectedCategory={selectedCategory}
                onClearFilters={clearFilters}
              />
            </div>

            <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
              <div className="flex flex-col items-center text-center p-8 studio-gradient rounded-3xl border border-primary/10 shadow-lg">
                <ShieldCheck className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-xl font-black mb-3 tracking-tight">Your data never leaves your computer.</h3>
                <p className="text-muted-foreground text-sm font-medium">Processing happens entirely in your browser's RAM.</p>
              </div>
              <div className="flex flex-col items-center text-center p-8 studio-gradient rounded-3xl border border-primary/10 shadow-lg">
                <Lock className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-xl font-black mb-3 tracking-tight">No account or signup required.</h3>
                <p className="text-muted-foreground text-sm font-medium">We don't collect emails or personal data.</p>
              </div>
              <div className="flex flex-col items-center text-center p-8 studio-gradient rounded-3xl border border-primary/10 shadow-lg">
                <Zap className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-xl font-black mb-3 tracking-tight">Works offline once the page loads.</h3>
                <p className="text-muted-foreground text-sm font-medium">Great for sensitive files you'd rather not put online.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      </div>
      <Footer />
      <div className="my-8">
        <StickyAnchorAd />
      </div>
    </div>
  );
};

export default Index;

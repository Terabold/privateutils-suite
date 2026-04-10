import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ToolsGrid, { tools } from "@/components/ToolsGrid";
import Footer from "@/components/Footer";
import { ShieldCheck, Zap, Lock, Play, Pause } from "lucide-react";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";


const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Read query params from URL (set by Navbar when navigating from a tool page)
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [searchQuery, setSearchQuery] = useState(() => params.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => params.get("category") ?? null);

  // Sync state when URL params change (e.g. browser back/forward)
  useEffect(() => {
    setSearchQuery(params.get("search") ?? "");
    setSelectedCategory(params.get("category") ?? null);
  }, [params]);

  const categories = useMemo(() => {
    return Array.from(new Set(tools.map(t => t.category)));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-20% 0px -40% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    navigate("/", { replace: true });
  }, [navigate]);

  // Keep URL in sync when user interacts with filters on the homepage
  const handleSetSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    const p = new URLSearchParams(location.search);
    if (q) p.set("search", q); else p.delete("search");
    navigate(`/?${p.toString()}`, { replace: true });
  }, [navigate, location.search]);

  const handleSetCategory = useCallback((cat: string | null) => {
    setSelectedCategory(cat);
    const p = new URLSearchParams(location.search);
    if (cat) p.set("category", cat); else p.delete("category");
    navigate(`/?${p.toString()}`, { replace: true });
  }, [navigate, location.search]);

  const isFiltering = searchQuery.length > 0 || selectedCategory !== null;

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 relative ">
      <Navbar 
        darkMode={darkMode} 
        onToggleDark={toggleDark}
        searchQuery={searchQuery}
        setSearchQuery={handleSetSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleSetCategory}
        categories={categories}
        activeSection={activeSection}
      />
      
      {/* Sidebar Layout Wrapper */}
      <div className="flex justify-center items-start w-full relative">
        
        {/* Left Sponsor Sidebar */}
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-10 lg:py-16 grow overflow-visible">
          {/* Static Branding Section (Improved Vertical Density) */}
          <section id="hero" className="text-center mb-10 relative animate-in fade-in duration-1000">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground font-display mb-6 leading-[0.9]">
              Private<span className="text-primary italic">Utils</span> <br className="hidden sm:block" /> <span className="text-2xl md:text-4xl opacity-40 uppercase tracking-widest font-sans not-italic">Coding & Media Tools</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
              Experience the <span className="font-bold text-foreground">PrivateUtils Engine</span>: {tools.length} Desktop-grade utility tools running 100% in your browser. 
              No accounts, no tracking, and zero data leakage—your data never reaches a server.
            </p>
          </section>

          {/* Mobile Inline Ad */}
          <ToolAdBanner />

          {/* Tools Section */}
          <div className="mb-32">
            <ToolsGrid 
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Integrated Ad Break */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-32 opacity-60 min-h-[250px]">
             <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
             <div className="hidden md:block h-12 w-[1px] bg-border" />
             <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
          </div>

          {/* Privacy Manifesto Section (Universal Focal Point) */}
          <section id="privacy-manifesto" className="py-28 px-12 rounded-[2rem] bg-muted/30 dark:bg-zinc-950 text-foreground border border-primary/20 shadow-[0_0_100px_-20px_rgba(var(--primary),0.15)] relative overflow-hidden group mb-32 hover-glow transition-all duration-700">
             <div className="absolute top-0 right-0 p-12 opacity-[0.07] dark:opacity-[0.08] scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-1000 text-primary pointer-events-none">
                <ShieldCheck className="h-60 w-60" />
              </div>
              
              <div className="relative z-10 max-w-4xl">
                 <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-10">
                    <Lock className="h-4 w-4" /> The PrivateUtils 100% Browser Engine
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 leading-none">
                    Engineered for your <span className="text-primary italic">eyes only.</span>
                 </h2>
                 <p className="text-xl text-muted-foreground font-medium mb-16 leading-relaxed max-w-3xl">
                    Most online tools are secretly data collection engines. We changed the paradigm. 
                    Your binary strictly stays on your hardware, processed by our **Zero-Trust Compute Core**. 
                    <br /><br />
                    Using hardware-accelerated WebAssembly, we process sensitive data at wire-speed with <span className="text-foreground font-bold underline decoration-primary/50 underline-offset-8">Zero Logs. Zero Tracking. Zero Data Leaks.</span>
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                    <div className="space-y-4 border-l-2 border-primary/30 pl-8 transition-colors hover:border-primary">
                       <h3 className="text-base font-black uppercase tracking-widest text-primary">Air-Gapped Processing</h3>
                       <p className="text-sm text-muted-foreground font-medium leading-relaxed">Parallel rendering and complex logic happen entirely in your local RAM sandbox. Our site could be disconnected from the internet and still function.</p>
                    </div>
                    <div className="space-y-4 border-l-2 border-primary/30 pl-8 transition-colors hover:border-primary">
                       <h3 className="text-base font-black uppercase tracking-widest text-primary">Universal Compliance</h3>
                       <p className="text-sm text-muted-foreground font-medium leading-relaxed">Stay compliant with enterprise security standards. Since no data is transmitted, you are inherently protected from standard man-in-the-middle liabilities.</p>
                    </div>
                 </div>
              </div>
           </section>

          {/* Benefits Grid */}
          <section id="benefits" className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 mb-16">
            <div className="flex flex-col items-center text-center p-6 studio-gradient rounded-2xl hover-glow transition-all duration-300">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">Air-Gapped Privacy</h3>
              <p className="text-muted-foreground text-sm leading-relaxed italic font-medium">Files remain in your local workspace</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 studio-gradient rounded-2xl hover-glow transition-all duration-300">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">GPU Accelerated</h3>
              <p className="text-muted-foreground text-sm leading-relaxed italic font-medium">Parallel hardware rendering</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 studio-gradient rounded-2xl hover-glow transition-all duration-300">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">Encrypted Exit</h3>
              <p className="text-muted-foreground text-sm leading-relaxed italic font-medium">Memory is wiped on session end</p>
            </div>
          </section>
        </main>

        {/* Right Sponsor Sidebar */}
        <SponsorSidebars position="right" />

      </div>

      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default Index;


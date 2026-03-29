import { useState, useCallback, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ToolsGrid, { tools } from "@/components/ToolsGrid";
import SearchNavigator from "@/components/SearchNavigator";
import Footer from "@/components/Footer";
import { ShieldCheck, Zap, Lock } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";

const Index = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(tools.map(t => t.category)));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
  }, []);

  const isFiltering = searchQuery.length > 0 || selectedCategory !== null;

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 relative overflow-x-hidden">
      <Navbar 
        darkMode={darkMode} 
        onToggleDark={toggleDark}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />
      
      {/* Sidebar Layout Wrapper */}
      <div className="flex justify-center items-start w-full relative">
        
        {/* Left Sponsor Sidebar */}
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <div className="p-8 rounded-2xl border-2 border-dashed border-primary/5 bg-primary/5 text-center mt-12 studio-gradient">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Creative Studio Partner</p>
           </div>
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-10 lg:py-16 grow overflow-visible">
          {/* Static Branding Section (Improved Vertical Density) */}
          <section className="text-center mb-10 relative animate-in fade-in duration-1000">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground font-display mb-6 leading-[0.9]">
              Local<span className="text-primary italic">Tools</span> <br className="hidden sm:block" /> <span className="text-2xl md:text-4xl opacity-40 uppercase tracking-widest font-sans not-italic">Creative Sandbox</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
              Professional-grade media processing that runs entirely in your browser. 
              No accounts, no uploads, and zero tracking—your data never leaves your device.
            </p>
          </section>

          {/* Tools Section */}
          <div className="mb-32">
            <ToolsGrid 
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Integrated Ad Break */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-32 opacity-60 grayscale hover:grayscale-0 transition-all">
             <AdPlaceholder format="rectangle" />
             <div className="hidden md:block h-12 w-[1px] bg-border" />
             <AdPlaceholder format="rectangle" />
          </div>

          {/* Privacy Manifesto Section */}
          <section className="py-24 px-12 rounded-[2rem] bg-zinc-950 text-white dark:bg-zinc-900 border border-white/5 shadow-2xl relative overflow-hidden group mb-32">
             <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-1000">
                <ShieldCheck className="h-60 w-60" />
             </div>
             
             <div className="relative z-10 max-w-4xl">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-10">
                   <Lock className="h-4 w-4" /> 100% Client-Side Engine
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 leading-none">
                   Your files are <span className="text-primary italic">nobody's business.</span>
                </h2>
                <p className="text-xl text-zinc-400 font-medium mb-16 leading-relaxed max-w-3xl">
                   Unlike other online tools, we never "upload" your content to a server. Our entire engine runs inside your browser using hardware-accelerated WebAssembly. 
                   <br /><br />
                   This means <span className="text-white font-bold underline decoration-primary/50 underline-offset-8">Zero Logs. Zero Tracking. Zero Data Leaks.</span>
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                   <div className="space-y-4 border-l-2 border-primary/30 pl-8 transition-colors hover:border-primary">
                      <h4 className="text-base font-black uppercase tracking-widest text-primary">Local Compute</h4>
                      <p className="text-sm text-zinc-500 font-medium leading-relaxed">Processing happens at CPU-speed on your machine. No high-speed internet required for heavy binary operations.</p>
                   </div>
                   <div className="space-y-4 border-l-2 border-primary/30 pl-8 transition-colors hover:border-primary">
                      <h4 className="text-base font-black uppercase tracking-widest text-primary">Absolute Privacy</h4>
                      <p className="text-sm text-zinc-500 font-medium leading-relaxed">No "Wait Rooms" or queues. Your data stays in the browser's memory sandbox and vanishes on tab close.</p>
                   </div>
                </div>
             </div>
          </section>

          {/* Benefits Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 mb-16">
            <div className="flex flex-col items-center text-center p-6 studio-gradient rounded-[1rem]">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">Air-Gapped Privacy</h3>
              <p className="text-muted-foreground text-sm leading-relaxed italic font-medium">Files remain in your local workspace</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 studio-gradient rounded-[1rem]">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">GPU Accelerated</h3>
              <p className="text-muted-foreground text-sm leading-relaxed italic font-medium">Parallel hardware rendering</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 studio-gradient rounded-[1rem]">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">Encrypted Exit</h3>
              <p className="text-muted-foreground text-sm leading-relaxed italic font-medium">Memory is wiped on session end</p>
            </div>
          </section>
        </main>

        {/* Right Sponsor Sidebar */}
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <div className="p-8 rounded-2xl border-2 border-dashed border-primary/5 bg-primary/5 text-center mt-12 studio-gradient">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Verified Ad Space</p>
           </div>
        </aside>

      </div>

      <Footer />
    </div>
  );
};

export default Index;


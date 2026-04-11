import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ToolsGrid, { tools } from "@/components/ToolsGrid";
import Footer from "@/components/Footer";
import { ShieldCheck, Zap, Lock, Play, Pause, HelpCircle, Coffee, ShieldAlert, Scale, ArrowRight, MessageSquare } from "lucide-react";
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
              <span className="font-bold text-foreground">PrivateUtils</span>: {tools.length} private tools running 100% in your browser. 
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
                    <Lock className="h-4 w-4" /> 100% Browser Based
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 leading-none">
                    Engineered for your <span className="text-primary italic">eyes only.</span>
                 </h2>
                 <p className="text-xl text-muted-foreground font-medium mb-16 leading-relaxed max-w-3xl">
                    Most online tools are secretly data collection engines. We changed the paradigm. 
                    Your files strictly stay on your hardware, processed locally on your device. 
                    <br /><br />
                    Using hardware-accelerated WebAssembly, we process sensitive data instantly with <span className="text-foreground font-bold underline decoration-primary/50 underline-offset-8">Zero Logs. Zero Tracking. Zero Data Leaks.</span>
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                    <div className="space-y-4 border-l-2 border-primary/30 pl-8 transition-colors hover:border-primary">
                       <h3 className="text-base font-black uppercase tracking-widest text-primary">Air-Gapped Processing</h3>
                       <p className="text-sm text-muted-foreground font-medium leading-relaxed">Parallel rendering and complex logic happen entirely in your local RAM sandbox. Our site could be disconnected from the internet and still function.</p>
                    </div>
                    <div className="space-y-4 border-l-2 border-primary/30 pl-8 transition-colors hover:border-primary">
                       <h3 className="text-base font-black uppercase tracking-widest text-primary">Secure Compliance</h3>
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
          
          {/* Platform Navigation Hub: Quick-Access Footer Links */}
          <section id="platform-hub" className="mb-32 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col items-center text-center gap-6 mb-12">
               <div className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                  Platform Hub
               </div>
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-shadow-glow">
                  Quick <span className="text-primary italic">Escalation Hub</span>
               </h2>
               <p className="text-muted-foreground max-w-xl font-medium italic">
                  Instant access to our technical documentation, security protocols, and community support channels.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <Link to="/faq" className="group">
                  <div className="h-full p-8 rounded-[2rem] bg-muted/30 border border-primary/10 hover:border-primary/40 hover:bg-muted/50 transition-all duration-500 hover-glow relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                     <HelpCircle className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform duration-500" />
                     <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Technical FAQ</h3>
                     <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-6">Expert answers to common security and usage questions.</p>
                     <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                        Browse FAQ <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </Link>

               <Link to="/security-architecture" className="group">
                  <div className="h-full p-8 rounded-[2rem] bg-muted/30 border border-primary/10 hover:border-primary/40 hover:bg-muted/50 transition-all duration-500 hover-glow relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                     <ShieldCheck className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform duration-500" />
                     <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Architecture</h3>
                     <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-6">Deep dive into our client-side execution model.</p>
                     <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                        View Blueprint <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </Link>

               <Link to="/privacy-policy" className="group">
                  <div className="h-full p-8 rounded-[2rem] bg-muted/30 border border-primary/10 hover:border-primary/40 hover:bg-muted/50 transition-all duration-500 hover-glow relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                     <Scale className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform duration-500" />
                     <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Privacy Policy</h3>
                     <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-6">Our legally binding zero-data collection guarantee.</p>
                     <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                        Read Terms <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </Link>

               <a href="https://ko-fi.com/privateutils" target="_blank" rel="noopener noreferrer" className="group">
                  <div className="h-full p-8 rounded-[2rem] bg-primary/5 border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-500 hover-glow relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                     <Coffee className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform duration-500" />
                     <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Support Suite</h3>
                     <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-6">Help keep these professional tools free and private.</p>
                     <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                        Buy me a coffee <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </a>
            </div>
          </section>

          {/* High-Authority Text Anchor: The Future of In-Browser Computing */}
          <section id="authority-anchor" className="mt-32 pt-20 border-t border-primary/10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="max-w-5xl mx-auto space-y-12">
              <header className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground font-display leading-[0.9] italic text-shadow-glow">
                  PrivateUtils: The Future of <span className="text-primary italic">In-Browser Computing</span>
                </h2>
                <div className="h-1.5 w-32 bg-primary rounded-full" />
              </header>

              <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground space-y-8 text-lg leading-relaxed">
                <p className="text-xl font-medium text-foreground italic">
                  I built this tool because the software industry has spent the last decade optimized for data extraction rather than user utility. When I designed the architecture for the PrivateUtils suite, my core objective was to prove that complex media and data processing do not require a server-side round trip. 
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black uppercase tracking-widest text-primary font-display">The SaaS Latency Tax</h3>
                    <p>
                      Traditionally, web utilities follow a "Upload-Process-Download" lifecycle. This model introduces significant <strong>Main thread blocking</strong> risks on the server, massive egress costs, and—most importantly—unnecessary latency. By moving execution logic into the client-side <strong>Heap memory</strong>, we eliminate the network as a bottleneck. Whether you are scrubbing EXIF metadata or transcoding video, the speed is limited only by your locally available hardware threads.
                    </p>
                    <p>
                      Modern browsers have evolved into sophisticated execution environments. With the maturation of APIs like <strong>SharedArrayBuffer</strong> and the <strong>Web Crypto API</strong>, the browser is no longer just a document viewer; it is a high-performance sandbox. This transition to "Local-First" computing means that your CPU—not a remote cloud instance—is the primary engine of creation.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-black uppercase tracking-widest text-primary font-display">Zero-Trust by Design</h3>
                    <p>
                      The standard security model for SaaS is "Trust us with your data." We reject that premise entirely. In the PrivateUtils architecture, we utilize <strong>MIME type sniffing</strong> and client-side validation to ensure that artifacts are handled securely within the <strong>Browser Sandbox Lifecycle</strong>. Because no data is ever transmitted to a server, the risk of a data breach is mathematically reduced to 0%.
                    </p>
                    <p>
                      Even when dealing with complex operations like <strong>PDF generation</strong> or <strong>Image compression</strong>, our tools avoid creating persistent <strong>Client-side artifacts</strong> that could be recovered later. Everything stays in volatile RAM. Once you close the tab, the heap is garbage-collected, and the session is vaporized. This is not just a feature; it is a fundamental architectural guarantee.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 p-10 rounded-[2rem] border border-primary/10 mt-12">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-primary font-display mb-6">Hardware Acceleration via WASM</h3>
                  <p>
                    A common misconception is that JavaScript is too slow for heavy media lifting. While pure JS has its limitations, <strong>WebAssembly (WASM)</strong> allows us to run C++ and Rust code at near-native speeds directly in the browser. This allows PrivateUtils to handle heavy operations—like 4K video aspect adjustment or high-fidelity audio bass boosting—without the user experiencing significant input lag.
                  </p>
                  <p className="mt-4">
                    By leveraging modern instruction sets and hardware-accelerated rendering via the <strong>CanvasRenderingContext2D</strong>, we achieve performance parity with many standalone desktop applications. The future of the web is decentralized, local, and private. PrivateUtils is our contribution to that paradigm shift.
                  </p>
                </div>
              </div>
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


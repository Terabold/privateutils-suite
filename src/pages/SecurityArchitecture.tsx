import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Zap, Lock, Cpu, Database, Network, ServerOff } from "lucide-react";
import Footer from "@/components/Footer";
import SponsorSidebars from "@/components/SponsorSidebars";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const SecurityArchitecture = () => {
  const [darkMode, setDarkMode] = useState(() =>
    (typeof document !== "undefined" && document.documentElement.classList.contains("dark"))
  );

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1000px] px-6 py-12 grow">
          <div className="flex flex-col gap-12">
            <header className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Link to="/">
                <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:opacity-70 transition-all group">
                  <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                  Back to Tools
                </button>
              </Link>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-display uppercase italic text-foreground text-shadow-glow">
                Security <span className="text-primary italic">Architecture</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl">
                A deep dive into the "Client-Side Execution" model that powers PrivateUtils. 
                Learn how we process massive media files without ever letting a single byte leave your hardware.
              </p>
            </header>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-20 text-muted-foreground leading-relaxed">
              
              {/* Introduction Section */}
              <section className="space-y-6">
                <p className="text-xl md:text-2xl text-foreground font-medium italic border-l-4 border-primary pl-8 py-4 bg-primary/5 rounded-r-3xl">
                  When I designed the architecture for the PrivateUtils suite, I started with a radical premise: What if we treated the browser not as a thin client, but as a full-fledged, high-performance workstation? 
                </p>
                <p>
                  Most modern "online tools" are designed with a specific commercial goal: data harvesting. By requiring you to upload your files to their servers, they gain access to your proprietary algorithms, sensitive metadata, and personal artifacts. At PrivateUtils, we built a suite that reverses this paradigm. We don't want your data, and our architecture ensures we couldn't take it even if we wanted to. This is <strong>Zero-Trust by engineering</strong>, not just by policy.
                </p>
              </section>

              {/* Head 1: The Browser Sandbox Lifecycle */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground font-display m-0">
                    The Browser <span className="text-primary italic">Sandbox Lifecycle</span>
                  </h2>
                </div>
                <p>
                  The core of our security model is the modern browser sandbox. Every time you open a tool on PrivateUtils, the browser allocates a dedicated segment of <strong>Heap memory</strong> specifically for that tab. This is a highly restricted environment. It cannot access your file system directly, it cannot read your emails, and most importantly, it cannot communicate with other websites unless explicitly permitted.
                </p>
                <p>
                  When you upload a file—be it a 500MB video or a sensitive JSON artifact—the browser creates a <strong>Blob URL</strong> or an <strong>ArrayBuffer</strong>. This data exists only within the volatile RAM allocated to that specific tab. It does not hit the "disk" in the traditional sense of persistent storage. 
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                   <div className="p-6 rounded-3xl bg-muted/30 border border-primary/10">
                      <div className="text-primary font-black uppercase tracking-widest text-[10px] mb-4">Phase 1</div>
                      <h4 className="text-foreground font-bold mb-2">Ingestion</h4>
                      <p className="text-xs">File is converted to a local Blob. No network requests are fired. MIME type sniffing ensures safe payload handling.</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-muted/30 border border-primary/10">
                      <div className="text-primary font-black uppercase tracking-widest text-[10px] mb-4">Phase 2</div>
                      <h4 className="text-foreground font-bold mb-2">Manipulation</h4>
                      <p className="text-xs">Processing occurs in a Web Worker or WASM instance. The main thread remains unblocked for UI responsiveness.</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-muted/30 border border-primary/10">
                      <div className="text-primary font-black uppercase tracking-widest text-[10px] mb-4">Phase 3</div>
                      <h4 className="text-foreground font-bold mb-2">Vaporization</h4>
                      <p className="text-xs">Once the tab is closed, the heap is garbage-collected. All client-side artifacts are purged from memory instantly.</p>
                   </div>
                </div>
                <p>
                  This "volatility-first" approach means that PrivateUtils is inherently protected from standard data leak vectors. If a hacker were to compromise our web server, they would find nothing but static HTML, CSS, and some compiled WASM binaries. They would find zero user data, zero logs, and zero database entries because those things simply do not exist in our architecture.
                </p>
              </section>

              {/* Head 2: WebAssembly (WASM) for High-Performance Privacy */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground font-display m-0">
                    WebAssembly <span className="text-primary italic">for High-Performance Privacy</span>
                  </h2>
                </div>
                <p>
                  One of the biggest hurdles to client-side processing has always been performance. Processing high-resolution video or complex cryptography in standard JavaScript can lead to significant <strong>Main thread blocking</strong>, crashing the browser and providing a poor user experience. 
                </p>
                <p>
                  We solved this by leveraging <strong>WebAssembly (WASM)</strong>. WASM allows us to ship pre-compiled, high-performance binaries directly to your browser. For our media tools, we use `ffmpeg.wasm`, a direct port of the industry-standard FFmpeg library. This allows us to perform complex operations like video transcoding, audio normalization, and frame extraction directly on your CPU's hardware threads.
                </p>
                <div className="flex items-start gap-6 p-8 rounded-[2rem] bg-primary/5 border border-primary/10 my-10">
                   <Zap className="h-8 w-8 text-primary shrink-0 mt-1" />
                   <div>
                      <h4 className="text-foreground font-black uppercase tracking-widest text-sm mb-2">The Speed Advantage</h4>
                      <p className="text-sm">By utilizing <strong>SharedArrayBuffer</strong> and multi-threading via Web Workers, PrivateUtils can often process files faster than a cloud-based tool. There is no waiting for the upload to finish, no queue time for a shared server instance, and no waiting for the download. The "latency" is effectively the raw computation time of your own hardware.</p>
                   </div>
                </div>
                <p>
                   This architecture isn't just about speed; it's about security. When code runs in WASM, it runs in its own memory space, separate from the standard JavaScript heap. This provides an additional layer of isolation, ensuring that even the most complex processing tasks remain bounded and secure within their designated sandbox.
                </p>
              </section>

              {/* Head 3: Zero-Server Persistence */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <ServerOff className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground font-display m-0">
                    Zero-Server <span className="text-primary italic">Persistence</span>
                  </h2>
                </div>
                <p>
                  The "Persistence Paradox" of most software is that it tries to save everything forever. We do the opposite. PrivateUtils is designed around the principle of <strong>ephemerality</strong>. 
                </p>
                <p>
                  Most sites use databases, logs, and trackers to build a persistent profile of your activity. Our "database" is your browser's local RAM. Our "logs" are the ephemeral console outputs that disappear on refresh. We don't even use standard cookies for session management because there is no server-side session to manage.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 my-12">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Network className="h-4 w-4 text-primary" />
                         <span className="text-sm font-black uppercase tracking-widest text-foreground">No Ingress/Egress</span>
                      </div>
                      <p className="text-sm">We don't pay for massive cloud storage or data transfer because your data never leaves your computer. This makes our business model sustainable without needing to "monetize" your privacy.</p>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Database className="h-4 w-4 text-primary" />
                         <span className="text-sm font-black uppercase tracking-widest text-foreground">RAM Bound Only</span>
                      </div>
                      <p className="text-sm">Data processing is bound by your local hardware's RAM limits. This is why we implement strict safety checks on file sizes—to prevent the browser from crashing due to heap exhaustion.</p>
                   </div>
                </div>
                <p>
                  By ensuring that <strong>nothing is ever written to a disk outside the user's machine</strong>, we eliminate the entire category of "Data at Rest" security risks. There is no S3 bucket to misconfigure, no SQL database to inject, and no backup tapes to lose. Your data moves from your disk, to your RAM, and back to your disk—entirely under your control.
                </p>
              </section>

              <footer className="pt-20 border-t border-primary/10">
                 <div className="bg-muted/30 p-12 rounded-[3rem] text-center space-y-6">
                    <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground font-display">The Verdict</h3>
                    <p className="text-lg max-w-2xl mx-auto italic">
                       PrivateUtils is built on the belief that privacy should be the default, not an option. Our architecture is the physical manifestation of that belief. Every line of code, every WASM module, and every UI interaction is optimized to keep you in control of your digital artifacts.
                    </p>
                 </div>
              </footer>

            </div>
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>

      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default SecurityArchitecture;

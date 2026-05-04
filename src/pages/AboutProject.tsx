import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Zap, Lock, Cpu, Database, Network, ServerOff, Globe, Blocks, Code2 } from "lucide-react";
import Footer from "@/components/Footer";
import SponsorSidebars from "@/components/SponsorSidebars";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const AboutProject = () => {
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
        {/* SponsorSidebars position="left" removed */}

        <main className="container mx-auto max-w-[1000px] px-6 py-12 grow">
          <article className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col gap-6 ">
              <Link to="/">
                <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:opacity-70 transition-all group">
                  <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                  Back to Hub
                </button>
              </Link>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-display uppercase italic text-foreground text-shadow-glow">
                About the <span className="text-primary italic">Project</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                PrivateUtils is an experimental frontier in "No-Egress" computing—a philosophical and technical counter-movement to the era of data-extractive SaaS.
              </p>
            </header>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-16 text-muted-foreground leading-relaxed text-lg">
              
              <section className="space-y-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display italic">
                  The Mission: Reclaiming the <span className="text-primary">Local Workspace</span>
                </h2>
                <p>
                  I built PrivateUtils because the modern software industry has spent the last decade optimized for data extraction rather than user utility. We have been conditioned to believe that for any complex task—whether it's transcoding a video, scrubbing metadata, or generating a QR code—our data must first travel across the open internet to a remote server. This "Upload-Process-Download" lifecycle is not just a technical bottleneck; it is a fundamental privacy liability.
                </p>
                <p>
                  At PrivateUtils, our mission is to prove that the "Zero-Trust" model isn't just a policy—it's an engineering reality. My core objective was to architect a suite where your raw files never interact with a persistent storage layer or an external API. By moving the execution logic into the client-side heap memory, we've created a parallel workspace that functions even if you disconnect your network cable. This is the "No-Egress" revolution: software that respects your hardware as the ultimate authority over your artifacts.
                </p>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display m-0 italic">
                    The <span className="text-primary">SaaS Latency Tax</span>
                  </h2>
                </div>
                <p className="text-xl font-medium text-foreground italic border-l-4 border-primary pl-8 py-4 bg-primary/5 rounded-r-3xl">
                  "Most users perceive 'cloud processing' as a convenience. To an architect, it's an unnecessary latency tax on digital creation."
                </p>
                <p>
                  Traditionally, web utilities introduce massive egress costs and unnecessary input lag. When you upload a 500MB video to a cloud converter, you pay this tax twice: once in the bandwidth required to send the raw bitstream and again in the queue time required for a shared server instance to allocate resources. In many cases, the network handshake takes longer than the actual processing logic.
                </p>
                <p>
                  By leveraging hardware-accelerated WebAssembly and modern browser instruction sets, PrivateUtils eliminates this tax. Whether you are performing a 4K video aspect adjustment or a high-fidelity audio bass boost, the performance is limited only by your locally available hardware threads. We aren't just protecting your privacy; we are optimizing for raw speed. The browser is no longer a document viewer; it is a high-performance sandbox capable of near-native execution speeds.
                </p>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display m-0 italic">
                    Hardware Acceleration: <span className="text-primary">The FFmpeg Challenge</span>
                  </h2>
                </div>
                <p>
                  One of the most significant technical hurdles in building this suite was the implementation of `ffmpeg.wasm`. FFmpeg is the industry standard for media manipulation, but it was originally written in C/C++, designed to run on high-performance desktop kernels. Porting this monolithic library to the browser environment required more than just simple compilation; it required a fundamental re-imagining of how a browser handles multi-threaded binary execution.
                </p>
                <p>
                  We utilized Emscripten to transcompile FFmpeg into a WebAssembly module that can interact with the browser's <strong>SharedArrayBuffer</strong>. This allows the WASM binaries to perform complex, hardware-accelerated transcoding without blocking the main JavaScript thread. It was a rigorous exercise in memory management: we had to ensure that the WASM sandbox could handle massive PCM data arrays and RGBA buffers without exceeding the browser's heap limits. The result is a media engine that provides studio-grade precision while remaining entirely air-gapped from the network.
                </p>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Blocks className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display m-0 italic">
                    Zero-Trust by <span className="text-primary">Engineering</span>
                  </h2>
                </div>
                <p>
                  The standard security model for contemporary software is "Trust us with your data, we have an SSL certificate." At PrivateUtils, we reject the premise of "Trust" as a security feature. In our architecture, security is a physical constraint of the system. By utilizing <strong>MIME type sniffing</strong> and strict client-side validation, we ensure that artifacts are handled securely within the <strong>Browser Sandbox Lifecycle</strong>.
                </p>
                <p>
                  Because no data is ever transmitted to a server, the risk of a "Man-in-the-Middle" attack or a server-side breach is mathematically zero. Even if a malicious actor were to compromise our web servers, they would find nothing but static assets—HTML, CSS, and compiled WASM. There are no user databases to dump, no logs to scrape, and no session tokens to hijack. Your digital footprint on PrivateUtils exists for the duration of your tab's lifecycle and not a microsecond longer.
                </p>
                <div className="bg-muted/30 p-10 rounded-[2rem] border border-primary/10">
                  <h4 className="text-xl font-black uppercase tracking-widest text-primary mb-4">The Sandbox Lifecycle</h4>
                  <p className="text-sm">
                    Every operation—from SVG tree-shaking to QR code forging—occurs in a temporary, memory-mapped segment of your hardware's RAM. We've eliminated the concept of "Data at Rest." Your data is only "at work"—it is ingested, manipulated, and then the memory heap is vaporized. This "Vaporization" phase is critical; it ensures that even locally, your RAM is purged of sensitive artifacts as soon as the sandbox is closed.
                  </p>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Database className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display m-0 italic">
                    The Future of <span className="text-primary">Decentralized Tools</span>
                  </h2>
                </div>
                <p>
                  PrivateUtils is more than just a collection of utilities; it is a proof-of-concept for the next decade of the web. As browsers continue to evolve with APIs like the <strong>Web Crypto API</strong>, the <strong>FileSystem Access API</strong>, and increasingly powerful WASM runtimes, the need for centralized processing servers will continue to diminish. 
                </p>
                <p>
                  We are moving toward a decentralized, "Local-First" web where the user is the architect and the provider is merely the librarian. In this future, the privacy of your artifacts is not a toggle in a settings menu—it is the bedrock of the application's existence. PrivateUtils is our contribution to this paradigm shift. We invite you to explore the technical documentation, audit our client-side logic, and experience the speed and security of a truly private workspace.
                </p>
                <p>
                  Thank you for being part of this experiment in engineering and ethics. By choosing PrivateUtils, you are signaling to the software industry that privacy is not a luxury—it is a requirement. 
                </p>
              </section>

              <footer className="pt-12 border-t border-primary/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary italic">A</div>
                     <div>
                        <p className="text-sm font-black uppercase tracking-widest text-foreground">Lead Architect</p>
                        <p className="text-xs text-muted-foreground italic">PrivateUtils Project</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                    <Link to="/security-architecture">
                      <button className="px-6 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                        Technical Architecture
                      </button>
                    </Link>
                    <Link to="/faq">
                      <button className="px-6 py-2 rounded-xl bg-muted border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all">
                        Support Hive
                      </button>
                    </Link>
                  </div>
                </div>
              </footer>

            </div>
          </article>
        </main>

        <SponsorSidebars position="right" />
      </div>

      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default AboutProject;

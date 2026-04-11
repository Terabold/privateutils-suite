import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown, ShieldCheck, Zap, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SponsorSidebars from "@/components/SponsorSidebars";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

const faqData = [
  {
    question: "How does the browser handle large file buffers without crashing?",
    answer: "When you upload a large file, PrivateUtils utilizes the File API to read data as an ArrayBuffer or a Stream. By processing data in chunks and utilizing 'Transferable Objects', we can pass memory buffers between the main thread and Web Workers (or WASM instances) without performing expensive cloning operations. This keeps the memory footprint efficient and prevents 'Out of Memory' (OOM) errors during heavy processing."
  },
  {
    question: "Why is WASM faster than pure JS for video conversion?",
    answer: "Pure JavaScript is an interpreted, just-in-time (JIT) compiled language optimized for general-purpose scripting. Video conversion requires heavy multi-threaded compute, SIMD instructions, and direct memory manipulation. WebAssembly (WASM) allows us to run compiled C++ logic (like FFmpeg) at near-native speeds by providing a compact binary format that the browser can execute with minimal overhead."
  },
  {
    question: "How do you ensure my clipboard data isn't leaked to other tabs?",
    answer: "In the PrivateUtils architecture, clipboard interactions are scoped strictly to the user's explicit interaction. When you use the 'Quick Clipboard Hub', data is stored in the tab's local state—never in shared storage like LocalStorage or Cookies. This ensures that even if you have multiple tool tabs open, they remain isolated from each other via the browser's 'Same-Origin Policy' and sandbox isolation."
  },
  {
    question: "Does 'Client-Side Only' mean I don't need an internet connection?",
    answer: "Mostly, yes. Once the initial tool assets (HTML, CSS, JS, and WASM binaries) are cached by your browser, the logic resides entirely on your device. While the page requires an initial load, the actual processing of your data is 'air-gapped' from our servers. You could theoretically disconnect your Wi-Fi after the page loads and the tool would continue to function perfectly."
  },
  {
    question: "What is 'Heap Memory' and why does it matter for privacy?",
    answer: "Heap memory is the volatile storage area allocated by the browser for a tab's objects and data. Unlike 'Disk Storage', heap memory is erased as soon as the tab is closed or the page is refreshed. By keeping all your media and data in the heap, PrivateUtils ensures that no persistent 'client-side artifacts' are left behind on your machine after your session ends."
  },
  {
    question: "How do you handle 'Main thread blocking' during heavy tasks?",
    answer: "To keep the UI responsive, we offload all heavy computation (like image compression or hash generation) to Web Workers. These are background threads that operate independently of the UI thread. This prevents the 'page frozen' state common in poorly optimized web apps. When a task is complete, the worker sends a message back to the main thread with the resulting data artifact."
  },
  {
    question: "What is 'MIME type sniffing' in the context of security?",
    answer: "MIME type sniffing is a secondary security check where the browser inspects the actual byte-sequence of a file rather than just trusting the file extension. This prevents attacks where a malicious user (or file) masquerades as a safe format (like an SVG) but actually contains executable logic. Our tools perform strict validation before any processing begins."
  },
  {
    question: "Why don't you offer cloud storage for converted files?",
    answer: "Offering cloud storage would break our fundamental privacy promise: Zero Data Access. Cloud storage requires authentication, databases, and server-side persistence—all of which create attack vectors. By forcing the user to download results directly from their local RAM to their local disk, we ensure that we never touch or see your sensitive artifacts."
  },
  {
    question: "How does the 'Browser Sandbox Lifecycle' protect my device?",
    answer: "The sandbox is a security boundary that prevents web code from interacting with your operating system's internal processes. PrivateUtils operates entirely within this restricted layer. Even when we use WASM for hardware acceleration, the execution is bounded by the sandbox's security policies, ensuring your hardware remains safe from malicious interference."
  },
  {
    question: "Are WebAssembly binaries safe to run?",
    answer: "Yes. WASM binaries are executed within the same security sandbox as standard JavaScript. They do not have direct access to your hardware or file system beyond what the browser's APIs (like the File Picker) allow. They are simply an alternative, faster way to perform math and data manipulation."
  },
  {
    question: "How do you handle 'Zero-Server Persistence'?",
    answer: "Zero-server persistence means that our backend architecture contains no data about your files, your IP, or your activity. We use a static deployment model. When you 'Save' a file, we are simply triggering a local download from your RAM to your disk. No data ever travels back to us."
  },
  {
    question: "What is the maximum file size I can process?",
    answer: "The limit is determined by your device's available RAM and the browser's maximum heap size (usually ~2GB-4GB on modern desktop browsers). We implement safety gates on our tools to warn you if a file might exceed these hardware-defined limits to prevent a browser crash."
  },
  {
    question: "How do you protect against 'Billion Laughs' or XML Entity attacks?",
    answer: "For XML-based tools (like our SVG Optimizer), we use a custom parsing logic that specifically checks for and blocks external entity declarations (DOCTYPE/ENTITY). These patterns are recognized as security risks and are rejected before the browser's DOM parser even initiates."
  },
  {
    question: "Why do some high-resolution exports fail on mobile?",
    answer: "Mobile browsers have much stricter RAM constraints than desktop browsers. If a tool (like the Image Compressor) attempts to allocate a canvas larger than the mobile GPU's maximum texture size or exceeds the mobile heap limit, the browser will likely kill the process. We recommend using a desktop environment for ultra-high-resolution tasks."
  },
  {
    question: "Can I use PrivateUtils behind a corporate firewall?",
    answer: "Absolutely. Because all processing is local, PrivateUtils is highly compatible with strict corporate security policies. Since the tool doesn't need to 'call home' to process data, it bypasses many of the security concerns related to third-party data transmission."
  }
];

const Faq = () => {
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[900px] px-6 py-12 grow">
          <div className="flex flex-col gap-12">
            <header className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10 mb-2">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-display uppercase italic text-foreground text-shadow-glow">
                Technical <span className="text-primary italic">FAQ</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                Deep architectural answers for developers and privacy-conscious users. 
                Understand the mechanics of zero-server computation.
              </p>
            </header>

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqData.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-primary/10 rounded-[1.5rem] px-8 py-2 bg-muted/20 dark:bg-zinc-950/40 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all shadow-sm"
                  >
                    <AccordionTrigger className="text-left py-6 hover:no-underline group">
                      <div className="flex items-start gap-4 pr-4">
                        <span className="text-primary font-black font-display italic text-lg leading-none mt-1">Q.</span>
                        <span className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-8 pt-2">
                      <div className="flex items-start gap-4">
                        <span className="text-muted-foreground/30 font-black font-display italic text-lg leading-none mt-1">A.</span>
                        <div className="space-y-4">
                           <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-medium">
                              {item.answer}
                           </p>
                           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 w-fit">
                              <ShieldCheck className="h-3 w-3 text-primary" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Verified Architecture</span>
                           </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <section className="mt-20 p-10 rounded-[3rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="h-40 w-40 text-primary" />
               </div>
               <div className="relative z-10 flex flex-col items-center text-center gap-6">
                  <Info className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-foreground font-display">Still Curious?</h3>
                  <p className="max-w-xl text-muted-foreground font-medium leading-relaxed italic">
                    If you have deeper questions about our implementation or want to review our WASM modules, 
                    check our <Link to="/security-architecture" className="text-primary underline underline-offset-4 hover:opacity-80">Security Architecture</Link> deep dive or browse our codebase on GitHub.
                  </p>
                  <Link to="/">
                    <button className="h-12 px-8 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                      Browse Tool Suite
                    </button>
                  </Link>
               </div>
            </section>
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>

      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default Faq;

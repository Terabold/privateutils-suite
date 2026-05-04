import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Zap, Lock, Cpu, Database, Network, ServerOff, Code2, Layers, CpuIcon, Binary } from "lucide-react";
import Footer from "@/components/Footer";
import SponsorSidebars from "@/components/SponsorSidebars";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const TechnicalArchitecture = () => {
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
            <header className="flex flex-col gap-6">
              <Link to="/">
                <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:opacity-70 transition-all group">
                  <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                  Back to Hub
                </button>
              </Link>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-display uppercase italic text-foreground text-shadow-glow">
                Technical <span className="text-primary italic">Architecture</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                A deep dive into the PrivateUtils rendering pipeline, focusing on synchronous SSR hydration and Largest Contentful Paint (LCP) optimization.
              </p>
            </header>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-16 text-muted-foreground leading-relaxed text-lg">
              
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display m-0 italic">
                    The Rendering <span className="text-primary">Pipeline</span>
                  </h2>
                </div>
                <p>
                  Most modern React applications suffer from "The Hydration Gap"—a period where the user sees a loading spinner or a blank screen while the JavaScript bundle downloads, parses, and executes. For a privacy suite, this delay is unacceptable. I architected the PrivateUtils rendering pipeline to utilize <strong>Synchronous Server-Side Rendering (SSR)</strong> on the edge, ensuring that the Largest Contentful Paint (LCP) occurs the moment the HTML stream hits the browser.
                </p>
                <div className="p-8 rounded-[2rem] bg-muted/30 border border-primary/10 my-10 font-mono text-sm overflow-x-auto">
                  <div className="text-primary font-black uppercase tracking-widest text-[10px] mb-4">// PrivateUtils Rendering Lifecycle</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-bold">01.</span>
                      <span>Edge Request (Cloudflare Workers)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-bold">02.</span>
                      <span>Synchronous `renderToString` Execution</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-bold">03.</span>
                      <span>Full HTML Response (SEO & LCP Optimized)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-bold">04.</span>
                      <span>Parallel Hydration & WASM Preloading</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display m-0 italic">
                    The Hydration <span className="text-primary">Bridge</span>
                  </h2>
                </div>
                <p>
                  Our `entry-server.tsx` is the engine of our SSR strategy. Unlike standard SPA deployments, we do not ship an empty `div#root`. Instead, we pre-render the entire component tree into a static string. This ensures that the Google crawler and or any user agent receives the full content immediately, without waiting for hydration.
                </p>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <pre className="relative p-6 rounded-2xl bg-zinc-950 border border-white/5 text-xs text-secondary-foreground overflow-x-auto">
                    <code>{`// entry-server.tsx
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

export function render(url: string, helmetContext: any = {}) {
  const html = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  );
  return { html };
}`}</code>
                  </pre>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Binary className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display m-0 italic">
                    The <span className="text-primary">[`ssrLazy`] Pattern</span>
                  </h2>
                </div>
                <p>
                  A critical challenge with SSR is handling code-splitting. If we use standard `React.lazy`, the server cannot render the component because it is wrapped in a Promise. To solve this, I developed a custom `ssrLazy` helper. It utilizes Vite's <strong>eager glob import</strong> on the server to synchronously resolve pages, while maintaining asynchronous chunks on the client.
                </p>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <pre className="relative p-6 rounded-2xl bg-zinc-950 border border-white/5 text-xs text-secondary-foreground overflow-x-auto">
                    <code>{`// App.tsx
const eagerPages = import.meta.env.SSR 
  ? import.meta.glob('./pages/*.tsx', { eager: true }) 
  : {};

const ssrLazy = (filename: string, importFn: () => Promise<any>) => {
  if (import.meta.env.SSR) {
    const module = eagerPages[\`./pages/\${filename}\`] as any;
    return module ? module.default : () => null;
  }
  return lazy(importFn);
};`}</code>
                  </pre>
                </div>
                <p>
                   This pattern eliminates the "Flash of Loading State" during initial navigation. The user transitions from a fully rendered server-side page to a fully interactive client-side application with zero perceptible friction.
                </p>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <CpuIcon className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-display m-0 italic">
                    Optimization for <span className="text-primary">Edge Integrity</span>
                  </h2>
                </div>
                <p>
                  Deploying this architecture on Cloudflare Pages requires a highly optimized build. By ensuring that our React tree is physically present in the initial HTML, we achieve near-perfect SEO scores and eliminate the Cumulative Layout Shift (CLS) typically associated with dynamic content loading. 
                </p>
                <p>
                   Furthermore, our <strong>Theme Orchestrator</strong> ensures that the CSS variables and theme classes are applied during the server pass. This prevents the "Flash of Incorrect Theme" (FOIT) on dark-mode devices. Every line of our technical architecture is optimized to maintain the "Forge-Like" precision of our brand while providing the highest possible security guarantees.
                </p>
              </section>

              <footer className="pt-12 border-t border-primary/10">
                <div className="bg-muted/30 p-12 rounded-[3rem] space-y-6">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground font-display italic">Architect's Summary</h3>
                  <p className="italic">
                    "PrivateUtils isn't just a set of tools; it's a demonstration of modern web engineering pushed to its limits. By fusing synchronous SSR with air-gapped WASM execution, we've created a platform that is as fast as it is private."
                  </p>
                  <div className="flex gap-4 pt-4">
                    <Link to="/about">
                      <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                        About the Project
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

export default TechnicalArchitecture;

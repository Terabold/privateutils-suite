import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, RefreshCw, Hash, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const SlugForge = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const generateSlug = useCallback((text: string, sep: string, lower: boolean) => {
    let slug = text
      .normalize("NFD") // split accented characters into their base characters and diacritical marks
      .replace(/[\u0300-\u036f]/g, "") // remove diacritical marks
      .replace(/[^a-zA-Z0-9\s]/g, "") // remove all non-alphanumeric characters except spaces
      .trim()
      .replace(/\s+/g, sep); // replace spaces with separator

    if (lower) slug = slug.toLowerCase();
    setOutput(slug);
  }, []);

  useEffect(() => {
    generateSlug(input, separator, lowercase);
  }, [input, separator, lowercase, generateSlug]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow overflow-visible">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  URL Slug <span className="text-primary italic">Studio</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  URL-Friendly Slugs · Regex Sanitization · Instant Export
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start overflow-visible">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-4 lg:p-6 border-2 border-primary/5">
                  <CardContent className="p-0 space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">Source Content</p>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter article title or text here..."
                            className="w-full h-32 bg-background/20 border border-primary/10 rounded-xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all custom-scrollbar shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">Forge Output</p>
                        {/* Mobile Inline Ad */}
                        <ToolAdBanner />
                        <div className="relative group">
                            <div className="w-full min-h-[60px] bg-background/40 border border-primary/20 rounded-xl p-4 text-primary font-black tracking-tight flex items-center shadow-inner break-all">
                                {output || <span className="opacity-20 italic font-medium">awaiting input...</span>}
                            </div>
                            <Button
                                onClick={copy}
                                disabled={!output}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 text-[9px] font-black uppercase rounded-2xl shadow-lg transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-primary text-primary-foreground border border-primary/20"}`}
                            >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Slug Settings</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Separator</p>
                        <div className="flex gap-2">
                            {["-", "_", "."].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSeparator(s)}
                                    className={`h-8 w-8 rounded-lg border transition-all font-black ${separator === s ? "bg-primary text-primary-foreground border-primary" : "border-primary/10 hover:bg-primary/10 text-muted-foreground"}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Transform</p>
                        <label className="flex items-center gap-3 cursor-pointer group">
                             <input
                                type="checkbox"
                                checked={lowercase}
                                onChange={e => setLowercase(e.target.checked)}
                                className="w-4 h-4 rounded-lg bg-background border-primary/20 accent-primary"
                             />
                             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Force Lowercase</span>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-primary/5">
                         <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 space-y-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-primary opacity-60">Pro Tip</p>
                            <p className="text-[10px] text-muted-foreground font-medium italic">Accented characters like 'é' are automatically simplified to 'e'.</p>
                         </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <ToolExpertSection
              title="URL Slug Studio"
              description="Slug Forge creates URL-friendly strings from arbitrary text. It handles character normalization, special character removal, and whitespace mapping to your preferred separator."
              transparency="All text normalization and regex stripping occurs strictly on your device. We use the ECMAScript String.normalize() method to ensure high-fidelity 'slugification' without external libraries or server-side calls."
              limitations="Extremely long input strings (over 5,000 characters) may result in truncated output on some mobile browsers due to memory constraints on string manipulation."
              accent="sky"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default SlugForge;

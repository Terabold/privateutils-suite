import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Fingerprint, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

async function generateHash(text: string, algorithm: string) {
  if (!text) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const ALGORITHMS = [
  { id: 'SHA-256', label: 'SHA-256', desc: 'Secure & Standard' },
  { id: 'SHA-384', label: 'SHA-384', desc: 'High Security' },
  { id: 'SHA-512', label: 'SHA-512', desc: 'Maximum Security' },
  { id: 'SHA-1', label: 'SHA-1', desc: 'Legacy / Checksum' }
];

const HashLab = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const computeHashes = useCallback(async (text: string) => {
    setInput(text);
    if (!text) {
      setHashes({});
      return;
    }
    const results: Record<string, string> = {};
    for (const algo of ALGORITHMS) {
      results[algo.id] = await generateHash(text, algo.id);
    }
    setHashes(results);
  }, []);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    computeHashes(text);
  };

  usePasteFile(handleFile);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-privacy transition-all duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow overflow-visible">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Hash <span className="text-primary italic">Lab</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Cryptographic Checksums • Secure Hashing • NIST Compliant
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-visible">
              <div className="space-y-6">

                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-8">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">Input Data</p>
                    </div>
                    <textarea
                      value={input}
                      onChange={(e) => computeHashes(e.target.value)}
                      placeholder="Enter string to hash..."
                      className="min-h-[120px] w-full resize-none bg-background/20 border border-border/30 rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/30 leading-relaxed custom-scrollbar shadow-inner text-foreground"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => computeHashes("")} className="text-[9px] font-black uppercase tracking-widest h-8 rounded-xl border-border/30 hover:bg-destructive/10 hover:text-destructive transition-all">Clear</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ALGORITHMS.map((algo) => (
                    <Card key={algo.id} className="glass-morphism border-primary/10 rounded-xl shadow-md bg-card overflow-x-clip group">
                      <div className="bg-primary/5 p-3 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Fingerprint className="h-3 w-3" />
                          </div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-primary leading-none">{algo.label}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!hashes[algo.id]}
                          onClick={() => copy(hashes[algo.id], algo.id)}
                          className="h-6 px-2 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-primary/20 text-primary border border-primary/10 transition-all"
                        >
                          {copiedKey === algo.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <CardContent className="p-3">
                        <div className="bg-background/20 border border-border/30 rounded-2xl p-2 min-h-[40px] flex items-center shadow-inner">
                          <code className="text-[10px] font-mono break-all text-foreground/70 line-clamp-2">
                            {hashes[algo.id] || <span className="opacity-20 italic">Waiting for input...</span>}
                          </code>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-x-clip shadow-xl bg-card border-border/20">
                  <div className="bg-primary/5 p-5 border-b border-primary/10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Security Stats</h3>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-foreground/80">Browser Crypto Subsystem</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="text-foreground/80">Zero Network Latency</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-30">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-foreground">One-Way Logic</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <p className="text-[9px] leading-relaxed text-muted-foreground/60 italic font-black uppercase tracking-widest opacity-40">
                        Hashes are deterministic digital fingerprints. They cannot be reversed to reveal the original input.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Hash Lab Forge"
              description="The Hash Lab is a cryptographic utility designed to generate one-way digital fingerprints (hashes) using NIST-compliant algorithms like SHA-256, SHA-384, and SHA-512."
              transparency="Every calculation is performed using your browser's native Web Crypto API. This means that your secret keys, passwords, or sensitive text strings are processed entirely in-memory on your own machine. No data is ever transmitted or logged."
              limitations="Hashing is a one-way mathematical function and cannot be reversed to reveal the original input. For extremely large files (500MB+), the browser may experience temporary processing latency as it reads the data stream from the local filesystem into the crypto buffer."
              accent="rose"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />

      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-x-clip">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default HashLab;

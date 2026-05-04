import { useState, useCallback, useMemo } from "react";
import { FileText, Copy, Trash2, Clock, Hash, AlignLeft, Type, Zap, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import ToolBottomDescription from '@/components/ToolBottomDescription';
import SponsorSidebars from "@/components/SponsorSidebars";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import Footer from "@/components/Footer";

const WordCounter = () => {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? text.split(/\n+/).filter(Boolean).length : 0;
    const readingTime = Math.ceil(words / 200); // 200 wpm

    return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime };
  }, [text]);

  const copyToClipboard = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Text captured to clipboard");
  }, [text]);

  return (
    <div className="w-full font-sans selection:bg-primary/20 relative">
      <div className="flex justify-center items-start w-full relative">
        {/* SponsorSidebars position="left" removed */}
        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-primary/20 hover:bg-primary/10 transition-all group/back bg-background/50 backdrop-blur-md shadow-xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic font-display">
                  Word <span className="text-primary italic">Counter Engine</span>
                </h1>
                <p className="text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  High-fidelity text analysis & statistics
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <Card className="glass-morphism border-primary/10 overflow-hidden shadow-2xl rounded-xl">
                  <CardContent className="p-0">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your content here for forensic analysis..."
                      className="w-full h-[400px] p-8 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed placeholder:opacity-20 outline-none"
                    />
                  </CardContent>
                  <div className="bg-primary/5 border-t border-primary/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button onClick={copyToClipboard} variant="ghost" size="sm" className="h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 rounded-lg">
                        <Copy className="h-3.5 w-3.5" /> Copy Artifact
                      </Button>
                      <Button onClick={() => setText("")} variant="ghost" size="sm" className="h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 text-destructive/70 rounded-lg">
                        <Trash2 className="h-3.5 w-3.5" /> Purge Memory
                      </Button>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                       <ShieldCheck className="h-3.5 w-3.5 text-primary/40" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">100% Local-First Engine</span>
                    </div>
                  </div>
                </Card>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 shadow-xl overflow-hidden rounded-xl">
                  <div className="bg-primary/5 h-12 px-6 border-b border-primary/10 flex items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Telemetry</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <StatRow icon={<Type className="h-4 w-4" />} label="Characters" value={stats.chars} />
                    <StatRow icon={<AlignLeft className="h-4 w-4" />} label="Words" value={stats.words} />
                    <StatRow icon={<Hash className="h-4 w-4" />} label="Sentences" value={stats.sentences} />
                    <StatRow icon={<Clock className="h-4 w-4" />} label="Read Time" value={`${stats.readingTime} min`} />
                  </CardContent>
                </Card>
              </aside>
            </div>

            <ToolBottomDescription toolId="/word-counter" />
          </div>
        </main>
        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-center justify-between group/stat">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover/stat:bg-primary/10 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</span>
    </div>
    <span className="text-sm font-black font-mono text-foreground">{value}</span>
  </div>
);

export default WordCounter;
